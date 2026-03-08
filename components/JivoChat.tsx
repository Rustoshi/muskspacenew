"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

export default function JivoChat() {
    const pathname = usePathname();

    // Hide on admin pages
    if (pathname?.startsWith("/admin")) return null;

    return (
        <Script
            src="//code.jivosite.com/widget/1yCfN5KP9n"
            strategy="afterInteractive"
        />
    );
}
