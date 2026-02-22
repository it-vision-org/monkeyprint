'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import styles from './createShop.module.css';
import { StepDots, MainHeader, LoadingButton, type MenuItem } from '@/components';
import { registerUser, createStore } from './actions';

const createShopMenuItems: MenuItem[] = [
    { label: "Accueil", href: "/", icon: "🏠" },
    { label: "Découvrez les boutiques", href: "/stores", icon: "🔥" },
    { label: "Contactez-nous", href: "/contact", icon: "💬" },
];

type CreateShopContentProps = {
    initialSession?: Session | null;
    hasStore?: boolean;
};

// Step 2: Theme Selection
const Step2Theme = ({ shopName, selectedTheme, setSelectedTheme, setStep, logo }: any) => {
    const themes = [
        { id: 'theme-1', label: "Design moderne", image: "/theme-1.png" },
        { id: 'theme-2', label: "Design audacieux", image: "/theme-2.png" },
        { id: 'theme-3', label: "Design minimal", image: "/theme-3.png" },
    ];

    const currentThemeId = selectedTheme || 'theme-1';
    const currentIndex = Math.max(0, themes.findIndex((item) => item.id === currentThemeId));

    const handlePrev = () => {
        const nextIndex = currentIndex === 0 ? themes.length - 1 : currentIndex - 1;
        setSelectedTheme(themes[nextIndex].id);
    };

    const handleNext = () => {
        const nextIndex = currentIndex === themes.length - 1 ? 0 : currentIndex + 1;
        setSelectedTheme(themes[nextIndex].id);
    };

    return (
        <div className={styles.step2Container}>
            <h2 className={styles.mainTitle}>Choisissez le thème de votre magasin</h2>
            <StepDots
                currentStep={2}
                totalSteps={3}
                onStepClick={(s) => {
                    if (s === 1) setStep(1);
                }}
                className={styles.stepDots}
                dotClassName={styles.stepDot}
                filledClassName={styles.filled}
            />

            <div className={`${styles['cs-card']} ${styles['cs-card-summary']}`}>
                <div className={styles['cs-shop-badge']}>
                    {logo ? (
                        <Image src={logo} alt="Shop Logo" width={56} height={56} style={{ objectFit: 'contain', width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%' }} />
                    ) : (
                        <Image src="/logo.png" alt="Shop Logo" width={56} height={56} />
                    )}
                </div>
                <span>{shopName}</span>
            </div>

            <div className={styles['cs-theme-label']}>{themes[currentIndex]?.label}</div>

            <div className={styles['cs-theme-section']}>
                <div className={styles['cs-theme-carousel']}>
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
                                className={`${styles['cs-theme-card']} ${styles[state]} ${selectedTheme === theme.id ? styles.selected : ""}`}
                                onClick={() => setSelectedTheme(theme.id)}
                            >
                                <Image src={theme.image} alt={theme.label} width={960} height={540} />
                            </button>
                        );
                    })}
                </div>
                <div className={styles['cs-theme-controls']}>
                    <button type="button" onClick={handlePrev} className={styles['cs-round-nav']}>
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <path d="M12.5 4.16669L7.5 10L12.5 15.8334" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
                        </svg>
                    </button>
                    <button type="button" onClick={handleNext} className={styles['cs-round-nav']}>
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <path d="M7.5 4.16669L12.5 10L7.5 15.8334" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className={styles.buttonGroup}>
                <button
                    type="button"
                    className={styles.backBtn}
                    onClick={() => setStep(1)}
                >
                    RETOUR
                </button>
                <LoadingButton
                    className={styles['cs-primary-btn']}
                    onClick={() => setStep(3)}
                    type="button"
                >
                    SUIVANT
                </LoadingButton>
            </div>
        </div>
    );
};

