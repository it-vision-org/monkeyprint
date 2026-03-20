'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Home, Search, ShoppingCart, User, PlusCircle } from 'lucide-react';
import { useCart } from '../providers/CartContext';

export default function MobileBottomNav() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { items } = useCart();

    // Don't show on product detail or cart pages where we have specific sticky footers
    // or if we want to prioritize the specific page actions.
    // Actually, widespread use is better for "App feel". 
    // Let's hide it ONLY if we are specifically in a flow where screen real estate is critical
    // or if there's a conflict.
    // For now, I'll show it everywhere except maybe checkout.
    if (pathname.includes('/checkout')) return null;

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

    const navItems = [
        { label: 'Accueil', href: '/', icon: Home },
        { label: 'Boutiques', href: '/stores', icon: Search },
        // Central specific action (optional)
        { label: 'Créer', href: '/create-shop', icon: PlusCircle, isPrimary: true },
        { label: 'Panier', href: '/stores', icon: ShoppingCart, count: cartCount },
        { label: session ? 'Compte' : 'Connexion', href: session ? '/dashboard' : '/login', icon: User },
    ];

    return (
        <nav className="mobile-bottom-nav">
            <style jsx global>{`
                .mobile-bottom-nav {
                    display: none;
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: white;
                    border-top: 1px solid #e5e7eb;
                    padding: 8px 16px;
                    padding-bottom: max(8px, env(safe-area-inset-bottom));
                    z-index: 999;
                    box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05);
                    justify-content: space-around;
                    align-items: flex-end;
                    height: 60px;
                }
                
                @media (max-width: 768px) {
                    .mobile-bottom-nav {
                        display: flex;
                    }
                    /* Add padding to body so content isn't hidden */
                    body {
                        padding-bottom: 70px !important;
                    }
                }

                .nav-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-decoration: none;
                    color: #64748b;
                    font-size: 10px;
                    font-weight: 500;
                    gap: 4px;
                    width: 60px;
                    position: relative;
                }

                .nav-item.active {
                    color: #000;
                    font-weight: 600;
                }

                .nav-item.primary {
                    color: #41eb5c;
                }
                
                .nav-notification {
                    position: absolute;
                    top: -4px;
                    right: 12px;
                    background: #ef4444;
                    color: white;
                    font-size: 10px;
                    min-width: 16px;
                    height: 16px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 4px;
                    border: 2px solid white;
                }
            `}</style>

            {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`nav-item ${isActive ? 'active' : ''} ${item.isPrimary ? 'primary' : ''}`}
                    >
                        <motion.div
                            whileTap={{ scale: 0.9 }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            {/* Primary Button Styling Override if needed */}
                            {item.isPrimary ? (
                                <div style={{
                                    marginTop: -20,
                                    background: '#000',
                                    borderRadius: '50%',
                                    width: 44,
                                    height: 44,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}>
                                    <Icon size={24} color="#fff" />
                                </div>
                            ) : (
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            )}

                            <span style={{ marginTop: item.isPrimary ? 4 : 0 }}>{item.label}</span>

                            {item.count !== undefined && item.count > 0 && (
                                <motion.span
                                    className="nav-notification"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                >
                                    {item.count}
                                </motion.span>
                            )}
                        </motion.div>
                    </Link>
                );
            })}
        </nav>
    );
}
