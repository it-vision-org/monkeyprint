import Image from "next/image";
import LoadingLink from "../ui/LoadingLink";
import { prisma } from "@/lib/prisma";
import { getR2Url } from "@/lib/storage";
import styles from './StoresSection.module.css';
import desktopStyles from './StoresSection.desktop.module.css';

type Store = {
    href: string;
    image: string;
    alt: string;
    name: string;
    statsLabel: string;
};

type StoresSectionProps = {
    title?: string;
    subtitle?: string;
    stores?: Store[];
};

const fallbackStores: Store[] = [
    { href: "/stores", image: "/theme-1.png", alt: "Boutique 1", name: "Boutique 1", statsLabel: "0 produits - 0 commandes - 0 avis" },
    { href: "/stores", image: "/theme-2.png", alt: "Boutique 2", name: "Boutique 2", statsLabel: "0 produits - 0 commandes - 0 avis" },
    { href: "/stores", image: "/theme-3.png", alt: "Boutique 3", name: "Boutique 3", statsLabel: "0 produits - 0 commandes - 0 avis" }
];

export default async function StoresSection({
    title = "Découvrez les boutiques",
    subtitle = "Voici quelques vraies boutiques actives sur MonkeyPrint",
    stores
}: StoresSectionProps) {
    const resolvedStores: Store[] = stores ?? await (async () => {
        const storesFromDb = await prisma.store.findMany({
            where: { status: "ACTIVE" },
            include: {
                _count: {
                    select: {
                        products: true,
                        orders: true
                    }
                },
                orders: {
                    select: {
                        status: true
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            take: 3
        });

        return Promise.all(
            storesFromDb.map(async (store) => {
                const logoUrl = store.logoUrl ? await getR2Url(store.logoUrl) : null;
                const deliveredOrders = store.orders.filter((order) => order.status === "DELIVERED_AND_PAID").length;

                return {
                    href: `/shop/${store.slug}`,
                    image: logoUrl ?? "/logo.png",
                    alt: store.name,
                    name: store.name,
                    statsLabel: `${store._count.products} produits - ${store._count.orders} commandes - ${deliveredOrders} avis`
                };
            })
        );
    })();

    const visibleStores = (resolvedStores.length > 0 ? resolvedStores : fallbackStores).slice(0, 3);

    return (
        <>
            {/* Mobile View */}
            <section className={styles.section}>
                <div id="stores" className={styles.title}>
                    {title}
                </div>
                <div className={styles.subtitle}>{subtitle}</div>

                {visibleStores.map((store, index) => (
                    <LoadingLink
                        key={index}
                        href={store.href}
                        className={`${styles.storeBox} ${styles[`storeBox${index + 1}`]}`}
                        aria-label={`Voir la boutique ${store.name}`}
                        showSpinner={false}
                    >
                        <Image
                            src={store.image}
                            alt={store.alt}
                            width={117}
                            height={117}
                            className={styles.image}
                        />
                        <div className={styles.mobileStoreMeta}>
                            <span className={styles.mobileStoreName}>{store.name}</span>
                            <span className={styles.mobileStoreStats}>{store.statsLabel}</span>
                        </div>
                    </LoadingLink>
                ))}

                {visibleStores.map((_, index) => (
                    <div
                        key={`arrow-${index}`}
                        className={`${styles.arrow} ${styles[`storeArrowDot${index + 1}`]}`}
                        aria-hidden="true"
                    >
                        <span className={styles.arrowStroke} />
                    </div>
                ))}
            </section>

            {/* Desktop View */}
            <section className={desktopStyles.desktopStoresSection} id="stores-desktop">
                <div className={desktopStyles.desktopStoresHeader}>
                    <h2 className={desktopStyles.desktopStoresTitle}>{title}</h2>
                    <p className={desktopStyles.desktopStoresSubtitle}>
                        {subtitle}
                    </p>
                </div>
                <div className={desktopStyles.desktopStoresGrid}>
                    {visibleStores.map((store, index) => (
                        <LoadingLink key={index} href={store.href} className={desktopStyles.desktopStoreBox} showSpinner={false}>
                            <Image
                                src={store.image}
                                alt={store.alt}
                                width={400}
                                height={400}
                                className={desktopStyles.desktopStoreBoxImage}
                            />
                            <div className={desktopStyles.desktopStoreMeta}>
                                <h3 className={desktopStyles.desktopStoreName}>{store.name}</h3>
                                <p className={desktopStyles.desktopStoreStats}>{store.statsLabel}</p>
                            </div>
                            <div className={desktopStyles.desktopStoreArrow}>
                                <Image
                                    src="/Arrow.png"
                                    alt=""
                                    width={24}
                                    height={24}
                                    className={desktopStyles.desktopStoreArrowIcon}
                                />
                            </div>
                        </LoadingLink>
                    ))}
                </div>
            </section>
        </>
    );
}
