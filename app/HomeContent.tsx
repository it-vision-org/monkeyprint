'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSession, signOut, Session } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./homeMobile.module.css";
import desktopStyles from "./homeDesktop.module.css";
import MainHeader from "@/components/MainHeader";
import HomeHero from "@/components/HomeHero";
import HowItWorks from "@/components/HowItWorks";
import StoresSection from "@/components/StoresSection";
import type { MenuItem } from "@/components/types";

const menuItems: MenuItem[] = [
    { label: "Découvrez les boutiques", href: "/stores", icon: "🔥" },
    { label: "Contactez-nous", href: "/contact", icon: "💬" },
];

type HomeContentProps = {
    initialSession?: Session | null;
};

export default function HomeContent({ initialSession }: HomeContentProps) {
  const { data: clientSession } = useSession();
  // Use initialSession if provided (from server), otherwise use client session
  const session = initialSession !== undefined ? initialSession : clientSession;
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  const desktopMenuItems = session?.user 
    ? [
        ...menuItems,
        { label: "Tableau de bord", href: "/dashboard", icon: "📊" },
        { label: "Se déconnecter", href: "#", icon: "🚪", onClick: handleLogout }
      ]
    : [
        ...menuItems,
        { label: "Se connecter", href: "/login", icon: "👤" },
        { label: "Créer une boutique", href: "/create-shop", icon: "➕" }
      ];

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
      {/* Mobile (Figma / 390px absolute layout) */}
      <div className={styles.mobileOnly}>
        <div className={styles.landingPage}>
          {/* NAV BAR */}
          <MainHeader menuItems={menuItems} initialSession={initialSession} />

          {/* HERO */}
          <HomeHero
            className={styles.heroWrap}
            rectClassName={styles.heroRect}
            monkeyClassName={styles.heroMonkey}
            coinsClassName={styles.heroCoins}
            shopAddClassName={styles.heroShopAdd}
            titleClassName={styles.heroTitle}
            subtitleClassName={styles.heroSubtitle}
            ctaClassName={styles.heroCta}
            ctaTextClassName={styles.heroCtaText}
          />

          {/* HOW IT WORKS */}
          <HowItWorks
            titleClassName={styles.howTitle}
            subtitleClassName={styles.howSubtitle}
            getCardRectClassName={(index) => {
              const variants = [styles.card1Rect, styles.card2Rect, styles.card3Rect, styles.card4Rect];
              return `${styles.cardRect} ${variants[index]}`;
            }}
            getCardIconClassName={(index) => {
              const variants = [styles.card1Icon, styles.card2Icon, styles.card3Icon, styles.card4Icon];
              return `${styles.cardIcon} ${variants[index]}`;
            }}
            getCardTextClassName={(index) => {
              const variants = [styles.card1Text, styles.card2Text, styles.card3Text, styles.card4Text];
              return `${styles.cardTextWrap} ${variants[index]}`;
            }}
            getCardTitleClassName={(index) => {
              const variants = [styles.cardTitle1, styles.cardTitle2, styles.cardTitle3, styles.cardTitle4];
              return `${styles.cardTitle} ${variants[index]}`;
            }}
            cardDescClassName={styles.cardDesc}
            cards={[
              { icon: "/Paper Plus.png", title: "Téléchargez votre\nconception", description: "Téléchargez facilement vos œuvres et voyez-les prendre vie sur des produits de qualité." },
              { icon: "/Edit.png", title: "Personnaliser les\nproduits", description: "Choisissez parmi nos t-shirts, sweats à capuche, mugs et plus encore. Choisissez les couleurs, les tailles et l'emplacement." },
              { icon: "/Home.png", title: "Créez votre\nboutique", description: "Créez votre propre boutique de marque et commencez à vendre vos créations immédiatement." },
              { icon: "/Arrow.png", title: "Commencez à\nvendre", description: "Vous partagez, nous nous occupons de vos produits, de l'impression à l'expédition." }
            ]}
          />

          {/* STORES */}
          <StoresSection
            titleClassName={styles.storesTitle}
            subtitleClassName={styles.storesSubtitle}
            getStoreBoxClassName={(index) => {
              const variants = [styles.storeBox1, styles.storeBox2, styles.storeBox3];
              return `${styles.storeBox} ${variants[index]}`;
            }}
            showArrows={true}
            getArrowClassName={(index) => {
              const variants = [styles.storeArrowDot1, styles.storeArrowDot2, styles.storeArrowDot3];
              return `${styles.storeArrowDot} ${variants[index]}`;
            }}
            arrowStrokeClassName={styles.storeArrowStroke}
            stores={[
              { href: "/store/theme-1", image: "/theme-1.png", imageWidth: 117, imageHeight: 117, alt: "Theme 1" },
              { href: "/store/theme-2", image: "/theme-2.png", imageWidth: 117, imageHeight: 117, alt: "Theme 2" },
              { href: "/store/theme-3", image: "/theme-3.png", imageWidth: 117, imageHeight: 117, alt: "Theme 3" }
            ]}
          />

          {/* Footer */}
          <div className={styles.footerBar} aria-hidden="true" />
          <Link href="/create-shop" className={styles.footerCta}>
            <span className={styles.footerCtaText}>COMMENCEZ GRATUITEMENT !</span>
          </Link>
        </div>
      </div>

      {/* Desktop/Tablet - Full Desktop Design */}
      <div className={styles.desktopOnly}>
        <div className={desktopStyles.desktopContainer}>
          {/* Navbar */}
          <header className={desktopStyles.desktopNavbar}>
            <div className={desktopStyles.desktopLogoContainer}>
              <Image
                src="/logo.png"
                alt="Monkey Print"
                width={100}
                height={50}
                className={desktopStyles.desktopLogo}
                priority
              />
              <span className={desktopStyles.desktopLogoText}>MONKEY PRINT</span>
            </div>
            <nav>
              <ul className={desktopStyles.desktopNavMenu}>
                {desktopMenuItems.map((item, index) => (
                  <li key={index}>
                    {item.onClick ? (
                      <button 
                        onClick={item.onClick}
                        className={desktopStyles.desktopNavMenuItem}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                      >
                        <span className={desktopStyles.desktopNavMenuItemIcon}>{item.icon}</span>
                        {item.label}
                      </button>
                    ) : (
                      <Link href={item.href} className={desktopStyles.desktopNavMenuItem}>
                        <span className={desktopStyles.desktopNavMenuItemIcon}>{item.icon}</span>
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </header>

          {/* Hero Section */}
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
              <Link href="/create-shop" className={desktopStyles.desktopHeroCta}>
                COMMENCEZ GRATUITEMENT !
              </Link>
            </div>
          </section>

          {/* How It Works Section */}
          <section className={desktopStyles.desktopHowItWorksSection}>
            <div className={desktopStyles.desktopHowItWorksHeader}>
              <h2 className={desktopStyles.desktopHowItWorksTitle}>Comment ça marche</h2>
              <p className={desktopStyles.desktopHowItWorksSubtitle}>
                De la conception à la vente en quelques étapes simples
              </p>
            </div>

            <div className={desktopStyles.desktopHowItWorksGrid}>
              {/* Card 1 - Orange */}
              <div className={`${desktopStyles.desktopHowItWorksCard} ${desktopStyles.desktopHowItWorksCard1}`}>
                <div className={`${desktopStyles.desktopHowItWorksCardIcon} ${desktopStyles.desktopHowItWorksCard1Icon}`}>
                  <Image src="/Paper Plus.png" alt="" width={64} height={64} />
                </div>
                <div className={desktopStyles.desktopHowItWorksCardContent}>
                  <h3 className={desktopStyles.desktopHowItWorksCardTitle}>
                    Téléchargez votre conception
                  </h3>
                  <p className={desktopStyles.desktopHowItWorksCardDesc}>
                    Téléchargez facilement vos œuvres et voyez-les prendre vie sur des produits de qualité.
                  </p>
                </div>
              </div>

              {/* Card 2 - Green */}
              <div className={`${desktopStyles.desktopHowItWorksCard} ${desktopStyles.desktopHowItWorksCard2}`}>
                <div className={`${desktopStyles.desktopHowItWorksCardIcon} ${desktopStyles.desktopHowItWorksCard2Icon}`}>
                  <Image src="/Edit.png" alt="" width={64} height={64} />
                </div>
                <div className={desktopStyles.desktopHowItWorksCardContent}>
                  <h3 className={desktopStyles.desktopHowItWorksCardTitle}>
                    Personnaliser les produits
                  </h3>
                  <p className={desktopStyles.desktopHowItWorksCardDesc}>
                    Choisissez parmi nos t-shirts, sweats à capuche, mugs et plus encore. Choisissez les couleurs, les tailles et l&apos;emplacement.
                  </p>
                </div>
              </div>

              {/* Card 3 - Blue */}
              <div className={`${desktopStyles.desktopHowItWorksCard} ${desktopStyles.desktopHowItWorksCard3}`}>
                <div className={`${desktopStyles.desktopHowItWorksCardIcon} ${desktopStyles.desktopHowItWorksCard3Icon}`}>
                  <Image src="/Home.png" alt="" width={64} height={64} />
                </div>
                <div className={desktopStyles.desktopHowItWorksCardContent}>
                  <h3 className={desktopStyles.desktopHowItWorksCardTitle}>
                    Créez votre boutique
                  </h3>
                  <p className={desktopStyles.desktopHowItWorksCardDesc}>
                    Créez votre propre boutique de marque et commencez à vendre vos créations immédiatement.
                  </p>
                </div>
              </div>

              {/* Card 4 - Pink */}
              <div className={`${desktopStyles.desktopHowItWorksCard} ${desktopStyles.desktopHowItWorksCard4}`}>
                <div className={`${desktopStyles.desktopHowItWorksCardIcon} ${desktopStyles.desktopHowItWorksCard4Icon}`}>
                  <Image src="/Arrow.png" alt="" width={64} height={64} />
                </div>
                <div className={desktopStyles.desktopHowItWorksCardContent}>
                  <h3 className={desktopStyles.desktopHowItWorksCardTitle}>
                    Commencez à vendre
                  </h3>
                  <p className={desktopStyles.desktopHowItWorksCardDesc}>
                    Vous partagez, nous nous occupons de vos produits, de l&apos;impression à l&apos;expédition.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Stores Section */}
          <section className={desktopStyles.desktopStoresSection} id="stores">
            <div className={desktopStyles.desktopStoresHeader}>
              <h2 className={desktopStyles.desktopStoresTitle}>Découvrez les boutiques</h2>
              <p className={desktopStyles.desktopStoresSubtitle}>
                Voici quelques-uns des magasins les plus populaires
              </p>
            </div>
            <div className={desktopStyles.desktopStoresGrid}>
              {[
                { href: "/store/theme-1", image: "/theme-1.png", alt: "Theme 1" },
                { href: "/store/theme-2", image: "/theme-2.png", alt: "Theme 2" },
                { href: "/store/theme-3", image: "/theme-3.png", alt: "Theme 3" }
              ].map((store, index) => (
                <Link key={index} href={store.href} className={desktopStyles.desktopStoreBox}>
                  <Image 
                    src={store.image} 
                    alt={store.alt} 
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
                </Link>
              ))}
            </div>
          </section>

          {/* Footer CTA */}
          <section className={desktopStyles.desktopFooterSection}>
            <div className={desktopStyles.desktopFooterCtaContainer}>
              <div className={desktopStyles.desktopFooterCtaBar} aria-hidden="true" />
              <Link href="/create-shop" className={desktopStyles.desktopFooterCta}>
                <span className={desktopStyles.desktopFooterCtaText}>COMMENCEZ GRATUITEMENT !</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

