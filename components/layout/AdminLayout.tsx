"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function getSectionLabel(pathname: string) {
    if (pathname.startsWith("/admin/stores")) return "MAGASINS";
    if (pathname.startsWith("/admin/users")) return "UTILISATEURS";
    if (pathname.startsWith("/admin/orders")) return "COMMANDES";
    if (pathname.startsWith("/admin/products")) return "PRODUITS";
    if (pathname.startsWith("/admin/product-config")) return "CONFIG PRODUITS";
    if (pathname.startsWith("/admin/support")) return "SUPPORT";
    if (pathname.startsWith("/admin/analytics")) return "ANALYTIQUES";
    if (pathname.startsWith("/admin/settings")) return "PARAMÈTRES";
    return "ADMIN";
}

function isActivePath(activePath: string, href: string) {
    return activePath === href || activePath.startsWith(`${href}/`) || activePath.startsWith(`${href}?`);
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname() ?? "/admin";

    const sectionLabel = useMemo(() => getSectionLabel(pathname), [pathname]);

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navIndicatorRef = useRef<HTMLDivElement | null>(null);
    const navWrapperRef = useRef<HTMLDivElement | null>(null);
    const navItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    // Update indicator position based on active nav item
    useEffect(() => {
        const updateIndicatorPosition = () => {
            if (!navIndicatorRef.current || !navWrapperRef.current) return;

            const activeIndex = (() => {
                if (pathname === "/admin") return 0;
                if (isActivePath(pathname, "/admin/stores")) return 1;
                if (isActivePath(pathname, "/admin/users")) return 2;
                if (isActivePath(pathname, "/admin/orders")) return 3;
                if (isActivePath(pathname, "/admin/products")) return 4;
                if (isActivePath(pathname, "/admin/product-config")) return 5;
                if (isActivePath(pathname, "/admin/support")) return 6;
                if (isActivePath(pathname, "/admin/analytics")) return 7;
                if (isActivePath(pathname, "/admin/settings")) return 8;
                return -1;
            })();

            if (activeIndex === -1) {
                navIndicatorRef.current.style.opacity = "0";
                return;
            }

            const activeItem = navItemRefs.current[activeIndex];
            if (!activeItem) return;

            const wrapperRect = navWrapperRef.current.getBoundingClientRect();
            const itemRect = activeItem.getBoundingClientRect();

            const left = itemRect.left - wrapperRect.left;
            const width = itemRect.width;

            navIndicatorRef.current.style.opacity = "1";
            navIndicatorRef.current.style.left = `${left}px`;
            navIndicatorRef.current.style.width = `${width}px`;
        };

        const rafId = requestAnimationFrame(() => {
            updateIndicatorPosition();
        });

        window.addEventListener("resize", updateIndicatorPosition);
        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("resize", updateIndicatorPosition);
        };
    }, [pathname]);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    const navItems = [
        { href: "/admin", label: "TABLEAU DE BORD" },
        { href: "/admin/stores", label: "MAGASINS" },
        { href: "/admin/users", label: "UTILISATEURS" },
        { href: "/admin/orders", label: "COMMANDES" },
        { href: "/admin/products", label: "PRODUITS" },
        { href: "/admin/product-config", label: "CONFIG PRODUITS" },
        { href: "/admin/support", label: "SUPPORT" },
        { href: "/admin/analytics", label: "ANALYTIQUES" },
        { href: "/admin/settings", label: "PARAMÈTRES" },
    ];

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div className="admin-container">
                    <Link href="/admin" className="admin-logo" title="Monkey Print — Administration">
                        <span className="admin-logo-mark">
                            <Image src="/logo.png" alt="" width={36} height={36} style={{ objectFit: "contain" }} />
                        </span>
                        <span className="admin-logo-text">
                            <span className="admin-logo-title">Monkey Print</span>
                            <span className="admin-section">{sectionLabel}</span>
                        </span>
                    </Link>

                    <nav className="admin-nav">
                        <div className="admin-nav-indicator-wrapper" ref={navWrapperRef}>
                            {navItems.map((item, index) => {
                                const isActive = index === 0
                                    ? pathname === item.href
                                    : isActivePath(pathname, item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`admin-nav-link ${isActive ? "active" : ""}`}
                                        ref={(el) => { navItemRefs.current[index] = el; }}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                            <div className="admin-nav-indicator" ref={navIndicatorRef}></div>
                        </div>
                    </nav>

                    <div className="admin-actions">
                        <button
                            className="admin-user-btn"
                            aria-label="Admin Account"
                            onClick={() => router.push("/dashboard")}
                            title="Retour au tableau de bord"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </div>

                    <button type="button" className="admin-mobile-menu-btn" onClick={() => setMobileMenuOpen(true)} aria-label="Menu">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path d="M3 12H21M3 6H21M3 18H21" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </header>

            {mobileMenuOpen && (
                <>
                    <div className="admin-mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
                    <div className={`admin-mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
                        <div className="admin-mobile-menu-header">
                            <button type="button" className="admin-mobile-menu-close" onClick={() => setMobileMenuOpen(false)} aria-label="Fermer">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>

                        <nav className="admin-mobile-nav">
                            {navItems.map((item) => {
                                const isActive = item.href === "/admin"
                                    ? pathname === item.href
                                    : isActivePath(pathname, item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`admin-mobile-nav-item ${isActive ? "active" : ""}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="admin-mobile-logo">
                            <Image src="/logo.png" alt="Monkey Print Admin" width={180} height={60} style={{ objectFit: "contain" }} />
                        </div>
                    </div>
                </>
            )}

            <main className="admin-main">
                <div className="admin-container">{children}</div>
            </main>
        </div>
    );
}
