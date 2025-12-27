'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* Navbar - Mobile Only */}
      <header style={{ background: "#ffffff", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Image src="/logo.png" alt="Monkey Print" width={100} height={32} style={{ objectFit: "contain" }} />
        <button 
          onClick={() => setIsMenuOpen(true)} 
          aria-label="Open menu" 
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20" stroke="#0d9488" strokeWidth="2" strokeLinecap="round"/>
            <path d="M4 12H20" stroke="#0d9488" strokeWidth="2" strokeLinecap="round"/>
            <path d="M4 18H20" stroke="#0d9488" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </header>

      {isMenuOpen && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0, 0, 0, 0.25)', 
            zIndex: 60 
          }} 
          onClick={() => setIsMenuOpen(false)}
        >
          <div 
            style={{ 
              position: 'absolute', 
              top: 0, 
              right: 0, 
              width: '80%', 
              height: '100%', 
              background: '#ffffff', 
              padding: '40px 24px',
              borderTopLeftRadius: '20px',
              borderBottomLeftRadius: '20px'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
              <button 
                onClick={() => setIsMenuOpen(false)} 
                aria-label="Close menu" 
                style={{ background: 'transparent', border: 'none', color: '#0d1c23', fontSize: 32, lineHeight: 1, cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <a href="#" style={{ color: '#0d1c23', textDecoration: 'none', fontSize: 20, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: 22 }}>👤</span>Connexion / S'inscrire
              </a>
              <a href="#" style={{ color: '#0d1c23', textDecoration: 'none', fontSize: 20, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: 22 }}>🔥</span>Découvrez les boutiques
              </a>
              <a href="#" style={{ color: '#0d1c23', textDecoration: 'none', fontSize: 20, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: 22 }}>💬</span>Contactez-nous
              </a>
            </nav>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <section style={{ padding: "8px 8px 16px 8px" }}>
        <div style={{ 
          borderRadius: 24, 
          padding: "32px 20px 24px", 
          position: "relative", 
          background: "linear-gradient(180deg, #5cc6ff 0%, #2d7fd9 100%)",
          overflow: 'hidden',
          minHeight: '280px'
        }}>
          {/* Background Monkey SVG */}
          <div style={{
            position: 'absolute',
            bottom: -10,
            right: -10,
            width: '180px',
            height: '180px',
            opacity: 0.15,
            zIndex: 1
          }}>
            <Image src="/Monkey.svg" alt="" width={180} height={180} style={{ objectFit: 'contain' }} />
          </div>

          {/* Coins decorations */}
          <div style={{
            position: 'absolute',
            top: 20,
            left: 20,
            width: 50,
            height: 50,
            zIndex: 1
          }}>
            <Image src="/Coins.png" alt="" width={50} height={50} style={{ objectFit: 'contain', opacity: 0.9 }} />
          </div>
          <div style={{
            position: 'absolute',
            bottom: 40,
            left: 10,
            width: 40,
            height: 40,
            zIndex: 1
          }}>
            <Image src="/Coins.png" alt="" width={40} height={40} style={{ objectFit: 'contain', opacity: 0.8 }} />
          </div>
          <div style={{
            position: 'absolute',
            bottom: 20,
            right: 100,
            width: 35,
            height: 35,
            zIndex: 1
          }}>
            <Image src="/Coins.png" alt="" width={35} height={35} style={{ objectFit: 'contain', opacity: 0.7 }} />
          </div>

          {/* Shopping Cart Icon with Plus */}
          <div style={{
            position: 'absolute',
            right: 20,
            top: 24,
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2
          }}>
            <Image src="/shop-add.svg" alt="" width={28} height={28} style={{ filter: 'brightness(0) invert(1)' }} />
          </div>

          <div style={{ position: "relative", zIndex: 2, paddingRight: '60px' }}>
            <h1 style={{ 
              fontFamily: 'Segoe UI, sans-serif',
              fontSize: "20px", 
              fontWeight: 600, 
              color: "white", 
              textTransform: "uppercase", 
              lineHeight: 1.4,
              marginBottom: "12px",
              textAlign: "left"
            }}>
              GAGNEZ DE <span style={{ color: "#FFEB3B" }}>L'ARGENT</span><br />
              <span style={{ color: "#FFEB3B" }}>GRATUITEMENT</span>, EN VENDANT<br />
              SIMPLEMENT DES PRODUITS<br />
              MARCHANDS <span style={{ color: "#FFEB3B", fontStyle: 'italic' }}>EN TUNISIE</span>.
            </h1>
            <p style={{ 
              fontFamily: 'Inter, sans-serif',
              color: "white", 
              fontSize: "12px",
              fontWeight: 400,
              lineHeight: 1.5,
              marginBottom: "24px",
              textAlign: "left"
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
                  padding: "12px 28px", 
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
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "32px 20px 40px" }}>
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
            padding: "28px 20px", 
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
                Téléchargez<br />votre conception
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
            padding: "28px 20px", 
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
            padding: "28px 20px", 
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
            padding: "28px 20px", 
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
      <section style={{ padding: "0 20px", marginBottom: "40px" }}>
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
      <section style={{ padding: "0 20px 40px", display: "flex", justifyContent: "center" }}>
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
  );
}
