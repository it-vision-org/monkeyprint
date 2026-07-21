'use client';

import Image from 'next/image';
import LoadingLink from '../ui/LoadingLink';
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
            {/* Mobile Hero */}
            <section
                className={`${styles.hero} ${className}`}
                aria-labelledby="mobile-hero-title"
            >
                <div className={styles.backgroundShape} aria-hidden="true" />

                <div className={styles.monkey} aria-hidden="true">
                    <Image
                        src="/Monkey.svg"
                        alt=""
                        fill
                        sizes="90vw"
                        priority
                    />
                </div>

                <div className={styles.shopAdd} aria-hidden="true">
                    <Image
                        src="/shop-add.svg"
                        alt=""
                        fill
                        sizes="72px"
                        priority
                    />
                </div>

                <div className={styles.content}>
                    <p className={styles.eyebrow}>
                        CRÉE. VENDS. GAGNE.
                    </p>

                    <h1
                        id="mobile-hero-title"
                        className={styles.title}
                    >
                        UN DESIGN,
                        <br />
                        UNE BOUTIQUE,
                        <br />
                        <span>UN BUSINESS.</span>
                    </h1>

                    <p className={styles.subtitle}>
                        Créez vos produits, lancez votre boutique et développez
                        votre marque en Tunisie.
                    </p>

                    <LoadingLink
                        href="/create-shop"
                        className={styles.cta}
                        disableAnimation
                    >
                        <span className={styles.ctaText}>
                            CRÉER VOTRE BOUTIQUE
                        </span>
                    </LoadingLink>

                    <p className={styles.ctaNote}>
                        Gratuit pour commencer
                    </p>
                </div>
            </section>

            {/* Desktop Hero */}
            <section
                className={desktopStyles.desktopHeroSection}
                aria-labelledby="desktop-hero-title"
            >
                <div
                    className={desktopStyles.desktopHeroDecoration}
                    aria-hidden="true"
                />

                <div className={desktopStyles.desktopHeroContent}>
                    <div className={desktopStyles.desktopHeroText}>
                        <p className={desktopStyles.desktopHeroEyebrow}>
                            CRÉE. VENDS. GAGNE.
                        </p>

                       <h1
                            id="desktop-hero-title"
                            className={desktopStyles.desktopHeroTitle}
                        >
                            <span className={desktopStyles.desktopHeroTitleLine}>
                                UN DESIGN,
                            </span>

                            <span className={desktopStyles.desktopHeroTitleLine}>
                                UNE BOUTIQUE,
                            </span>

                            <span
                                className={`${desktopStyles.desktopHeroTitleLine} ${desktopStyles.desktopHeroTitleBlue}`}
                            >
                                UN BUSINESS.
                            </span>
                        </h1>

                        <p className={desktopStyles.desktopHeroSubtitle}>
                            Transformez vos créations en produits, ouvrez votre
                            boutique et lancez votre marque en Tunisie.
                        </p>

                        <div className={desktopStyles.desktopHeroActions}>
                            <LoadingLink
                                href="/create-shop"
                                className={desktopStyles.desktopHeroCta}
                                disableAnimation
                            >
                                CRÉER VOTRE BOUTIQUE
                            </LoadingLink>

                            <span className={desktopStyles.desktopHeroCtaNote}>
                                Gratuit pour commencer
                            </span>
                        </div>
                    </div>

                    <div
    className={desktopStyles.desktopHeroVisual}
    aria-hidden="true"
>
    <div className={desktopStyles.desktopHeroVisualCard}>
        <div className={desktopStyles.desktopHeroBrowserBar}>
            <span />
            <span />
            <span />
        </div>

        <div className={desktopStyles.desktopHeroProductArea}>
            <div className={desktopStyles.desktopHeroVisualMonkey}>
                <Image
                    src="/Monkey.svg"
                    alt=""
                    fill
                    sizes="(max-width: 1200px) 380px, 500px"
                    priority
                />
            </div>

            <div className={desktopStyles.desktopHeroProductLabel}>
                VOTRE DESIGN
            </div>
        </div>

        <div className={desktopStyles.desktopHeroStoreCard}>
            <div className={desktopStyles.desktopHeroStoreIcon}>
                <Image
                    src="/shop-add.svg"
                    alt=""
                    fill
                    sizes="42px"
                />
            </div>

            <div>
                <strong>Votre boutique</strong>
                <span>Prête à vendre</span>
            </div>

            <div className={desktopStyles.desktopHeroStatusDot} />
        </div>

        <div className={desktopStyles.desktopHeroVisualBadge}>
            <span>100%</span>
            <small>CRÉATIF</small>
        </div>
    </div>
</div>
                </div>
            </section>
        </>
    );
}