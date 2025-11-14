'use client';

import Image from "next/image";
import { useState, useCallback } from "react";
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';

type StepDotsProps = { step: number; setStep: (s:number)=>void };
const StepDots = ({ step, setStep }: StepDotsProps) => {
    return (
        <div className="cs-stepper">
            {[1, 2, 3].map((s) => (
                <button
                    key={s}
                    className={`cs-step ${s < step ? 'filled' : ''} ${s === step ? 'active' : ''}`}
                    onClick={() => {
                        if (s < step) setStep(s);
                    }}
                    aria-label={`Aller à l'étape ${s}`}
                    type="button"
                />
            ))}
        </div>
    );
};

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
        <div className="cs-screen">
            <div className="cs-screen-header">
                <h2 className="cs-screen-title">Commencez par créer votre boutique</h2>
                <StepDots step={1} setStep={setStep} />
            </div>

            <div className="cs-card cs-card-upload">
                {logo ? (
                    <div className="cs-logo-preview">
                        <Image src={logo} alt="Logo preview" width={96} height={96} />
                        <button onClick={() => setLogo(null)} className="cs-edit-logo-btn" type="button">
                            Modifier
                        </button>
                    </div>
                ) : (
                    <div className="cs-upload-body" {...getRootProps()}>
                        <input {...getInputProps()} />
                        <div className={`cs-upload-icon ${isDragActive ? "active" : ""}`}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>
                        <div className="cs-upload-copy">
                            <h3>Téléchargez votre logo</h3>
                            <p>Compatible avec les formats PNG et JPEG.</p>
                            <p>Format minimal 500 × 500 px.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="cs-card">
                <div className="cs-card-heading">
                    <h3>Nom de votre boutique</h3>
                    <span>Doit être rempli<span>*</span></span>
                </div>
                <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} className="cs-pill-input" />
            </div>

            <div className="cs-card">
                <div className="cs-card-heading">
                    <h3>Catégorie de magasin</h3>
                    <span>Doit être rempli<span>*</span></span>
                </div>
                <div className="cs-search-row">
                    <div className="cs-search-pill">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <path d="M10 4.16667V15.8333M4.16667 10H15.8333" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Ajouter plus..."
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddCategory();
                                }
                            }}
                        />
                    </div>
                    <button onClick={handleAddCategory} className="cs-outline-btn" type="button">
                        Ajouter
                    </button>
                </div>
                <div className="cs-tags-grid">
                    {categories.map((category: any) => (
                        <button
                            key={category}
                            className={`cs-chip ${selectedCategories.includes(category) ? "active" : ""}`}
                            onClick={() => toggleCategory(category)}
                            type="button"
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            <button className="cs-primary-btn" onClick={() => setStep(2)} type="button">
                Suivant
            </button>
        </div>
    );
};

const Step2 = ({ shopName, selectedTheme, setSelectedTheme, setStep, logo }: any) => {
    const themes = [
        { id: 1, label: "Design moderne", image: "/theme-1.png" },
        { id: 2, label: "Design audacieux", image: "/theme-2.png" },
        { id: 3, label: "Design minimal", image: "/theme-3.png" },
    ];

    const currentIndex = Math.max(0, themes.findIndex((item) => item.id === selectedTheme));

    const handlePrev = () => {
        if (currentIndex === 0) {
            setSelectedTheme(themes[themes.length - 1].id);
        } else {
            setSelectedTheme(themes[currentIndex - 1].id);
        }
    };

    const handleNext = () => {
        if (currentIndex === themes.length - 1) {
            setSelectedTheme(themes[0].id);
        } else {
            setSelectedTheme(themes[currentIndex + 1].id);
        }
    };

    return (
        <div className="cs-screen">
            <div className="cs-screen-header">
                <h2 className="cs-screen-title">Choisissez le thème de votre magasin</h2>
                <StepDots step={2} setStep={setStep} />
            </div>

            <div className="cs-card cs-card-summary">
                <div className="cs-shop-badge">
                    {logo ? (
                        <Image src={logo} alt="Shop Logo" width={56} height={56} />
                    ) : (
                        <Image src="/logo.png" alt="Shop Logo" width={56} height={56} />
                    )}
                </div>
                <span>{shopName}</span>
            </div>

            <div className="cs-theme-section">
                <h3>{themes[currentIndex]?.label}</h3>
                <div className="cs-theme-carousel">
                    {themes.map((theme, index) => {
                        const position = index - currentIndex;
                        let state = "hidden";
                        if (position === 0) state = "current";
                        if (position === -1 || (currentIndex === 0 && index === themes.length - 1)) state = "previous";
                        if (position === 1 || (currentIndex === themes.length - 1 && index === 0)) state = "next";
                        return (
                            <button
                                key={theme.id}
                                type="button"
                                className={`cs-theme-card ${state} ${selectedTheme === theme.id ? "selected" : ""}`}
                                onClick={() => setSelectedTheme(theme.id)}
                            >
                                <Image src={theme.image} alt={theme.label} width={960} height={540} />
                            </button>
                        );
                    })}
                </div>
                <div className="cs-theme-controls">
                    <button type="button" onClick={handlePrev} className="cs-round-nav">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <path d="M12.5 4.16669L7.5 10L12.5 15.8334" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <button type="button" onClick={handleNext} className="cs-round-nav">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <path d="M7.5 4.16669L12.5 10L7.5 15.8334" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>

            <p className="cs-theme-hint">D'autres arrivent...</p>

            <div className="cs-dual-actions">
                <button className="cs-ghost-btn" onClick={() => setStep(1)} type="button">
                    Précédent
                </button>
                <button className="cs-primary-btn" onClick={() => setStep(3)} disabled={!selectedTheme} type="button">
                    Suivant
                </button>
            </div>
        </div>
    );
};

const Step3 = ({ shopName, setStep, logo, router }: any) => {
    const [email, setEmail] = useState("GrabMeShoe@gmail.com");
    const [password, setPassword] = useState("123456789@gms");

    return (
        <div className="cs-screen">
            <div className="cs-screen-header">
                <h2 className="cs-screen-title">Créer un compte</h2>
                <StepDots step={3} setStep={setStep} />
            </div>

            <div className="cs-card cs-card-summary">
                <div className="cs-shop-badge">
                    {logo ? (
                        <Image src={logo} alt="Shop Logo" width={56} height={56} />
                    ) : (
                        <Image src="/logo.png" alt="Shop Logo" width={56} height={56} />
                    )}
                </div>
                <span>{shopName}</span>
            </div>

            <div className="cs-card">
                <div className="cs-card-heading cs-heading-multiline">
                    <h3>Entrez votre adresse e-mail<br />Ou numéro de téléphone</h3>
                    <span>Doit être rempli<span>*</span></span>
                </div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="cs-pill-input" />
            </div>

            <div className="cs-card">
                <div className="cs-card-heading">
                    <h3>Créer un mot de passe</h3>
                    <span>Doit être rempli<span>*</span></span>
                </div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="cs-pill-input" />
            </div>

            <div className="cs-divider-standalone">Ou</div>

            <button className="cs-google-btn" type="button">
                <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={24} height={24} />
                Sign in with Google
            </button>

            <div className="cs-dual-actions">
                <button className="cs-ghost-btn" onClick={() => setStep(2)} type="button">
                    Précédent
                </button>
                <button className="cs-primary-btn" onClick={() => router.push('/product-upload')} type="button">
                    S'inscrire
                </button>
            </div>
        </div>
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
            <header className="cs-topbar">
                <div className="cs-topbar-inner">
                    <Image src="/logo.png" alt="Monkey Print" width={120} height={40} />
                    <button className="cs-menu-trigger" onClick={() => setMobileMenuOpen(true)} type="button" aria-label="Ouvrir le menu">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="4" y1="6" x2="20" y2="6" />
                            <line x1="4" y1="12" x2="20" y2="12" />
                            <line x1="4" y1="18" x2="20" y2="18" />
                        </svg>
                    </button>
                </div>
                <nav className="cs-desktop-nav">
                    <a href="/">ACCUEIL</a>
                    <a href="#">SHOP LIST</a>
                    <a href="#">CONTACTEZ-NOUS</a>
                </nav>
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
                <div className="cs-flow">
                    {step === 1 && (
                        <Step1
                            shopName={shopName}
                            setShopName={setShopName}
                            categories={categories}
                            selectedCategories={selectedCategories}
                            categorySearch={categorySearch}
                            setCategorySearch={setCategorySearch}
                            toggleCategory={toggleCategory}
                            handleAddCategory={handleAddCategory}
                            setStep={setStep}
                            logo={logo}
                            setLogo={setLogo}
                        />
                    )}
                    {step === 2 && (
                        <Step2
                            shopName={shopName}
                            selectedTheme={selectedTheme}
                            setSelectedTheme={setSelectedTheme}
                            setStep={setStep}
                            logo={logo}
                        />
                    )}
                    {step === 3 && (
                        <Step3
                            shopName={shopName}
                            setStep={setStep}
                            logo={logo}
                            router={router}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
