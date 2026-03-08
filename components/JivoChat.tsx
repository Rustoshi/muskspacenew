"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";

export default function JivoChat() {
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Function to apply forced styles
        const applyForcedStyles = () => {
            const isMobile = window.innerWidth <= 768;
            if (!isMobile) return;

            const styles = `
                #jivo-iframe-container,
                #jivo-iframe-container iframe,
                jdiv[class*="container"],
                jdiv[class*="label"],
                div[id^="jivo-"],
                .jivo-iframe-container {
                    bottom: 112px !important;
                }
            `;

            let styleTag = document.getElementById("jivo-custom-style");
            if (!styleTag) {
                styleTag = document.createElement("style");
                styleTag.id = "jivo-custom-style";
                document.head.appendChild(styleTag);
            }
            styleTag.innerHTML = styles;
        };

        // Initial apply
        applyForcedStyles();

        // Observe DOM changes to catch JivoChat injection
        const observer = new MutationObserver(() => {
            applyForcedStyles();
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Handle resize
        window.addEventListener('resize', applyForcedStyles);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', applyForcedStyles);
        };
    }, []);

    // Hide on admin pages
    if (pathname?.startsWith("/admin")) return null;

    return (
        <Script
            src="//code.jivosite.com/widget/1yCfN5KP9n"
            strategy="afterInteractive"
        />
    );
}
