'use client';

import Image from "next/image";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";

type ProductCard = {
    id: string;
    name: string;
    image: string;
    badge?: string;
};

type ColorSwatch = {
    id: string;
    hex: string;
    label: string;
};

type QualityOption = {
    id: string;
    label: string;
    price: number;
};

const PRODUCT_TYPES: ProductCard[] = [
    { id: "hoodie", name: "Hoodie", image: "/Hoodie.png", badge: "30DT" },
    { id: "tshirt", name: "T-Shirt", image: "/T-Shirt.png", badge: "20DT" },
    { id: "hoodie2", name: "Hoodie", image: "/Hoodie.png" },
    { id: "tshirt2", name: "T-Shirt", image: "/T-Shirt.png" },
    { id: "hoodie3", name: "Hoodie", image: "/Hoodie.png" },
    { id: "tshirt3", name: "T-Shirt", image: "/T-Shirt.png" },
];

const COLOR_SWATCHES: ColorSwatch[] = [
    { id: "white", hex: "#ffffff", label: "Blanc" },
    { id: "blue", hex: "#3557ff", label: "Bleu" },
    { id: "black", hex: "#1c1c1c", label: "Noir" },
    { id: "red", hex: "#ff3b3b", label: "Rouge" },
    { id: "lime", hex: "#bdfb2a", label: "Vert" },
];

const COLOR_FILTERS: Record<string, string> = {
    white: "brightness(1.05)",
    blue: "saturate(2.2) hue-rotate(180deg) brightness(0.9)",
    black: "brightness(0.35) contrast(1.1)",
    red: "saturate(2.1) hue-rotate(-15deg) brightness(0.95)",
    lime: "saturate(2.2) hue-rotate(60deg) brightness(1.1)",
};

const QUALITY_OPTIONS: QualityOption[] = [
    { id: "cotton", label: "Cotton", price: 0 },
    { id: "normal", label: "Normal", price: 5 },
    { id: "fireproof", label: "FireProof", price: 12 },
];

const BASE_PRICE = 20;
const DESIGN_FEE = 30;

