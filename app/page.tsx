'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import styles from "./homeMobile.module.css";
import Navbar from "@/components/Navbar";
import HomeHero from "@/components/HomeHero";
import HowItWorks from "@/components/HowItWorks";
import StoresSection from "@/components/StoresSection";
import type { MenuItem } from "@/components/types";

const menuItems: MenuItem[] = [
    { label: "Connexion / S'inscrire", href: "/create-shop", icon: "👤" },
    { label: "Découvrez les boutiques", href: "#stores", icon: "🔥" },
    { label: "Contactez-nous", href: "#", icon: "💬" },
];

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
      {/* Mobile (Figma / 390px absolute layout) */}
      <div className={styles.mobileOnly}>
        <div className={styles.landingPage}>
          {/* NAV BAR */}
          <Navbar
            menuItems={menuItems}
            onMenuToggle={setIsMenuOpen}
            className={styles.navBar}
            logoContainerClassName={styles.logoContainer}
            logoClassName={styles.logo}
            logoTextClassName={styles.logoText}
            menuButtonClassName={styles.menuButton}
            menuButtonLineClassName={styles.menuButtonLine}
          />

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

      {/* Desktop/Tablet fallback (existing responsive layout) */}
      <div className={styles.desktopOnly}>
      {/* Navbar */}
      <Navbar
        menuItems={menuItems}
        onMenuToggle={setIsMenuOpen}
      />

      {/* Hero Banner */}
      <section style={{ padding: "12px" }}>
        <div style={{ 
          borderRadius: 32, 
          padding: "28px 18px 24px", 
          position: "relative", 
          background: "radial-gradient(circle at center, #93c1ff 0%, #79adff 100%)", // Radial glow
          overflow: 'hidden',
          minHeight: '340px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Background Monkey SVG - faint in the middle */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '320px',
            height: '320px',
            opacity: 0.04,
            zIndex: 1,
            pointerEvents: 'none'
          }}>
            <Image src="/Monkey.svg" alt="" width={320} height={320} style={{ objectFit: 'contain' }} />
          </div>

          {/* Coins decorations - Matching Screenshot 2 positions */}
          <div style={{ position: 'absolute', top: '5%', left: '15%', width: 70, height: 70, zIndex: 2, transform: 'rotate(-10deg)' }}>
            <Image src="/Coins.png" alt="" width={70} height={70} />
          </div>
          <div style={{ position: 'absolute', top: '15%', right: '10%', width: 85, height: 85, zIndex: 2, transform: 'rotate(15deg)' }}>
            <Image src="/Coins.png" alt="" width={85} height={85} />
          </div>
          <div style={{ position: 'absolute', top: '45%', left: '5%', width: 80, height: 80, zIndex: 2, transform: 'rotate(-20deg)' }}>
            <Image src="/Coins.png" alt="" width={80} height={80} />
          </div>
          <div style={{ position: 'absolute', top: '48%', right: '5%', width: 65, height: 65, zIndex: 2, transform: 'rotate(30deg)' }}>
            <Image src="/Coins.png" alt="" width={65} height={65} />
          </div>
          <div style={{ position: 'absolute', bottom: '15%', left: '12%', width: 90, height: 90, zIndex: 2, transform: 'rotate(5deg)' }}>
            <Image src="/Coins.png" alt="" width={90} height={90} />
          </div>
          <div style={{ position: 'absolute', bottom: '18%', right: '20%', width: 75, height: 75, zIndex: 2, transform: 'rotate(-15deg)' }}>
            <Image src="/Coins.png" alt="" width={75} height={75} />
          </div>

          {/* Shopping Cart Icon with Plus - Bottom Right corner */}
          <div style={{
            position: 'absolute',
            bottom: -10,
            right: -10,
            zIndex: 3
          }}>
            <Image src="/shop-add.svg" alt="" width={112} height={112} />
          </div>

          <div style={{ position: "relative", zIndex: 4, width: '100%', maxWidth: 560, textAlign: 'center' }}>
            <h1 style={{ 
              fontFamily: '"Arial Black", "Arial Bold", sans-serif',
              fontSize: "clamp(24px, 7.6vw, 34px)", 
              fontWeight: 900, 
              color: "white", 
              textTransform: "uppercase", 
              fontStyle: 'italic',
              lineHeight: 1.05,
              marginBottom: "18px",
              textAlign: "center",
              letterSpacing: '-0.02em'
            }}>
              GAGNEZ DE <span style={{ color: "#f3ff00" }}>L'ARGENT</span>{" "}
              <span style={{ color: "#f3ff00" }}>GRATUITEMENT</span>, EN VENDANT<br />
              SIMPLEMENT DES PRODUITS<br />
              MARCHANDS <span style={{ color: "black" }}>EN TUNISIE.</span>
            </h1>
            
            <p style={{ 
              fontFamily: 'Inter, system-ui, sans-serif',
              color: "white", 
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: 1.4,
              marginBottom: "28px",
              textAlign: "center",
              padding: '0 10px',
              opacity: 0.95
            }}>
              Téléchargez vos œuvres d'art, personnalisez vos produits<br />
              et démarrez votre propre boutique en ligne.
            </p>

            <div style={{ textAlign: "center" }}>
              <Link href="/create-shop" style={{ display: 'inline-block' }}>
                <button style={{ 
                  fontFamily: 'Inter, sans-serif',
                  borderRadius: 9999, 
                  color: "white", 
                  fontWeight: 900, 
                  padding: "16px 46px", 
                  border: "2px solid white",
                  cursor: "pointer", 
                  fontSize: 16,
                  background: "linear-gradient(90deg, #1b6bff 0%, #8b3dff 50%, #ff3aac 100%)",
                  boxShadow: "0 8px 18px rgba(0,0,0,0.22)",
                  textTransform: 'uppercase'
                }}>
                  COMMENCEZ GRATUITEMENT !
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "32px 18px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <h2 style={{ 
            fontFamily: 'Inter, sans-serif',
            fontSize: "16px", 
            fontWeight: 700, 
            color: "#000", 
            marginBottom: "4px" 
          }}>
            Comment ça marche
          </h2>
          <p style={{ 
            fontFamily: 'Inter, sans-serif',
            color: "#6b7280", 
            fontSize: "14px",
            fontWeight: 300
          }}>
            De la conception à la vente en quelques étapes simples
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: '32px' }}>
          {/* Step 1 - Orange */}
          <div style={{ 
            background: "#ffdcc8", 
            padding: "28px 18px", 
            borderRadius: 20, 
            position: "relative",
            minHeight: "160px"
          }}>
            <div style={{ 
              position: "absolute", 
              top: -18, 
              left: 16,
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}>
              <Image src="/Paper Plus.png" alt="" width={26} height={26} />
            </div>
            <div style={{ marginTop: "20px", textAlign: 'center' }}>
              <h3 style={{ 
                fontFamily: 'Inter, sans-serif',
                fontSize: "24px", 
                fontWeight: 700, 
                color: "#000", 
                marginBottom: "10px", 
                lineHeight: 1.2 
              }}>
                Téléchargez<br/>votre conception
              </h3>
              <p style={{ 
                fontFamily: 'Inter, sans-serif',
                color: "#4b5563", 
                fontSize: "20px",
                fontWeight: 200,
                lineHeight: 1.4 
              }}>
                Téléchargez facilement vos<br />
                œuvres et voyez-les prendre<br />
                vie sur des produits de<br />
                qualité.
              </p>
            </div>
          </div>

          {/* Step 2 - Green */}
          <div style={{ 
            background: "#c8f4dd", 
            padding: "28px 18px", 
            borderRadius: 20, 
            position: "relative",
            minHeight: "160px"
          }}>
            <div style={{ 
              position: "absolute", 
              top: -18, 
              right: 16,
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}>
              <Image src="/Edit.png" alt="" width={26} height={26} />
            </div>
            <div style={{ marginTop: "20px", textAlign: 'center' }}>
              <h3 style={{ 
                fontFamily: 'Inter, sans-serif',
                fontSize: "24px", 
                fontWeight: 700, 
                color: "#000", 
                marginBottom: "10px", 
                lineHeight: 1.2 
              }}>
                Personnaliser les<br />produits
              </h3>
              <p style={{ 
                fontFamily: 'Inter, sans-serif',
                color: "#4b5563", 
                fontSize: "20px",
                fontWeight: 200,
                lineHeight: 1.4 
              }}>
                Choisissez parmi nos t-shirts,<br />
                sweats à capuche, mugs et<br />
                plus encore. Choisissez les<br />
                couleurs, les tailles et<br />
                l'emplacement.
              </p>
            </div>
          </div>

          {/* Step 3 - Blue */}
          <div style={{ 
            background: "#d0e8ff", 
            padding: "28px 18px", 
            borderRadius: 20, 
            position: "relative",
            minHeight: "160px"
          }}>
            <div style={{ 
              position: "absolute", 
              top: -18, 
              left: 16,
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}>
              <Image src="/Home.png" alt="" width={26} height={26} />
            </div>
            <div style={{ marginTop: "20px", textAlign: 'center' }}>
              <h3 style={{ 
                fontFamily: 'Inter, sans-serif',
                fontSize: "24px", 
                fontWeight: 700, 
                color: "#000", 
                marginBottom: "10px", 
                lineHeight: 1.2 
              }}>
                Créez votre<br />boutique
              </h3>
              <p style={{ 
                fontFamily: 'Inter, sans-serif',
                color: "#4b5563", 
                fontSize: "20px",
                fontWeight: 200,
                lineHeight: 1.4 
              }}>
                Créez votre propre boutique<br />
                de marque et commencez à<br />
                vendre vos créations<br />
                immédiatement.
              </p>
            </div>
          </div>

          {/* Step 4 - Pink */}
          <div style={{ 
            background: "#ffc8be", 
            padding: "28px 18px", 
            borderRadius: 20, 
            position: "relative",
            minHeight: "160px"
          }}>
            <div style={{ 
              position: "absolute", 
              top: -18, 
              right: 16,
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}>
              <Image src="/Arrow.png" alt="" width={26} height={26} />
            </div>
            <div style={{ marginTop: "20px", textAlign: 'center' }}>
              <h3 style={{ 
                fontFamily: 'Inter, sans-serif',
                fontSize: "24px", 
                fontWeight: 700, 
                color: "#000", 
                marginBottom: "10px", 
                lineHeight: 1.2 
              }}>
                Commencez à<br />vendre
              </h3>
              <p style={{ 
                fontFamily: 'Inter, sans-serif',
                color: "#4b5563", 
                fontSize: "20px",
                fontWeight: 200,
                lineHeight: 1.4 
              }}>
                Vous partagez, nous nous<br />
                occupons de vos produits, de<br />
                l'impression à l'expédition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stores Section */}
      <section style={{ padding: "0 18px", marginBottom: "40px" }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2 style={{ 
            fontFamily: 'Inter, sans-serif',
            fontSize: "16px", 
            fontWeight: 700, 
            color: "#000", 
            marginBottom: "4px" 
          }}>
            Découvrez les boutiques
          </h2>
          <p style={{ 
            fontFamily: 'Inter, sans-serif',
            color: "#6b7280", 
            fontSize: "14px",
            fontWeight: 300
          }}>
            Voici quelques-uns des magasins les plus populaires
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ position: "relative" }}>
              <div style={{ 
                border: "2px solid #b6cff5", 
                borderRadius: 16, 
                height: "120px", 
                background: "#ffffff" 
              }} />
              <div style={{ 
                position: "absolute", 
                bottom: 8, 
                right: 8, 
                width: 32, 
                height: 32, 
                borderRadius: "50%", 
                background: "#3b82f6", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)"
              }}>
                <Image src="/Arrow.png" alt="" width={14} height={14} style={{ filter: 'brightness(0) invert(1)' }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: "0 18px 40px", display: "flex", justifyContent: "center" }}>
        <Link href="/create-shop" style={{ display: 'inline-block' }}>
          <button style={{ 
            fontFamily: 'Inter, sans-serif',
            borderRadius: 9999, 
            color: "white", 
            fontWeight: 900, 
            padding: "14px 32px", 
            border: 0, 
            cursor: "pointer", 
            fontSize: 14,
            background: "linear-gradient(90deg, #2fb3ff 0%, #8b3dff 50%, #ff3aac 100%)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            textTransform: 'uppercase'
          }}>
            COMMENCEZ GRATUITEMENT !
          </button>
        </Link>
      </section>
      </div>
    </div>
  );
}
