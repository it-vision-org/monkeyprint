'use client';

import Image from "next/image";
import { useState, useCallback } from "react";
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import styles from './createShop.module.css';
import Navbar from '@/components/Navbar';
import MobileMenu from '@/components/MobileMenu';
import StepDots from '@/components/StepDots';
import type { MenuItem } from '@/components/types';

const createShopMenuItems: MenuItem[] = [
    { label: "Accueil", href: "/", icon: "🏠" },
    { label: "Découvrez les boutiques", href: "/#stores", icon: "🔥" },
    { label: "Contactez-nous", href: "#", icon: "💬" },
];

// Step 1: Account Creation
const Step1 = ({ shopName, logo, setStep, router }: any) => {
    const [email, setEmail] = useState("GrabMeShoe@gmail.com");
    const [password, setPassword] = useState("123456789@gms");

    return (
        <div className="cs-screen" style={{ position: 'relative', zIndex: 5, padding: '20px 18px', paddingTop: '20px', minHeight: 'calc(100vh - 56px)' }}>
            <div className="cs-screen-header" style={{ position: 'relative' }}>
                <h2 className="cs-screen-title">Créer un compte</h2>
                <StepDots
                    currentStep={1}
                    totalSteps={3}
                    onStepClick={(s) => {
                        if (s <= 1) setStep(s);
                    }}
                    className={styles.stepDots}
                    dotClassName={styles.stepDot}
                    filledClassName={styles.filled}
                />
            </div>

            <div className="cs-card cs-card-profile">
                <div className="cs-profile-picture">
                    {logo ? (
                        <Image src={logo} alt="Profile" width={96} height={96} />
                    ) : (
                        <Image src="/logo.png" alt="Profile" width={96} height={96} />
                    )}
                </div>
                <span className="cs-profile-username">{shopName}</span>
            </div>

            <div className="cs-card">
                <div className="cs-card-heading cs-heading-multiline">
                    <h3>Entrez votre adresse e-mail<br />Ou numéro de téléphone</h3>
                    <span>Doit être rempli<span>*</span></span>
                </div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="cs-pill-input" />
                
                <div className="cs-card-heading" style={{ marginTop: '8px' }}>
                    <h3>Créer un mot de passe</h3>
                    <span>Doit être rempli<span>*</span></span>
                </div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="cs-pill-input" />
            </div>

            <div className="cs-divider-standalone">Ou</div>

            <button className="cs-google-btn" type="button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
            </button>

            <button className="cs-primary-btn" onClick={() => router.push('/product-upload')} type="button">
                S'INSCRIE
            </button>
        </div>
    );
};

// Step 2: Theme Selection
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
        <div className="cs-screen" style={{ position: 'relative', zIndex: 5, padding: '20px 18px', paddingTop: '80px', minHeight: 'calc(100vh - 56px)' }}>
            <div className="cs-screen-header" style={{ position: 'relative' }}>
                <h2 className="cs-screen-title">Choisissez le thème de votre magasin</h2>
                <StepDots
                    currentStep={2}
                    totalSteps={3}
                    onStepClick={(s) => {
                        if (s <= 2) setStep(s);
                    }}
                    className={styles.stepDots}
                    dotClassName={styles.stepDot}
                    filledClassName={styles.filled}
                />
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

            <div className="cs-theme-label">{themes[currentIndex]?.label}</div>

            <div className="cs-theme-section">
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
                            <path d="M12.5 4.16669L7.5 10L12.5 15.8334" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
                        </svg>
                    </button>
                    <button type="button" onClick={handleNext} className="cs-round-nav">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <path d="M7.5 4.16669L12.5 10L7.5 15.8334" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
                        </svg>
                    </button>
                </div>
            </div>

            <button className="cs-primary-btn" onClick={() => setStep(1)} disabled={!selectedTheme} type="button">
                SUIVANT
            </button>
        </div>
    );
};

