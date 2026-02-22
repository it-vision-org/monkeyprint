
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getR2Url } from "@/lib/storage";
import { redirect } from "next/navigation";
import Image from "next/image";
import CompteForm from "./CompteForm";
import styles from "../../styles/compte.module.css";

export default async function ComptePage() {
    const session = await auth();
    if (!session?.user?.email) redirect("/");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { store: true }
    });

    if (!user || !user.store) redirect("/create-shop");
    const store = user.store;

    // Resolve Logo URL
    const logoUrl = store.logoUrl ? await getR2Url(store.logoUrl) : null;

    return (
        <div className={styles.compteMain}>
            <div className={styles.compteContainer}>
                <div className={styles.compteTitleRow}>
                    <h1 className={styles.comptePageTitle}>Compte</h1>
                </div>

                {/* Profile Section */}
                <div className={styles.compteProfileCard}>
                    <div className={styles.compteProfileAvatarWrapper}>
                        <div className={styles.compteProfileAvatar}>
                            {logoUrl ? (
                                <img src={logoUrl} alt="Store Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', background: '#eee' }}></div>
                            )}
                        </div>
                    </div>
                    <h2 className={styles.compteProfileName}>{store.name}</h2>
                    <p className={styles.compteProfileEmail}>{user.email}</p>
                    <div className={styles.compteProfileBadge}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Compte vérifié</span>
                    </div>
                </div>

                {/* Form Section */}
                <CompteForm
                    initialShopName={store.name}
                    email={user.email}
                    storeId={store.id}
                    initialTheme={store.theme || 'theme-1'}
                />
            </div>
        </div>
    );
}