export default function ProductUploadPage() {
    const router = useRouter();
    const [selectedProduct, setSelectedProduct] = useState<string>("tshirt");
    const [selectedColors, setSelectedColors] = useState<string[]>(["white", "blue", "black", "red", "lime"]);
    const [activeColor, setActiveColor] = useState<string>("black");
    const [selectedQuality, setSelectedQuality] = useState<string>("cotton");
    const [uploadedDesign, setUploadedDesign] = useState<string | null>(null);
    const [showAIPopup, setShowAIPopup] = useState(false);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [aiImages, setAiImages] = useState<string[]>([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [priceExpanded, setPriceExpanded] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedDesign(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/png": [".png"] },
        multiple: false,
    });

    const handleGenerateAI = () => {
        setIsLoadingAI(true);
        setShowAIPopup(true);
        setTimeout(() => {
            setAiImages([
                "https://picsum.photos/seed/ai1/400/400",
                "https://picsum.photos/seed/ai2/400/400",
                "https://picsum.photos/seed/ai3/400/400",
                "https://picsum.photos/seed/ai4/400/400",
            ]);
            setIsLoadingAI(false);
        }, 1800);
    };

    const selectAIImage = (imageUrl: string) => {
        setUploadedDesign(imageUrl);
        sessionStorage.setItem("uploadedDesign", imageUrl);
        setShowAIPopup(false);
        setAiImages([]);
    };

    const qualityPrice = QUALITY_OPTIONS.find((option) => option.id === selectedQuality)?.price ?? 0;
    const totalPrice = BASE_PRICE + DESIGN_FEE + qualityPrice;

    const toggleColor = (id: string) => {
        setSelectedColors((prev) => {
            const exists = prev.includes(id);
            if (exists) {
                if (prev.length === 1) {
                    return prev;
                }
                const next = prev.filter((color) => color !== id);
                if (activeColor === id) {
                    setActiveColor(next[0]);
                }
                return next;
            }
            const next = [...prev, id];
            setActiveColor(id);
            return next;
        });
    };

    const handleNext = () => {
        if (uploadedDesign) {
            sessionStorage.setItem("uploadedDesign", uploadedDesign);
        }
        router.push("/product-upload/details");
    };

    return (
        <div className="product-upload-page">
            <header className="pu-header">
                <div className="pu-header-inner">
                    <Image src="/logo.png" alt="Monkey Print" width={130} height={42} />
                    <button
                        className="pu-menu-trigger"
                        type="button"
                        aria-label="Ouvrir le menu"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                </div>
                <button
                    className="pu-cart-bar"
                    type="button"
                    aria-expanded={priceExpanded}
                    onClick={() => setPriceExpanded((prev) => !prev)}
                >
                    <div className="pu-cart-content">
                        <span className="pu-cart-icon">🛒</span>
                    </div>
                    <div className="pu-cart-total">
                        {totalPrice}DT
                        <svg
                            width="16"
                            height="10"
                            viewBox="0 0 16 10"
                            fill="none"
                            className={priceExpanded ? "expanded" : ""}
                        >
                            <path d="M1 1L8 8L15 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </button>
                {priceExpanded && (
                    <div className="pu-cart-details">
                        <div className="pu-cart-line">
                            <span>Articles (T-shirt)</span>
                            <span>{BASE_PRICE}DT</span>
                        </div>
                        <div className="pu-cart-line">
                            <span>Design</span>
                            <span>{DESIGN_FEE}DT</span>
                        </div>
                        <div className="pu-cart-line">
                            <span>Qualité</span>
                            <span>{qualityPrice}DT</span>
                        </div>
                        <div className="pu-cart-total-line">
                            <span>Total</span>
                            <span>{totalPrice}DT</span>
                        </div>
                    </div>
                )}
            </header>

            {mobileMenuOpen && (
                <div className="mp-mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
                    <div className="pu-mobile-sheet" onClick={(event) => event.stopPropagation()}>
                        <button className="pu-mobile-close" type="button" onClick={() => setMobileMenuOpen(false)}>
                            ×
                        </button>
                        <nav className="pu-mobile-menu">
                            <a href="/">Accueil</a>
                            <a href="#">Shop List</a>
                            <a href="#">Contactez-nous</a>
                        </nav>
                    </div>
                </div>
            )}

            <main className="pu-mobile-main">
                <div className="pu-mobile-flow">
                    <div className="pu-intro">
                        <p className="pu-intro-title">Commençons par votre premier téléchargement.</p>
                        <span className="pu-intro-line" />
                    </div>

                    <section className="pu-card">
                        <h2 className="pu-card-title">Choisissez le type de produit</h2>
                        <div className="pu-product-grid">
                            {PRODUCT_TYPES.map((product) => (
                                <button
                                    key={product.id}
                                    type="button"
                                    className={`pu-product-cell ${selectedProduct === product.id ? "active" : ""}`}
                                    onClick={() => setSelectedProduct(product.id)}
                                >
                                    {product.badge && <span className="pu-product-badge">{product.badge}</span>}
                                    <div className="pu-product-image">
                                        <Image src={product.image} alt={product.name} width={120} height={120} />
                                    </div>
                                    <span className="pu-product-label">{product.name}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="pu-card">
                        <h3 className="pu-card-subtitle">Couleurs disponibles :</h3>
                        <div className="pu-color-wrapper">
                            <div className="pu-color-hero">
                                {COLOR_SWATCHES.map((swatch, index) => {
                                    const isSelected = selectedColors.includes(swatch.id);
                                    const isActive = swatch.id === activeColor;
                                    return (
                                        <div 
                                            key={swatch.id} 
                                            className={`pu-shirt ${isActive ? "active" : ""}`}
                                            style={{
                                                transform: isActive ? "scale(1.1)" : "scale(0.9)",
                                                zIndex: isActive ? 10 : 1,
                                                opacity: isSelected ? 1 : 0.4
                                            }}
                                        >
                                            <Image
                                                src="/T-Shirt.png"
                                                alt={`T-shirt ${swatch.id}`}
                                                width={90}
                                                height={110}
                                                style={{ filter: COLOR_FILTERS[swatch.id] ?? "none" }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="pu-color-swatches">
                                {COLOR_SWATCHES.map((swatch) => (
                                    <button
                                        key={swatch.id}
                                        type="button"
                                        className={`pu-color-dot ${selectedColors.includes(swatch.id) ? "active" : ""} ${activeColor === swatch.id ? "selected" : ""}`}
                                        style={{ background: swatch.hex }}
                                        onClick={() => {
                                            toggleColor(swatch.id);
                                            setActiveColor(swatch.id);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="pu-card">
                        <div className={`pu-upload-card ${isDragActive ? "active" : ""}`} {...getRootProps()}>
                            <input {...getInputProps()} />
                            <svg width="45" height="45" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <p>Téléchargez votre design</p>
                            <span>Doit être uniquement au format PNG</span>
                        </div>
                        <button className="pu-ai-button" type="button" onClick={handleGenerateAI}>
                            OU GÉNÉRER AVEC IA
                        </button>
                    </section>

                    <section className="pu-card">
                        <div className="pu-card-header">
                            <h3 className="pu-card-subtitle">Modifiez votre design</h3>
                            <span className="pu-price-tag">Price Range 30DT</span>
                        </div>
                        <div className="pu-design-card">
                            <div className="pu-design-figure">
                                <Image
                                    src="/mock-shirt.png"
                                    alt="Mockup"
                                    width={320}
                                    height={320}
                                    style={{ filter: COLOR_FILTERS[activeColor] ?? "none" }}
                                />
                                <div className="pu-design-frame">
                                    {uploadedDesign ? (
                                        <Image src={uploadedDesign} alt="Design" width={120} height={120} />
                                    ) : (
                                        <div className="pu-design-grid">
                                            <div className="pu-grid-dot"></div>
                                            <div className="pu-grid-dot"></div>
                                            <div className="pu-grid-dot"></div>
                                            <div className="pu-grid-dot"></div>
                                            <div className="pu-grid-dot active"></div>
                                            <div className="pu-grid-dot"></div>
                                            <div className="pu-grid-dot"></div>
                                            <div className="pu-grid-dot"></div>
                                            <div className="pu-grid-dot"></div>
                                        </div>
                                    )}
                                </div>
                                <button className="pu-design-refresh" type="button">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="1 4 1 10 7 10" />
                                        <polyline points="23 20 23 14 17 14" />
                                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
                                    </svg>
                                </button>
                                <button className="pu-design-resize" type="button">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
                                        <path d="m12 12 4 4 4-4" />
                                        <path d="M12 12V8" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <span className="pu-preview-label">Couleurs d’aperçu</span>
                        <div className="pu-mini-swatches">
                            {selectedColors.map((colorId) => {
                                const swatch = COLOR_SWATCHES.find((c) => c.id === colorId);
                                return (
                                    <button
                                        key={colorId}
                                        type="button"
                                        className={`pu-mini-dot ${activeColor === colorId ? "active" : ""}`}
                                        style={{ background: swatch?.hex }}
                                        onClick={() => setActiveColor(colorId)}
                                    />
                                );
                            })}
                        </div>
                    </section>

                    <section className="pu-card" style={{ gap: '14px' }}>
                        <h3 className="pu-card-subtitle">Select quality of the product</h3>
                        <div className="pu-quality-row">
                            {QUALITY_OPTIONS.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    className={`pu-quality-pill ${selectedQuality === option.id ? "active" : ""}`}
                                    onClick={() => setSelectedQuality(option.id)}
                                >
                                    <span className="pu-quality-label">{option.label}</span>
                                    <span className="pu-quality-price">
                                        {option.price === 0 ? "Inclus" : `+${option.price}DT`}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <div className="pu-summary">
                            <div className="pu-summary-row">
                                <span>Articles (T-shirt)</span>
                                <span>{BASE_PRICE}DT</span>
                            </div>
                            <div className="pu-summary-row">
                                <span>Design</span>
                                <span>{DESIGN_FEE}DT</span>
                            </div>
                            <div className="pu-summary-row">
                                <span>Quality</span>
                                <span>{qualityPrice}DT</span>
                            </div>
                            <div className="pu-summary-total">
                                <span>Article Prix Base</span>
                                <span>{totalPrice}DT</span>
                            </div>
                        </div>
                    </section>

                    <button className="pu-next-cta" type="button" onClick={handleNext}>
                        SUIVANT
                    </button>
                </div>
            </main>

            {showAIPopup && (
                <div className="pu-popup-overlay" onClick={() => !isLoadingAI && setShowAIPopup(false)}>
                    <div className="pu-popup" onClick={(event) => event.stopPropagation()}>
                        <button className="pu-popup-close" type="button" onClick={() => setShowAIPopup(false)} disabled={isLoadingAI}>
                            ×
                        </button>
                        <h2 className="pu-popup-title">Choisissez votre design généré par IA</h2>
                        {isLoadingAI ? (
                            <div className="pu-loading">
                                <div className="pu-spinner" />
                                <p>Génération en cours...</p>
                            </div>
                        ) : (
                            <div className="pu-ai-grid">
                                {aiImages.map((img, index) => (
                                    <button
                                        key={img}
                                        type="button"
                                        className="pu-ai-image-card"
                                        onClick={() => selectAIImage(img)}
                                    >
                                        <Image src={img} alt={`Design ${index + 1}`} width={200} height={200} />
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

