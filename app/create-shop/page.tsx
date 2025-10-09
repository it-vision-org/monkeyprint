'use client';

import Image from "next/image";
import { useState, useCallback } from "react";
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';

type StepDotsProps = { step: number; setStep: (s:number)=>void };
const StepDots = ({ step, setStep }: StepDotsProps) => (
    <div className="cs-stepper">
        {[1,2,3].map((s) => (
            <button
                key={s}
                className={`cs-step ${s < step ? 'filled' : ''} ${s === step ? 'active' : ''}`}
                onClick={() => { if (s < step) setStep(s); }}
                aria-label={`Aller à l'étape ${s}`}
                type="button"
            />
        ))}
    </div>
);

// Step components are defined outside the main component to prevent re-mounting on state changes
const Step1 = ({ shopName, setShopName, categories, selectedCategories, categorySearch, setCategorySearch, toggleCategory, handleAddCategory, setStep, logo, setLogo }: any) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogo(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, [setLogo]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.svg'] } });

    return (
        <>
            <div className="cs-form-header">
                <h2 className="cs-title text-center">Commencez par créer votre boutique</h2>
            </div>
            <StepDots step={1} setStep={setStep} />

            <div className="cs-logo-upload-section">
                {logo ? (
                    <div className="cs-logo-preview">
                        <Image src={logo} alt="Logo preview" width={100} height={100} />
                        <button onClick={() => setLogo(null)} className="cs-edit-logo-btn" type="button">Modifier</button>
                    </div>
                ) : (
                    <div className="cs-upload-wrapper cs-upload-container-mobile">
                        <div {...getRootProps()} className={`cs-upload-box ${isDragActive ? 'active' : ''}`}>
                            <input {...getInputProps()} />
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="cs-upload-icon-svg">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                        </div>
                        <div className="cs-upload-text-content">
                            <h3 className="cs-section-title text-center">Téléchargez votre logo</h3>
                            <p className="cs-upload-label">Compatible avec les formats PNG et JPEG.</p>
                            <p className="cs-upload-label">Format minimal 500 × 500 px.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="cs-form-section">
                <h3 className="cs-section-title text-center">Nom de votre boutique</h3>
                <p className="cs-section-subtitle">Doit être rempli<span className="cs-section-subtitle-red">*</span></p>
                <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} className="cs-input" />
            </div>

            <div className="cs-form-section">
                <h3 className="cs-section-title text-center">Catégorie de magasin</h3>
                <p className="cs-section-subtitle">Doit être rempli<span className="cs-section-subtitle-red">*</span></p>
                <div className="cs-search-container cs-search-container-mobile">
                    <div className="cs-search-input-wrapper cs-search-input-wrapper-mobile">
                        <svg className="cs-search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <input type="text" placeholder="Ajouter plus..." className="cs-input cs-search-input" value={categorySearch} onChange={e => setCategorySearch(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }} />
                    </div>
                    <button onClick={handleAddCategory} className="cs-add-tag-btn" type="button">Ajouter</button>
                </div>
                <div className="cs-tags-container">
                    {categories.map((category:any) => (
                        <button key={category} className={`cs-tag ${selectedCategories.includes(category) ? 'active' : ''}`} onClick={() => toggleCategory(category)} type="button">
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            <button className="cs-submit-button" onClick={() => setStep(2)} type="button">Suivant</button>
        </>
    );
}

const Step2 = ({ shopName, selectedTheme, setSelectedTheme, setStep, logo }: any) => (
    <>
        <div className="cs-form-header">
            <h2 className="cs-title text-center">Choisissez le thème de votre magasin</h2>
        </div>
        <StepDots step={2} setStep={setStep} />
        <div className="cs-shop-preview">
            {logo ? (
                <Image src={logo} alt="Shop Logo" width={48} height={48} className="cs-shop-logo-preview" />
            ) : (
                <Image src="/logo.png" alt="Shop Logo" width={48} height={48} className="cs-shop-logo-preview" />
            )}
            <span>{shopName}</span>
        </div>

        <div className="cs-themes-list">
            {[1, 2, 3].map(themeId => (
                <div key={themeId} className={`cs-theme-option ${selectedTheme === themeId ? 'selected' : ''}`}>
                    <div className="cs-theme-label">Design moderne</div>
                    <div className="cs-theme-media">
                        <Image src={`https://picsum.photos/seed/theme${themeId}/1200/700`} alt={`Theme ${themeId}`} width={1200} height={700} className="cs-theme-image" />
                        {selectedTheme === themeId && (
                            <div className="cs-theme-check" aria-hidden>✓</div>
                        )}
                    </div>
                    <div className="cs-theme-actions">
                        <button className="cs-ghost-btn" onClick={() => setSelectedTheme(themeId)} type="button">
                            {selectedTheme === themeId ? 'Sélectionné' : 'Choisir ce thème'}
                        </button>
                    </div>
                </div>
            ))}
        </div>

        <p className="cs-more-themes-text">D'autres arrivent...</p>

        <div className="cs-nav-buttons">
            <button className="cs-back-button" onClick={() => setStep(1)} type="button">Précédent</button>
            <button className="cs-submit-button" onClick={() => setStep(3)} disabled={!selectedTheme} type="button">Suivant</button>
        </div>
    </>
);

const Step3 = ({ shopName, setStep, logo, router }: any) => {
    const [email, setEmail] = useState("GrabMeShoe@gmail.com");
    const [password, setPassword] = useState("123456789@gms");

    return (
        <>
            <div className="cs-form-header">
                <h2 className="cs-title text-center">Créer un compte</h2>
            </div>
            <StepDots step={3} setStep={setStep} />
            
            <div className="cs-shop-preview">
                {logo ? 
                    <Image src={logo} alt="Shop Logo" width={48} height={48} className="cs-shop-logo-preview" /> : 
                    <Image src="/logo.png" alt="Shop Logo" width={48} height={48} className="cs-shop-logo-preview" />
                }
                <span>{shopName}</span>
            </div>

            <div className="cs-form-section">
                <h3 className="cs-section-title text-center">Entrez votre adresse e-mail<br/>Ou numéro de téléphone</h3>
                <p className="cs-section-subtitle">Doit être rempli<span className="cs-section-subtitle-red">*</span></p>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="cs-input" />
            </div>

            <div className="cs-form-section">
                <h3 className="cs-section-title text-center">Créer un mot de passe</h3>
                <p className="cs-section-subtitle">Doit être rempli<span className="cs-section-subtitle-red">*</span></p>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="cs-input" />
            </div>

            <div className="cs-divider-standalone">Ou</div>
            
            <button className="cs-google-signin-standalone" type="button">
                <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={24} height={24} />
                Sign in with Google
            </button>

            <div className="cs-nav-buttons single-next">
                <button className="cs-back-button" onClick={() => setStep(2)} type="button">Précédent</button>
                <button className="cs-submit-button" onClick={() => router.push('/product-upload')} type="button">S'inscrire</button>
            </div>
        </>
    );
};

export default function CreateShopPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [shopName, setShopName] = useState("GrabMeShoe");
    const [logo, setLogo] = useState<string | null>(null);
    const [categories, setCategories] = useState([
        "Sport", "Travel", "Kids", "Streetwear", "Hip hop", "Music", "Brands"
    ]);
    const [selectedCategories, setSelectedCategories] = useState(["Streetwear", "Music"]);
    const [categorySearch, setCategorySearch] = useState("");
    const [selectedTheme, setSelectedTheme] = useState<number | null>(1);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handleAddCategory = () => {
        const trimmedSearch = categorySearch.trim();
        if (trimmedSearch && !categories.find(c => c.toLowerCase() === trimmedSearch.toLowerCase())) {
            setCategories(prev => [...prev, trimmedSearch]);
            setSelectedCategories(prev => [...prev, trimmedSearch]);
            setCategorySearch("");
        }
    };

    return (
        <div className="create-shop-page">
            <header style={{ borderBottom: "1px solid #e5e7eb", background: "white" }}>
                <div className="mp-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 80, padding: "0 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                        <Image src="/logo.png" alt="Monkey Print" width={120} height={40} style={{ objectFit: "contain" }} />
                        <nav className="mp-desktop-nav" style={{ display: "flex", gap: 32, fontWeight: 600, color: "#0d9488", fontSize: 15 }}>
                            <a href="/" style={{ textDecoration: "none", color: "#0d9488" }}>ACCUEIL</a>
                            <a href="#" style={{ textDecoration: "none", color: "#0d9488" }}>SHOP LIST</a>
                            <a href="#" style={{ textDecoration: "none", color: "#0d9488" }}>CONTACTEZ-NOUS</a>
                        </nav>
                    </div>
                    <button className="mp-mobile-trigger" onClick={() => setMobileMenuOpen(true)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </header>

            {mobileMenuOpen && (
                <div className="mp-mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
                    <div className="mp-mobile-sheet" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setMobileMenuOpen(false)} style={{ background: "none", border: "none", color: "white", fontSize: "32px", cursor: "pointer", marginBottom: "20px" }}>×</button>
                        <nav className="mp-mobile-menu">
                            <a href="/" className="mp-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                <span className="mp-mobile-icon">🏠</span>
                                ACCUEIL
                            </a>
                            <a href="#" className="mp-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                <span className="mp-mobile-icon">🛍️</span>
                                SHOP LIST
                            </a>
                            <a href="#" className="mp-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                <span className="mp-mobile-icon">✉️</span>
                                CONTACTEZ-NOUS
                            </a>
                        </nav>
                    </div>
                </div>
            )}

            <main className="cs-main">
                <div className="cs-form-container">
                    {step === 1 && <Step1 
                        shopName={shopName} setShopName={setShopName}
                        categories={categories} selectedCategories={selectedCategories}
                        categorySearch={categorySearch} setCategorySearch={setCategorySearch}
                        toggleCategory={toggleCategory} handleAddCategory={handleAddCategory}
                        setStep={setStep} logo={logo} setLogo={setLogo}
                    />}
                    {step === 2 && <Step2 
                        shopName={shopName} 
                        selectedTheme={selectedTheme} setSelectedTheme={setSelectedTheme}
                        setStep={setStep}
                        logo={logo}
                    />}
                    {step === 3 && <Step3 
                        shopName={shopName}
                        setStep={setStep}
                        logo={logo}
                        router={router}
                    />}
                </div>
            </main>
        </div>
    );
}
