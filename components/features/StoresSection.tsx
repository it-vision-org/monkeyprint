import Image from "next/image";
import LoadingLink from "../ui/LoadingLink";
import styles from './StoresSection.module.css';

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
        <section id="stores" className={styles.section}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.subtitle}>{subtitle}</p>
            <div className={styles.grid}>
                {stores.map((store, index) => (
                    <LoadingLink
                        key={index}
                        href={store.href}
                        className={styles.storeBox}
                        aria-label={store.alt || `Store ${index + 1}`}
                        showSpinner={false}
                    >
                        <Image
                            src={store.image}
                            alt={store.alt || `Store ${index + 1}`}
                            width={400}
                            height={400}
                            className={styles.image}
                        />
                        <div className={styles.arrow}>
                            <Image
                                src="/Arrow.png"
                                alt=""
                                width={24}
                                height={24}
                                className={styles.arrowIcon}
                            />
                        </div>
                    </LoadingLink>
                ))}
            </div>
        </section>
    );
}