// Step 3 for logged-in users: Just create the store (no account creation)
const Step3StoreCreation = ({ shopName, logo, setStep, onCreateShop }: any) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await onCreateShop();
            // Check if createStore returned an error
            if (result && result.error) {
                setError(result.error);
                setIsLoading(false);
                return;
            }
        } catch (storeError: any) {
            // If createStore redirects, it throws NEXT_REDIRECT which is expected
            if (storeError?.digest?.startsWith('NEXT_REDIRECT') ||
                storeError?.message?.includes('NEXT_REDIRECT')) {
                // This is expected - redirect is happening
                return;
            }
            console.error('Store creation error:', storeError);
            setError(storeError?.message || 'Failed to create store');
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.step1Container}>
            <h2 className={styles.mainTitle}>Créer votre boutique</h2>
            <StepDots
                currentStep={3}
                totalSteps={3}
                onStepClick={(s) => {
                    if (s === 1) setStep(1);
                    if (s === 2) setStep(2);
                }}
                className={styles.stepDots}
                dotClassName={styles.stepDot}
                filledClassName={styles.filled}
            />

            <div className={`${styles['cs-card']} ${styles['cs-card-profile']}`}>
                <div className={styles['cs-profile-picture']}>
                    {logo ? (
                        <Image src={logo} alt="Profile" width={96} height={96} style={{ objectFit: 'contain', borderRadius: '50%', width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%' }} />
                    ) : (
                        <Image src="/logo.png" alt="Profile" width={96} height={96} />
                    )}
                </div>
                <span className={styles['cs-profile-username']}>{shopName}</span>
            </div>

            <form onSubmit={handleSubmit}>
                <div className={styles['cs-card']}>
                    {error && <p style={{ color: 'red', marginTop: 10, marginBottom: 10 }}>{error}</p>}
                    <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
                        Vous êtes connecté. Cliquez sur le bouton ci-dessous pour créer votre boutique.
                    </p>
                </div>

                <div className={styles.buttonGroup}>
                    <button
                        type="button"
                        className={styles.backBtn}
                        onClick={() => setStep(2)}
                    >
                        RETOUR
                    </button>
                    <LoadingButton
                        className={styles['cs-primary-btn']}
                        type="submit"
                        isLoading={isLoading}
                    >
                        {isLoading ? 'CREATION EN COURS...' : "CRÉER LA BOUTIQUE"}
                    </LoadingButton>
                </div>
            </form>
        </div>
    );
};

// Step 3 for non-logged-in users: Account creation + store creation
const Step3AccountFull = ({ shopName, logo, setStep, router, email, setEmail, password, setPassword, onCreateShop }: any) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        try {
            const result = await registerUser(formData);
            if (result && result.error) {
                setError(result.error);
                setIsLoading(false);
                return; // Stop execution if there's an error
            }
            // Registration successful, now create the store
            try {
                const storeResult = await onCreateShop();
                // Check if createStore returned an error
                if (storeResult && storeResult.error) {
                    setError(storeResult.error);
                    setIsLoading(false);
                    return;
                }
            } catch (storeError: any) {
                // If createStore redirects, it throws NEXT_REDIRECT which is expected
                // Don't show this as an error to the user
                if (storeError?.digest?.startsWith('NEXT_REDIRECT') ||
                    storeError?.message?.includes('NEXT_REDIRECT')) {
                    // This is expected - redirect is happening
                    return;
                }
                console.error('Store creation error:', storeError);
                setError(storeError?.message || 'Failed to create store');
                setIsLoading(false);
            }
        } catch (e: any) {
            // Check if it's a redirect error (which is actually success)
            if (e?.digest?.startsWith('NEXT_REDIRECT') ||
                e?.message?.includes('NEXT_REDIRECT')) {
                // This is expected - redirect is happening, registration was successful
                return;
            }
            console.error('Registration error:', e);
            setError('Something went wrong');
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.step1Container}>
            <h2 className={styles.mainTitle}>Créer un compte</h2>
            <StepDots
                currentStep={3}
                totalSteps={3}
                onStepClick={(s) => {
                    if (s === 1) setStep(1);
                    if (s === 2) setStep(2);
                }}
                className={styles.stepDots}
                dotClassName={styles.stepDot}
                filledClassName={styles.filled}
            />

            <div className={`${styles['cs-card']} ${styles['cs-card-profile']}`}>
                <div className={styles['cs-profile-picture']}>
                    {logo ? (
                        <Image src={logo} alt="Profile" width={96} height={96} style={{ objectFit: 'contain', borderRadius: '50%', width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%' }} />
                    ) : (
                        <Image src="/logo.png" alt="Profile" width={96} height={96} />
                    )}
                </div>
                <span className={styles['cs-profile-username']}>{shopName}</span>
            </div>

            <form onSubmit={handleSubmit}>
                <div className={styles['cs-card']}>
                    <div className={`${styles['cs-card-heading']} ${styles['cs-heading-multiline']}`}>
                        <h3>Entrez votre adresse e-mail<br />Ou numéro de téléphone</h3>
                        <span>Doit être rempli<span>*</span></span>
                    </div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles['cs-pill-input']}
                        required
                        autoComplete="email"
                    />

                    <div className={styles['cs-card-heading']} style={{ marginTop: '8px' }}>
                        <h3>Créer un mot de passe</h3>
                        <span>Doit être rempli<span>*</span></span>
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles['cs-pill-input']}
                        required
                        autoComplete="new-password"
                    />
                    {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
                </div>

                <div className={styles['cs-divider-standalone']}>Ou</div>

                {/* Google button kept as placeholder for UI consistency, non-functional for now */}
                <button className={styles['cs-google-btn']} type="button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Sign in with Google
                </button>

                <div className={styles.buttonGroup}>
                    <button
                        type="button"
                        className={styles.backBtn}
                        onClick={() => setStep(2)}
                    >
                        RETOUR
                    </button>
                    <LoadingButton
                        className={styles['cs-primary-btn']}
                        type="submit"
                        isLoading={isLoading}
                    >
                        {isLoading ? 'CREATION EN COURS...' : "CRÉER LA BOUTIQUE"}
                    </LoadingButton>
                </div>
            </form>
        </div>
    );
};

