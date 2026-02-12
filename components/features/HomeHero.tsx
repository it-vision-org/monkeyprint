'use client';

import Image from "next/image";
import LoadingLink from "../ui/LoadingLink";
import styles from './HomeHero.module.css';
import desktopStyles from './HomeHero.desktop.module.css';

type HomeHeroProps = {
    className?: string;
};

export default function HomeHero({
    className = '',
}: HomeHeroProps) {
    return (
        <>
            {/* Mobile / Default View */}
            <section className={`${styles.hero} ${className}`} aria-label="Hero">
                <div className={styles.heroRect} aria-hidden="true" />
                <div className={styles.monkey}>
                    <Image src="/Monkey.svg" alt="" width={800} height={800} priority />
                </div>
                <div className={styles.coins}>
                    <Image src="/Coins.png" alt="" width={800} height={247} priority />
                </div>
                <div className={styles.shopAdd}>
                    <Image src="/shop-add.svg" alt="" width={80} height={80} priority />
                </div>

                <h1 className={styles.title}>
                    GAGNEZ DE <span style={{ color: "#f3ff00" }}>L&apos;ARGENT GRATUITEMENT</span>, EN VENDANT SIMPLEMENT DES PRODUITS
                    MARCHANDS <span style={{ color: "black" }}>EN TUNISIE.</span>
                </h1>
                <p className={styles.subtitle}>
                    Téléchargez vos œuvres d&apos;art, personnalisez vos produits et démarrez votre propre
                    boutique en ligne.
                </p>
                <LoadingLink href="/create-shop" className={styles.cta}>
                    <span className={styles.ctaText}>COMMENCEZ GRATUITEMENT !</span>
                </LoadingLink>
            </section>

            {/* Desktop View (Restored from OldMonkey) */}
            <section className={desktopStyles.desktopHeroSection}>
                {/* Background Monkey SVG */}
                <div className={desktopStyles.desktopHeroMonkey}>
                    <Image src="/Monkey.svg" alt="" width={800} height={800} style={{ objectFit: 'contain' }} />
                </div>

                {/* Coins decorations */}
                <div className={`${desktopStyles.desktopHeroCoins} ${desktopStyles.desktopHeroCoins1}`}>
                    <Image src="/Coins.png" alt="" width={140} height={140} />
                </div>
                <div className={`${desktopStyles.desktopHeroCoins} ${desktopStyles.desktopHeroCoins2}`}>
                    <Image src="/Coins.png" alt="" width={160} height={160} />
                </div>
                <div className={`${desktopStyles.desktopHeroCoins} ${desktopStyles.desktopHeroCoins3}`}>
                    <Image src="/Coins.png" alt="" width={150} height={150} />
                </div>
                <div className={`${desktopStyles.desktopHeroCoins} ${desktopStyles.desktopHeroCoins4}`}>
                    <Image src="/Coins.png" alt="" width={130} height={130} />
                </div>
                <div className={`${desktopStyles.desktopHeroCoins} ${desktopStyles.desktopHeroCoins5}`}>
                    <Image src="/Coins.png" alt="" width={170} height={170} />
                </div>
                <div className={`${desktopStyles.desktopHeroCoins} ${desktopStyles.desktopHeroCoins6}`}>
                    <Image src="/Coins.png" alt="" width={145} height={145} />
                </div>

                {/* Shopping Cart Icon */}
                <div className={desktopStyles.desktopHeroShopAdd}>
                    <Image src="/shop-add.svg" alt="" width={200} height={200} />
                </div>

                {/* Hero Content */}
                <div className={desktopStyles.desktopHeroContent}>
                    <h1 className={desktopStyles.desktopHeroTitle}>
                        GAGNEZ DE <span className={desktopStyles.desktopHeroTitleHighlight}>L&apos;ARGENT GRATUITEMENT</span>, EN VENDANT SIMPLEMENT DES PRODUITS
                        MARCHANDS <span className={desktopStyles.desktopHeroTitleBlack}>EN TUNISIE.</span>
                    </h1>
                    <p className={desktopStyles.desktopHeroSubtitle}>
                        Téléchargez vos œuvres d&apos;art, personnalisez vos produits et démarrez votre propre boutique en ligne.
                    </p>
                    <LoadingLink href="/create-shop" className={desktopStyles.desktopHeroCta}>
                        COMMENCEZ GRATUITEMENT !
                    </LoadingLink>
                </div>
            </section>
        </>
    );
}