// Step 3: Store Creation
const Step3 = ({ shopName, setShopName, categories, selectedCategories, categorySearch, setCategorySearch, toggleCategory, handleAddCategory, setStep, logo, setLogo, router }: any) => {
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
        <div className={styles.step3Container}>
            <h2 className={styles.mainTitle}>Commencez par créer votre boutique</h2>
            <StepDots
                currentStep={3}
                totalSteps={3}
                onStepClick={(s) => {
                    if (s <= 3) setStep(s);
                }}
                className={styles.stepDots}
                dotClassName={styles.stepDot}
                filledClassName={styles.filled}
            />

            {/* Card 1: Logo Upload */}
            <div className={styles.card1}>
                <div className={styles.uploadArea} {...getRootProps()}>
                    <input {...getInputProps()} />
                    {logo ? (
                        <Image src={logo} alt="Logo" width={98} height={98} style={{ borderRadius: '9px', objectFit: 'cover' }} />
                    ) : (
                        <div className={styles.uploadIcon}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>
                    )}
                </div>
                <div className={styles.uploadTextContainer}>
                    <h3 className={styles.uploadTitle}>Téléchargez votre logo</h3>
                    <p className={styles.uploadDescription}>Compatible avec les formats PNG et JPEG. Format minimal 500 x 500 px.</p>
                </div>
            </div>

            {/* Card 2: Store Name */}
            <div className={styles.card2}>
                <h3 className={styles.card2Title}>Nom de votre boutique</h3>
                <p className={styles.card2Required}>Doit être rempli*</p>
                <input 
                    type="text" 
                    value={shopName} 
                    onChange={(e) => setShopName(e.target.value)} 
                    className={styles.storeNameInput}
                    placeholder="GrabMeShoe"
                />
            </div>

            {/* Card 3: Store Category */}
            <div className={styles.card3}>
                <h3 className={styles.card3Title}>Catégorie de magasin</h3>
                <p className={styles.card3Required}>Doit être rempli*</p>
                
                <div className={styles.searchContainer}>
                    <div className={styles.searchPill}>
                        <div className={styles.searchIcon}>
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                        </div>
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
                            className={styles.searchInput}
                        />
                    </div>
                </div>

                <div className={styles.categoryTags}>
                    {categories.map((category: any, index: number) => (
                        <button
                            key={`${category}-${index}`}
                            className={`${styles.categoryTag} ${selectedCategories.includes(category) ? styles.active : ""}`}
                            onClick={() => toggleCategory(category)}
                            type="button"
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            <button 
                className={`cs-primary-btn ${styles.step3Button}`}
                onClick={() => setStep(2)} 
                type="button"
            >
                SUIVANT
            </button>
        </div>
    );
};


export default function CreateShopPage() {
    const router = useRouter();
    const [step, setStep] = useState(3);
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
        <div className={styles.createShopContainer}>
            {/* Background with gradients */}
            <div className={styles.backgroundV4}>
                <div className={styles.backgroundGradient1}></div>
                <div className={styles.backgroundGradient2}></div>
                <div className={styles.backgroundGradient3}></div>
                <div className={styles.backgroundGradient4}></div>
            </div>

            {/* Nav Bar - Custom implementation due to unique menu styling */}
            <header className={styles.navBar}>
                <div className={styles.logoContainer}>
                    <Image src="/logo.png" alt="Monkey Print" width={84} height={42} className={styles.logo} />
                    <span className={styles.logoText}>MONKEY PRINT</span>
                </div>
                <button 
                    className={styles.menuButton} 
                    onClick={() => setMobileMenuOpen(true)} 
                    type="button" 
                    aria-label="Ouvrir le menu"
                >
                    <div className={styles.menuButtonLine}></div>
                    <div className={styles.menuButtonLine}></div>
                    <div className={styles.menuButtonLine}></div>
                </button>
            </header>

            {/* Custom Mobile Menu Slide - unique styling for create-shop page */}
            <div className={`${styles.menuSlide} ${mobileMenuOpen ? styles.open : ''}`}>
                <button onClick={() => setMobileMenuOpen(false)} style={{ background: "none", border: "none", color: "white", fontSize: "32px", cursor: "pointer", marginBottom: "20px", padding: "20px" }}>×</button>
                <nav style={{ padding: "20px 18px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    {createShopMenuItems.map((item, index) => (
                        <a 
                            key={index}
                            href={item.href} 
                            style={{ color: "white", textDecoration: "none", fontSize: "20px", display: "flex", alignItems: "center", gap: "12px" }} 
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {item.icon && <span style={{ fontSize: 22 }}>{item.icon}</span>}
                            {item.label}
                        </a>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <main>
                {step === 3 && (
                    <Step3
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
                        router={router}
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
                {step === 1 && (
                    <Step1
                        shopName={shopName}
                        logo={logo}
                        setStep={setStep}
                        router={router}
                    />
                )}
            </main>
        </div>
    );
}
