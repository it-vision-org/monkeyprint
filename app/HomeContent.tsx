'use client';

import type { Session } from 'next-auth';
import { LoadingLink, MainHeader, HomeHero, HowItWorks, StoresSection } from "@/components";
import styles from "./home.module.css";
import footerStyles from "@/components/features/FooterCTA.desktop.module.css";

type HomeContentProps = {
  initialSession?: Session | null;
};

export default function HomeContent({ initialSession }: HomeContentProps) {
  // Navigation is now handled by MainHeader component which is responsive
  return (
    <div className={styles.main}>
      {/* NAV BAR */}
      <MainHeader initialSession={initialSession} showCart={false} />

      <main className={styles.mobileContainer}>
        {/* HERO */}
        <HomeHero />

        {/* HOW IT WORKS */}
        <HowItWorks />

        {/* STORES */}
        <StoresSection />

        {/* FOOTER CTA */}
        {/* Mobile View */}
        <section className={styles.footerCtaSection}>
          <div className={styles.footerBar} aria-hidden="true" />
          <LoadingLink href="/create-shop" className={styles.footerCta}>
            <span className={styles.footerCtaText}>COMMENCEZ GRATUITEMENT !</span>
          </LoadingLink>
        </section>

        {/* Desktop View (Restored) */}
        <section className={footerStyles.desktopFooterSection}>
          <div className={footerStyles.desktopFooterCtaContainer}>
            <div className={footerStyles.desktopFooterCtaBar} aria-hidden="true" />
            <LoadingLink href="/create-shop" className={footerStyles.desktopFooterCta}>
              <span className={footerStyles.desktopFooterCtaText}>COMMENCEZ GRATUITEMENT !</span>
            </LoadingLink>
          </div>
        </section>
      </main>
    </div>
  );
}
