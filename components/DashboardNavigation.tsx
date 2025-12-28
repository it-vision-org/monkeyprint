'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type DashboardNavItem = {
    href: string;
    label: string;
    icon: React.ReactNode;
    children?: DashboardNavItem[];
};

const dashboardNavItems: DashboardNavItem[] = [
    {
        href: '/dashboard/apercu',
        label: 'Aperçu',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        )
    },
    {
        href: '/dashboard/produits',
        label: 'Produits',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        )
    },
    {
        href: '/dashboard/commandes',
        label: 'Commandes',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        )
    },
    {
        href: '/dashboard/portefeuille',
        label: 'Portefeuille',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 10H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        )
    },
    {
        href: '/dashboard/compte',
        label: 'Compte',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        )
    }
];

type DashboardNavigationProps = {
    currentPath?: string;
    onNavigate?: () => void;
    className?: string;
    itemClassName?: string;
    activeItemClassName?: string;
    renderCommandesToggle?: (isOpen: boolean, toggle: () => void) => React.ReactNode;
};

export default function DashboardNavigation({
    currentPath,
    onNavigate,
    className = '',
    itemClassName = '',
    activeItemClassName = '',
    renderCommandesToggle
}: DashboardNavigationProps) {
    const pathname = usePathname();
    const activePath = currentPath || pathname;

    return (
        <nav className={className}>
            {dashboardNavItems.map((item, index) => {
                const isActive = activePath === item.href || activePath?.startsWith(item.href);
                const isCommandes = item.href === '/dashboard/commandes' && renderCommandesToggle;

                if (isCommandes && renderCommandesToggle) {
                    // For commandes with toggle functionality, render custom toggle
                    return <div key={item.href}>{renderCommandesToggle(false, () => {})}</div>;
                }

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`${itemClassName} ${isActive ? activeItemClassName : ''}`}
                        onClick={onNavigate}
                    >
                        {item.icon}
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}

// Export nav items for use in headers
export { dashboardNavItems };
export type { DashboardNavItem };

