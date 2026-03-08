import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import MetricCard from "@/components/admin/MetricCard";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { QuickActions, UsersTable, TransactionsTable, InventoryTable, OrdersTable } from "@/components/admin/DashboardTables";

export default async function AdminDashboard() {
    // Ensure session is valid
    await getServerSession(authOptions);

    // Connect DB
    await dbConnect();

    // 1. Fetch Aggregated Metrics
    const totalUsersCount = await User.countDocuments({ role: 'user' });
    const pendingTransactionsCount = await Transaction.countDocuments({ status: 'pending' });
    const pendingKycCount = await User.countDocuments({ kycStatus: 'pending' });

    // Real metrics for shopping
    const totalInventoryCount = await Product.countDocuments();
    const pendingOrdersCount = await Order.countDocuments({ status: { $in: ['Pending', 'Processing', 'Awaiting Payment'] } });

    // 2. Fetch Tabular Data
    const rawUsers = await User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(100).lean();
    const serializedUsers = rawUsers.map(u => ({
        ...u,
        _id: u._id?.toString(),
    }));

    const rawTransactions = await Transaction.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(50).lean();
    const serializedTransactions = rawTransactions.map(t => ({
        ...t,
        _id: t._id?.toString(),
        createdAt: t.createdAt?.toISOString()
    }));

    const rawInventory = await Product.find().sort({ createdAt: -1 }).limit(10).lean();
    const serializedInventory = rawInventory.map(p => ({
        ...p,
        _id: p._id?.toString(),
        createdAt: p.createdAt?.toISOString(),
        updatedAt: p.updatedAt?.toISOString()
    }));

    const rawOrders = await Order.find({ status: { $in: ['Pending', 'Processing', 'Awaiting Payment'] } })
        .populate('user', 'firstName lastName email')
        .populate('product', 'model')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

    const serializedOrders = rawOrders.map((o: any) => ({
        ...o,
        _id: o._id?.toString(),
        user: o.user ? { firstName: o.user.firstName, lastName: o.user.lastName, email: o.user.email } : null,
        product: o.product ? { model: o.product.model } : null,
        createdAt: o.createdAt?.toISOString(),
        updatedAt: o.updatedAt?.toISOString()
    }));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Platform Overview Metrics */}
            <section>
                <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/50 mb-4" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>Platform Overview</h2>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <MetricCard
                        title="Total Users"
                        value={totalUsersCount.toLocaleString()}
                    />
                    <MetricCard
                        title="Pending Transactions"
                        value={pendingTransactionsCount.toLocaleString()}
                        trend={pendingTransactionsCount > 0 ? { value: "Action Required", positive: false } : undefined}
                    />
                    <MetricCard
                        title="Pending KYC"
                        value={pendingKycCount.toLocaleString()}
                        trend={pendingKycCount > 0 ? { value: "Action Required", positive: false } : undefined}
                    />
                    <MetricCard
                        title="Total Inventory"
                        value={totalInventoryCount.toLocaleString()}
                    />
                    <MetricCard
                        title="Orders"
                        value={pendingOrdersCount.toLocaleString()}
                    />
                </div>
            </section>

            {/* Quick Actions */}
            <QuickActions />

            {/* Data Tables */}
            <UsersTable initialUsers={serializedUsers} />
            <TransactionsTable transactions={serializedTransactions} />
            <InventoryTable initialInventory={serializedInventory} />
            <OrdersTable initialOrders={serializedOrders} />

        </div>
    );
}
