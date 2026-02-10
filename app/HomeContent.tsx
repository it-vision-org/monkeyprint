'use client';

import type { Session } from 'next-auth';
import LoadingLink from "@/components/LoadingLink";
import styles from "./home.module.css";
import MainHeader from "@/components/MainHeader";
import HomeHero from "@/components/HomeHero";
import HowItWorks from "@/components/HowItWorks";
import StoresSection from "@/components/StoresSection";

type HomeContentProps = {
  initialSession?: Session | null;
};

export default function HomeContent({ initialSession }: HomeContentProps) {
  // Navigation is now handled by MainHeader component which is responsive
  return (
    <div className={styles.main}>
      {/* NAV BAR */}
      <MainHeader initialSession={initialSession} showCart={false} />

      <main>
        {/* HERO */}
        <HomeHero />

        {/* HOW IT WORKS */}
        <HowItWorks />

        {/* STORES */}
        <StoresSection />

        {/* FOOTER CTA */}
        <section className={styles.footerCtaSection}>
          <LoadingLink href="/create-shop" className={styles.footerCta}>
            <span>COMMENCEZ GRATUITEMENT !</span>
          </LoadingLink>
        </section>
      </main>
    </div>
  );
}

