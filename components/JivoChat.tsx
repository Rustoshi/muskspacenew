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

            // Target everything that looks like Jivo
            const selectors = [
                '#jivo-iframe-container',
                '.jivo-iframe-container',
                '[id^="jivo-"]',
                '[id*="jivo"]',
                '[class^="jivo-"]',
                '[class*="jivo"]',
                'jdiv'
            ];

            const styles = `
                ${selectors.join(',\n')} {
                    bottom: 115px !important;
                    top: auto !important;
                    transform: none !important;
                }
            `;

            let styleTag = document.getElementById("jivo-custom-style-forced");
            if (!styleTag) {
                styleTag = document.createElement("style");
                styleTag.id = "jivo-custom-style-forced";
                document.head.appendChild(styleTag);
            }
            styleTag.innerHTML = styles;

            // Also try to find elements and set style directly
            selectors.forEach(sel => {
                document.querySelectorAll(sel).forEach(el => {
                    if (el instanceof HTMLElement) {
                        el.style.setProperty('bottom', '115px', 'important');
                        el.style.setProperty('top', 'auto', 'important');
                        el.style.setProperty('transform', 'none', 'important');
                        el.style.setProperty('display', 'block', 'important');
                    }
                });
            });
        };

        // Initial apply
        applyForcedStyles();

        // Very aggressive observer
        const observer = new MutationObserver((mutations) => {
            applyForcedStyles();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class', 'id']
        });

        // Also a failsafe interval for the first 15 seconds
        const interval = setInterval(applyForcedStyles, 500);
        setTimeout(() => clearInterval(interval), 15000);

        window.addEventListener('resize', applyForcedStyles);

        return () => {
            observer.disconnect();
            clearInterval(interval);
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
