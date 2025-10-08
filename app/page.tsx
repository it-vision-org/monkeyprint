import Image from "next/image";

export default function Home() {
  return (
    <div>
      {/* Navbar */}
      <header style={{ borderBottom: "1px solid #e5e7eb", background: "#ffffff" }}>
        <div className="mp-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 80, padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <Image src="/logo.svg" alt="Monkey Print" width={120} height={40} style={{ objectFit: "contain" }} />
            <nav style={{ display: "flex", gap: 32, fontWeight: 600, color: "#0d9488", fontSize: 15 }}>
              <a href="#" style={{ textDecoration: "none", color: "#0d9488" }}>ACCUEIL</a>
              <a href="#" style={{ textDecoration: "none", color: "#0d9488" }}>SHOP LIST</a>
              <a href="#" style={{ textDecoration: "none", color: "#0d9488" }}>CONTACTEZ-NOUS</a>
            </nav>
          </div>
          <div>
            <button style={{ background: "#0ea5a6", color: "white", fontWeight: 700, borderRadius: 8, padding: "12px 24px", border: "none", cursor: "pointer", fontSize: 14 }}>COMMENCER</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mp-container" style={{ paddingTop: 40, paddingBottom: 48, padding: "40px 20px 48px" }}>
        <div className="mp-gradient-hero" style={{ borderRadius: 24, padding: "48px 56px", minHeight: 320, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", maxWidth: 700, position: "relative", zIndex: 2 }}>
            <h1 style={{ fontSize: 44, lineHeight: 1.3, fontWeight: 900, color: "white", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              GAGNEZ DE L'<span style={{ color: "#ffeb3b" }}>ARGENT</span>{" "}
              <span style={{ color: "#ffeb3b" }}>GRATUITEMENT</span>, EN VENDANT{" "}
              SIMPLEMENT DES PRODUITS{" "}
              MARCHANDS <em style={{ fontStyle: "italic", fontWeight: 900 }}>EN TUNISIE.</em>
            </h1>
            <p style={{ color: "white", marginTop: 20, fontSize: 18, lineHeight: 1.5 }}>
              Téléchargez vos œuvres d'art, personnalisez vos produits<br />et démarrez votre propre boutique en ligne.
            </p>
            <button className="mp-gradient-cta" style={{ marginTop: 32, borderRadius: 9999, color: "white", fontWeight: 800, padding: "16px 40px", border: 0, boxShadow: "0 8px 20px rgba(0,0,0,0.2)", cursor: "pointer", fontSize: 16 }}>
              COMMENCEZ GRATUITEMENT !
            </button>
          </div>
          <Image src="/mock-shirt.png" alt="T-shirt" width={280} height={280} style={{ position: "absolute", right: 40, bottom: 0, transform: "rotate(12deg)", opacity: 0.95 }} />
        </div>
      </section>

      {/* Steps */}
      <section className="mp-container" style={{ padding: "48px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: "#000", marginBottom: 8 }}>Comment ça marche</h2>
          <p style={{ color: "#6b7280", fontSize: 17 }}>De la conception à la vente en quelques étapes simples</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, maxWidth: 1080, margin: "0 auto" }}>
          {/* Step 1 */}
          <div style={{ background: "#fff0e6", padding: "40px 32px", borderRadius: 24, position: "relative", minHeight: 220, overflow: 'visible' }}>
            <div style={{ position: "absolute", top: -25, left: -15 }}>
              <div style={{ position: 'absolute', width: 80, height: 80, background: 'rgba(255,255,255,0.5)', borderRadius: '50% 40% 30% 60% / 60% 40% 50% 50%', filter: 'blur(10px)', transform: 'rotate(15deg)' }}></div>
              <div style={{ width: 72, height: 72, borderRadius: 999, background: "white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.08)", position: 'relative' }}>
                <Image src="/Paper Plus.png" alt="Téléchargez votre conception" width={36} height={36} />
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "#000", marginBottom: 12, lineHeight: 1.3 }}>Téléchargez<br />votre conception</h3>
              <p style={{ color: "#5a5a5a", fontSize: 15, lineHeight: 1.65 }}>
                Téléchargez facilement vos œuvres et voyez-les prendre vie sur des produits de qualité.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ background: "#e0f8f4", padding: "40px 32px", borderRadius: 24, position: "relative", minHeight: 220, overflow: 'visible' }}>
            <div style={{ position: "absolute", top: -25, right: -15 }}>
              <div style={{ position: 'absolute', width: 80, height: 80, background: 'rgba(255,255,255,0.5)', borderRadius: '50% 40% 30% 60% / 60% 40% 50% 50%', filter: 'blur(10px)', transform: 'rotate(15deg)' }}></div>
              <div style={{ width: 72, height: 72, borderRadius: 999, background: "white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.08)", position: 'relative' }}>
                <Image src="/Edit.png" alt="Personnaliser les produits" width={36} height={36} />
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "#000", marginBottom: 12, lineHeight: 1.3 }}>Personnaliser les<br />produits</h3>
              <p style={{ color: "#5a5a5a", fontSize: 15, lineHeight: 1.65 }}>
                Choisissez parmi nos t-shirts, sweats à capuche, mugs et plus encore. Choisissez les couleurs, les tailles et l'emplacement.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ background: "#e3f0ff", padding: "40px 32px", borderRadius: 24, position: "relative", minHeight: 220, overflow: 'visible' }}>
            <div style={{ position: "absolute", top: -25, left: -15 }}>
              <div style={{ position: 'absolute', width: 80, height: 80, background: 'rgba(255,255,255,0.5)', borderRadius: '50% 40% 30% 60% / 60% 40% 50% 50%', filter: 'blur(10px)', transform: 'rotate(15deg)' }}></div>
              <div style={{ width: 72, height: 72, borderRadius: 999, background: "white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.08)", position: 'relative' }}>
                <Image src="/Home.png" alt="Créez votre boutique" width={36} height={36} />
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "#000", marginBottom: 12, lineHeight: 1.3 }}>Créez votre<br />boutique</h3>
              <p style={{ color: "#5a5a5a", fontSize: 15, lineHeight: 1.65 }}>
                Créez votre propre boutique de marque et commencez à vendre vos créations immédiatement.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div style={{ background: "#ffe8e6", padding: "40px 32px", borderRadius: 24, position: "relative", minHeight: 220, overflow: 'visible' }}>
            <div style={{ position: "absolute", top: -25, right: -15 }}>
              <div style={{ position: 'absolute', width: 80, height: 80, background: 'rgba(255,255,255,0.5)', borderRadius: '50% 40% 30% 60% / 60% 40% 50% 50%', filter: 'blur(10px)', transform: 'rotate(15deg)' }}></div>
              <div style={{ width: 72, height: 72, borderRadius: 999, background: "white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.08)", position: 'relative' }}>
                <Image src="/Arrow.png" alt="Commencez à vendre" width={36} height={36} />
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "#000", marginBottom: 12, lineHeight: 1.3 }}>Commencez à<br />vendre</h3>
              <p style={{ color: "#5a5a5a", fontSize: 15, lineHeight: 1.65 }}>
                Vous partagez, nous nous occupons de vos produits, de l'impression à l'expédition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stores */}
      <section className="mp-container" style={{ marginTop: 56, padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#000" }}>Découvrez les boutiques</h2>
          <p style={{ color: "#6b7280", marginTop: 8, fontSize: 16 }}>Voici quelques-uns des magasins les plus populaires</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginTop: 32 }}>
          {[0,1,2,3].map((i) => (
            <div key={i} style={{ position: "relative" }}>
              <div style={{ border: "3px solid #b6cff5", borderRadius: 16, height: 160, background: "#ffffff" }} />
              <span style={{ position: "absolute", bottom: -12, right: -12, width: 36, height: 36, borderRadius: 999, background: "#3b82f6", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(59,130,246,0.4)" }}>
                <span style={{ color: "white", fontSize: 18 }}>✎</span>
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 48 }}>
          <button className="mp-gradient-cta" style={{ borderRadius: 9999, color: "white", fontWeight: 800, padding: "18px 48px", border: 0, cursor: "pointer", fontSize: 16, boxShadow: "0 8px 20px rgba(0,0,0,0.15)" }}>COMMENCEZ GRATUITEMENT !</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: 80, background: "#f9f9f9", borderTop: "1px solid #e5e7eb" }}>
        <div className="mp-container" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 48, padding: "40px 20px" }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 16, color: "#000", fontSize: 15 }}>Quick Links</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
              <li><a href="#" style={{ color: "#6b7280", textDecoration: "none", fontSize: 14 }}>Home</a></li>
              <li><a href="#" style={{ color: "#6b7280", textDecoration: "none", fontSize: 14 }}>Create Design</a></li>
              <li><a href="#" style={{ color: "#6b7280", textDecoration: "none", fontSize: 14 }}>Browse Stores</a></li>
              <li><a href="#" style={{ color: "#6b7280", textDecoration: "none", fontSize: 14 }}>About Us</a></li>
            </ul>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 16, color: "#000", fontSize: 15 }}>Support</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
              <li><a href="#" style={{ color: "#6b7280", textDecoration: "none", fontSize: 14 }}>Help Center</a></li>
              <li><a href="#" style={{ color: "#6b7280", textDecoration: "none", fontSize: 14 }}>Contact Us</a></li>
              <li><a href="#" style={{ color: "#6b7280", textDecoration: "none", fontSize: 14 }}>Shipping Info</a></li>
              <li><a href="#" style={{ color: "#6b7280", textDecoration: "none", fontSize: 14 }}>Returns</a></li>
            </ul>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 16, color: "#000", fontSize: 15 }}>Legal</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
              <li><a href="#" style={{ color: "#6b7280", textDecoration: "none", fontSize: 14 }}>Privacy Policy</a></li>
              <li><a href="#" style={{ color: "#6b7280", textDecoration: "none", fontSize: 14 }}>Terms of Service</a></li>
              <li><a href="#" style={{ color: "#6b7280", textDecoration: "none", fontSize: 14 }}>Cookie Policy</a></li>
            </ul>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 16, color: "#000", fontSize: 15 }}>Social</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
              <li><a href="#" style={{ color: "#6b7280", textDecoration: "none", fontSize: 14 }}>Facebook</a></li>
              <li><a href="#" style={{ color: "#6b7280", textDecoration: "none", fontSize: 14 }}>Instagram</a></li>
              <li><a href="#" style={{ color: "#6b7280", textDecoration: "none", fontSize: 14 }}>Twitter</a></li>
              <li><a href="#" style={{ color: "#6b7280", textDecoration: "none", fontSize: 14 }}>YouTube</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
