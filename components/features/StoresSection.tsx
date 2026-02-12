import Image from "next/image";
import LoadingLink from "../ui/LoadingLink";
import styles from './StoresSection.module.css';
import desktopStyles from './StoresSection.desktop.module.css';

type Store = {
    href: string;
    image: string;
    alt?: string;
};

type StoresSectionProps = {
    title?: string;
    subtitle?: string;
    stores?: Store[];
};

const defaultStores: Store[] = [
    { href: "/store/theme-1", image: "/theme-1.png", alt: "Theme 1" },
    { href: "/store/theme-2", image: "/theme-2.png", alt: "Theme 2" },
    { href: "/store/theme-3", image: "/theme-3.png", alt: "Theme 3" }
];

export default function StoresSection({
    title = "Découvrez les boutiques",
    subtitle = "Voici quelques-uns des magasins les plus populaires",
    stores = defaultStores
}: StoresSectionProps) {
    return (
        <>
            {/* Mobile View */}
            <div id="stores" className={styles.title}>
                {title}
            </div>
            <div className={styles.subtitle}>{subtitle}</div>

            {stores.map((store, index) => (
                <LoadingLink
                    key={index}
                    href={store.href}
                    className={`${styles.storeBox} ${styles[`storeBox${index + 1}`]}`}
                    aria-label={`Theme ${index + 1} preview`}
                    showSpinner={false}
                >
                    <Image
                        src={store.image}
                        alt={store.alt || `Theme ${index + 1}`}
                        width={117}
                        height={117}
                        className={styles.image}
                    />
                </LoadingLink>
            ))}

            {stores.map((_, index) => (
                <div
                    key={`arrow-${index}`}
                    className={`${styles.arrow} ${styles[`storeArrowDot${index + 1}`]}`}
                    aria-hidden="true"
                >
                    <span className={styles.arrowStroke} />
                </div>
            ))}

            {/* Desktop View */}
            <section className={desktopStyles.desktopStoresSection} id="stores-desktop">
                <div className={desktopStyles.desktopStoresHeader}>
                    <h2 className={desktopStyles.desktopStoresTitle}>{title}</h2>
                    <p className={desktopStyles.desktopStoresSubtitle}>
                        {subtitle}
                    </p>
                </div>
                <div className={desktopStyles.desktopStoresGrid}>
                    {stores.map((store, index) => (
                        <LoadingLink key={index} href={store.href} className={desktopStyles.desktopStoreBox} showSpinner={false}>
                            <Image
                                src={store.image}
                                alt={store.alt || `Store ${index + 1}`}
                                width={400}
                                height={400}
                                className={desktopStyles.desktopStoreBoxImage}
                            />
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
