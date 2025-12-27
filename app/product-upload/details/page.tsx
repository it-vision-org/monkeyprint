'use client';

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type GenderOption = {
    id: string;
    label: string;
};

const GENDER_OPTIONS: GenderOption[] = [
    { id: "homme", label: "Homme" },
    { id: "femme", label: "Femme" },
    { id: "fille", label: "Fille" },
    { id: "enfant", label: "Enfant" },
];

const MOCKUP_OPTIONS = [
    "https://picsum.photos/seed/mock1/420/520",
    "https://picsum.photos/seed/mock2/420/520",
    "https://picsum.photos/seed/mock3/420/520",
    "https://picsum.photos/seed/mock4/420/520"
];

const MIN_PRICE = 55;

export default function ProductDetailsPage() {
    const router = useRouter();
    const [design, setDesign] = useState<string | null>(null);
    const [selectedGenders, setSelectedGenders] = useState<string[]>(["homme", "fille"]);
    const [productName, setProductName] = useState<string>("");
    const [productPrice, setProductPrice] = useState<string>("55");
    const [displayPrice, setDisplayPrice] = useState<string>("55");
    const [description, setDescription] = useState<string>("");
    const [charCount, setCharCount] = useState<number>(0);
    const [mockupModalOpen, setMockupModalOpen] = useState(false);
    const [mockupLoading, setMockupLoading] = useState(false);

    useEffect(() => {
        const saved = sessionStorage.getItem("uploadedDesign");
        if (saved) {
            setDesign(saved);
        }
    }, []);

    const profit = useMemo(() => {
        const base = parseFloat(productPrice) || 0;
        const display = parseFloat(displayPrice) || 0;
        const delta = display - base;
        return delta > 0 ? delta : 0;
    }, [productPrice, displayPrice]);

    const handleDescriptionChange = (value: string) => {
        setDescription(value);
        setCharCount(value.length);
    };

    const openMockupModal = () => {
        setMockupModalOpen(true);
        setMockupLoading(true);
        setTimeout(() => setMockupLoading(false), 600);
    };

    const closeMockupModal = () => {
        setMockupModalOpen(false);
        setMockupLoading(false);
    };

    const handleSelectMockup = (url: string) => {
        setDesign(url);
        sessionStorage.setItem("uploadedDesign", url);
        closeMockupModal();
    };

    const handleSubmit = () => {
        router.push("/dashboard/apercu");
    };

    return (
        <div className="pd-page">
            <header className="pu-header">
                <div className="pu-header-inner">
                    <Image src="/logo.png" alt="Monkey Print" width={130} height={42} />
                    <button className="pu-menu-trigger" type="button" aria-label="Ouvrir le menu">
                        <svg width={26} height={26} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                </div>
                <button className="pu-cart-bar" type="button">
                    <div className="pu-cart-content">
                        <span className="pu-cart-icon">🛒</span>
                    </div>
                    <div className="pu-cart-total">
                        55DT
                        <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                            <path d="M1 1L8 8L15 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </button>
            </header>

            <main className="pd-main">
                <div className="pd-flow">
                    <div className="pd-intro">
                        <p className="pd-intro-title">Dernière étape, remplissez la description de votre produit</p>
                        <span className="pd-intro-line" />
                    </div>

                    <section className="pd-card">
                        <div className="pd-field">
                            <div className="pd-label">
                                Sélectionner le sexe du produit :<span>*</span>
                            </div>
                            <div className="pd-required-note">Doit être rempli*</div>
                            <div className="pd-gender-row">
                                {GENDER_OPTIONS.map((option) => (
                                    <label key={option.id} className={`pd-radio-option ${selectedGenders.includes(option.id) ? "active" : ""}`}>
                                        <input
                                            type="checkbox"
                                            checked={selectedGenders.includes(option.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedGenders([...selectedGenders, option.id]);
                                                } else {
                                                    setSelectedGenders(selectedGenders.filter(g => g !== option.id));
                                                }
                                            }}
                                        />
                                        <span className="pd-radio-label">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="pd-preview-card">
                            <div className="pd-preview-image">
                                <Image src="/mock-shirt.png" alt="Mockup" width={280} height={320} />
                                <div className="pd-preview-frame">
                                    {design ? (
                                        <Image src={design} alt="Design" width={110} height={110} />
                                    ) : (
                                        <div className="pd-design-grid">
                                            <div className="pd-grid-dot"></div>
                                            <div className="pd-grid-dot"></div>
                                            <div className="pd-grid-dot"></div>
                                            <div className="pd-grid-dot"></div>
                                            <div className="pd-grid-dot active"></div>
                                            <div className="pd-grid-dot"></div>
                                            <div className="pd-grid-dot"></div>
                                            <div className="pd-grid-dot"></div>
                                            <div className="pd-grid-dot"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pd-action-row">
                            <button type="button" className="pd-action-primary" onClick={openMockupModal}>
                                GÉNÉRER UNE MAQUETTE
                            </button>
                            <button type="button" className="pd-action-refresh">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="1 4 1 10 7 10" />
                                    <polyline points="23 20 23 14 17 14" />
                                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
                                </svg>
                            </button>
                        </div>
                    </section>

                    <section className="pd-card">
                        <div className="pd-field">
                            <label htmlFor="product-name" className="pd-label">
                                Nom du produit :<span>*</span>
                            </label>
                            <div className="pd-required-note">Doit être rempli*</div>
                            <input
                                id="product-name"
                                className="pd-input"
                                type="text"
                                value={productName}
                                onChange={(event) => setProductName(event.target.value)}
                            />
                        </div>

                        <div className="pd-field">
                            <div className="pd-label">
                                Prix du produit :<span>*</span>
                            </div>
                            <div className="pd-required-note">Doit être rempli*</div>
                            <div className="pd-price-row">
                                <div className="pd-input-wrapper">
                                    <input
                                        className="pd-input"
                                        type="number"
                                        min={MIN_PRICE}
                                        value={productPrice}
                                        onChange={(event) => setProductPrice(event.target.value)}
                                    />
                                    <span className="pd-input-suffix">DT</span>
                                </div>
                                <div className="pd-profit">
                                    <span className="pd-profit-label">Tu prends</span>
                                    <button type="button" className="pd-profit-pill">{profit.toFixed(0)}DT</button>
                                </div>
                            </div>
                        </div>

                        <div className="pd-field">
                            <label htmlFor="display-price" className="pd-label">
                                Prix affiché :
                            </label>
                            <input
                                id="display-price"
                                className="pd-input"
                                type="number"
                                min={productPrice}
                                value={displayPrice}
                                onChange={(event) => setDisplayPrice(event.target.value)}
                            />
                        </div>

                        <div className="pd-field">
                            <label htmlFor="description" className="pd-label">
                                Description :
                            </label>
                            <textarea
                                id="description"
                                className="pd-textarea"
                                value={description}
                                maxLength={3000}
                                onChange={(event) => handleDescriptionChange(event.target.value)}
                            />
                            <div className="pd-textarea-counter">3000 Personnages</div>
                        </div>
                    </section>

                    <button className="pd-submit" type="button" onClick={handleSubmit}>
                        VOTRE SITE WEB EST PRÊT
                    </button>
                </div>
            </main>

            {mockupModalOpen && (
                <div className="pu-popup-overlay" onClick={() => !mockupLoading && closeMockupModal()}>
                    <div className="pu-popup" onClick={(event) => event.stopPropagation()}>
                        <button className="pu-popup-close" type="button" onClick={closeMockupModal} disabled={mockupLoading}>
                            ×
                        </button>
                        <h2 className="pu-popup-title">Choisissez une maquette</h2>
                        {mockupLoading ? (
                            <div className="pu-loading">
                                <div className="pu-spinner" />
                                <p>Préparation des maquettes...</p>
                            </div>
                        ) : (
                            <div className="pu-ai-grid">
                                {MOCKUP_OPTIONS.map((url, index) => (
                                    <button key={url} type="button" className="pu-ai-image-card" onClick={() => handleSelectMockup(url)}>
                                        <Image src={url} alt={`Maquette ${index + 1}`} width={200} height={200} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

