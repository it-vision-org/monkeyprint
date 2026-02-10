'use client';

import Image from "next/image";
import LoadingLink from "@/components/LoadingLink";
import styles from './HomeHero.module.css';

type HomeHeroProps = {
    className?: string;
};

export default function HomeHero({
    className = '',
}: HomeHeroProps) {
    return (
        <section className={`${styles.hero} ${className}`} aria-label="Hero">
            <div className={styles.monkey}>
                <Image src="/Monkey.svg" alt="" width={800} height={800} priority />
            </div>
            <div className={styles.coins}>
                <Image src="/Coins.png" alt="" width={800} height={600} priority />
            </div>
            <div className={styles.shopAdd}>
                <Image src="/shop-add.svg" alt="" width={200} height={200} priority />
            </div>

            <div className={styles.content}>
                <h1 className={styles.title}>
                    GAGNEZ DE <span style={{ color: "#f3ff00" }}>L&apos;ARGENT GRATUITEMENT</span>, EN VENDANT SIMPLEMENT DES PRODUITS
                    MARCHANDS <span style={{ color: "black" }}>EN TUNISIE.</span>
                </h1>
                <p className={styles.subtitle}>
                    Téléchargez vos œuvres d&apos;art, personnalisez vos produits et démarrez votre propre
                    boutique en ligne.
                </p>
                <LoadingLink href="/create-shop" className={styles.cta}>
                    <span>COMMENCEZ GRATUITEMENT !</span>
                </LoadingLink>
            </div>
        </section>
    );
}