// Step 1: Store Details (First Step)
const Step1StoreDetails = ({ shopName, setShopName, categories, selectedCategories, categorySearch, setCategorySearch, toggleCategory, handleAddCategory, setStep, logo, setLogo, logoFile, setLogoFile }: any) => {

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogo(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, [setLogo, setLogoFile]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.svg'] } });

    return (
        <div className={styles.step3Container}>
            <h2 className={styles.mainTitle}>Commencez par créer votre boutique</h2>
            <StepDots
                currentStep={1}
                totalSteps={3}
                onStepClick={() => { }}
                className={styles.stepDots}
                dotClassName={styles.stepDot}
                filledClassName={styles.filled}
            />

            {/* Card 1: Logo Upload */}
            <div className={styles.card1}>
                <div className={styles.uploadArea} {...getRootProps()}>
                    <input {...getInputProps()} />
                    {logo ? (
                        <Image
                            src={logo}
                            alt="Logo"
                            width={98}
                            height={98}
                            style={{
                                borderRadius: '9px',
                                objectFit: 'contain',
                                width: '100%',
                                height: '100%',
                                maxWidth: '100%',
                                maxHeight: '100%'
                            }}
                        />
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
                    placeholder=""
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

            <LoadingButton
                className={`${styles['cs-primary-btn']} ${styles.step3Button}`}
                onClick={() => setStep(2)}
                type="button"
            >
                SUIVANT
            </LoadingButton>
        </div>
    );
};


export default function CreateShopContent({ initialSession, hasStore = false }: CreateShopContentProps) {
    const router = useRouter();
    const { data: clientSession } = useSession();
    // Use initialSession if provided (from server), otherwise use client session
    const session = initialSession !== undefined ? initialSession : clientSession;
    const isLoggedIn = !!session?.user;

    // Logical step flow:
    // Step 1: Store Details (name, logo, categories)
    // Step 2: Theme Selection
    // Step 3: Account Creation (register and create store) OR Store Creation (if logged in)
    const [step, setStep] = useState(1);

    const [shopName, setShopName] = useState("");
    const [logo, setLogo] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [categories, setCategories] = useState([
        "Sport", "Travel", "Kids", "Streetwear", "Hip hop", "Music", "Brands"
    ]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [categorySearch, setCategorySearch] = useState("");
    const [selectedTheme, setSelectedTheme] = useState<string>('theme-1');

    // Prevent body scrolling on mobile - container handles scrolling internally
    useEffect(() => {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';

            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, []);

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

    const handleCreateShop = async () => {
        const formData = new FormData();
        formData.append('shopName', shopName);
        formData.append('theme', selectedTheme);
        // Only append email if not logged in (for the old flow)
        if (!isLoggedIn && email) {
            formData.append('email', email);
        }
        if (logoFile) {
            formData.append('logo', logoFile);
        }

        const result = await createStore(null, formData);
        // If there's an error, return it so the calling component can display it
        if (result && result.error) {
            return result;
        }
        // Otherwise, redirect will happen
        return result;
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

            {/* Nav Bar */}
            <MainHeader menuItems={createShopMenuItems} initialSession={initialSession} hasStore={hasStore} />

            {/* Main Content */}
            <main>
                {step === 1 && (
                    <Step1StoreDetails
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
                        logoFile={logoFile}
                        setLogoFile={setLogoFile}
                    />
                )}
                {step === 2 && (
                    <Step2Theme
                        shopName={shopName}
                        selectedTheme={selectedTheme}
                        setSelectedTheme={setSelectedTheme}
                        setStep={setStep}
                        logo={logo}
                    />
                )}
                {step === 3 && (
                    isLoggedIn ? (
                        <Step3StoreCreation
                            shopName={shopName}
                            logo={logo}
                            setStep={setStep}
                            onCreateShop={handleCreateShop}
                        />
                    ) : (
                        <Step3AccountFull
                            shopName={shopName}
                            logo={logo}
                            setStep={setStep}
                            router={router}
                            email={email}
                            setEmail={setEmail}
                            password={password}
                            setPassword={setPassword}
                            onCreateShop={handleCreateShop}
                        />
                    )
                )}
            </main>
        </div>
    );
}

