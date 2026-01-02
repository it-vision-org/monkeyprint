'use client';

import Image from "next/image";
import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import DesignEditor from "../../product-upload/components/DesignEditorNew";

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

const DESIGN_FEE = 30;

// Product base prices
const PRODUCT_PRICES: Record<string, number> = {
    hoodie: 30,
    hoodie2: 30,
    hoodie3: 30,
    tshirt: 20,
    tshirt2: 20,
    tshirt3: 20,
};

// Get product name for display
const getProductName = (productId: string): string => {
    if (productId.startsWith('hoodie')) return 'Hoodie';
    if (productId.startsWith('tshirt')) return 'T-Shirt';
    return 'T-Shirt'; // default
};

export default function ProductUploadPage() {
    const router = useRouter();
    const [selectedProduct, setSelectedProduct] = useState<string>("tshirt");
    const [selectedColors, setSelectedColors] = useState<string[]>(["black"]);
    const [activeColor, setActiveColorState] = useState<string>("black");
    const [selectedQuality, setSelectedQuality] = useState<string>("cotton");
    const [uploadedDesign, setUploadedDesign] = useState<string | null>(null);
    const [showAIPopup, setShowAIPopup] = useState(false);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [aiImages, setAiImages] = useState<string[]>([]);
    const [designEditorData, setDesignEditorData] = useState<string | null>(null);
    const [mobilePriceExpanded, setMobilePriceExpanded] = useState(false);
    const [desktopPriceExpanded, setDesktopPriceExpanded] = useState(false);
    const [desktopPriceLocked, setDesktopPriceLocked] = useState(false);

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
    const basePrice = PRODUCT_PRICES[selectedProduct] ?? 20;
    const totalPrice = basePrice + DESIGN_FEE + qualityPrice;

    const toggleColor = (id: string) => {
        setSelectedColors((prev) => {
            const exists = prev.includes(id);
            if (exists) {
                // Don't allow removing the last color
                if (prev.length === 1) {
                    return prev;
                }
                // Remove the color - if it was the active one, switch to the first remaining color
                const filtered = prev.filter((color) => color !== id);
                if (activeColor === id && filtered.length > 0) {
                    // If we removed the active color, set the first remaining color as active
                    setActiveColorState(filtered[0]);
                }
                return filtered;
            } else {
                // Add the color at the end (so it appears on the side, not center)
                return [...prev, id];
            }
        });
    };

    const setActiveColor = (colorId: string) => {
        // Only set active if the color is in the selected colors
        if (selectedColors.includes(colorId)) {
            setActiveColorState(colorId);
        }
    };

    // Get selected colors in order (active color first for centering, rest in original order)
    const getOrderedColors = () => {
        // Safety check: if activeColor is not in selectedColors, use first selected color
        const validActiveColor = selectedColors.includes(activeColor)
            ? activeColor
            : (selectedColors.length > 0 ? selectedColors[0] : "");

        const activeSwatch = COLOR_SWATCHES.find(swatch => swatch.id === validActiveColor);
        const otherColors = selectedColors.filter(id => id !== validActiveColor);
        const otherSwatches = otherColors
            .map(id => COLOR_SWATCHES.find(swatch => swatch.id === id))
            .filter((swatch): swatch is ColorSwatch => swatch !== undefined);

        // Return active color first (for center), then others in their original order
        return activeSwatch
            ? [activeSwatch, ...otherSwatches]
            : otherSwatches;
    };

    const handleNext = () => {
        // Save uploaded design if exists
        if (uploadedDesign) {
            sessionStorage.setItem("uploadedDesign", uploadedDesign);
        }
        
        // Save product type and color for rendering background
        sessionStorage.setItem("productType", selectedProduct);
        const activeColorHex = COLOR_SWATCHES.find(s => s.id === activeColor)?.hex || '#ffffff';
        sessionStorage.setItem("productColor", activeColorHex);
        
        // Force save design editor data before navigation
        // Get the latest from sessionStorage first (in case auto-save already happened)
        const latestDesignData = sessionStorage.getItem("designEditorData") || designEditorData;
        
        if (latestDesignData) {
            console.log('Saving design data before navigation:', latestDesignData.substring(0, 200));
            sessionStorage.setItem("designEditorData", latestDesignData);
        } else {
            // If no design data exists, save empty structure to ensure consistency
            const emptyDesign = JSON.stringify({ front: null, back: null });
            console.log('No design data, saving empty structure');
            sessionStorage.setItem("designEditorData", emptyDesign);
        }
        
        // Verify it was saved
        const verify = sessionStorage.getItem("designEditorData");
        console.log('Verified saved design data:', verify?.substring(0, 200));
        
        // Navigate immediately - sessionStorage is synchronous
        router.push("/dashboard/product-upload/details");
    };

    const handleDesignChange = (designData: string) => {
        setDesignEditorData(designData);
        // Auto-save is now handled in the DesignEditor component
        // This just updates the local state for immediate UI updates
    };

    // Removed handleDesignSave - auto-save is now automatic in DesignEditor

    // Load saved design on mount
    useEffect(() => {
        const savedDesign = sessionStorage.getItem("designEditorData");
        if (savedDesign) {
            setDesignEditorData(savedDesign);
        }
    }, []);

    // Mobile sticky price bar
    const MobilePriceBar = () => (
        <div className="pu-cart-container pu-cart-container-mobile">
            <button
                className="pu-cart-bar"
                type="button"
                aria-expanded={mobilePriceExpanded}
                onClick={() => setMobilePriceExpanded((prev) => !prev)}
            >
                <div className="pu-cart-content">
                    <svg
                        className="pu-cart-icon"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.895 17 15 17.895 15 19C15 20.105 15.895 21 17 21C18.105 21 19 20.105 19 19C19 17.895 18.105 17 17 17ZM9 19C9 20.105 8.105 21 7 21C5.895 21 5 20.105 5 19C5 17.895 5.895 17 7 17C8.105 17 9 17.895 9 19Z" />
                    </svg>
                </div>
                <div className="pu-cart-total">
                    <span className="pu-cart-price">{totalPrice}DT</span>
                    <svg
                        width="16"
                        height="10"
                        viewBox="0 0 16 10"
                        fill="none"
                        className={mobilePriceExpanded ? "expanded" : ""}
                    >
                        <path d="M1 1L8 8L15 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </button>
            {mobilePriceExpanded && (
                <div className="pu-cart-details pu-cart-details-mobile">
                    <div className="pu-cart-details-header">
                        <h3 className="pu-cart-details-title">Détails du prix</h3>
                    </div>
                    <div className="pu-cart-items">
                        <div className="pu-cart-item">
                            <div className="pu-cart-item-info">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                                    <path d="M3 6h18" />
                                    <path d="M16 10a4 4 0 0 1-8 0" />
                                </svg>
                                <span>Articles ({getProductName(selectedProduct)})</span>
                            </div>
                            <span className="pu-cart-item-price">{basePrice}DT</span>
                        </div>
                        <div className="pu-cart-item">
                            <div className="pu-cart-item-info">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                    <line x1="12" y1="22.08" x2="12" y2="12" />
                                </svg>
                                <span>Design</span>
                            </div>
                            <span className="pu-cart-item-price">{DESIGN_FEE}DT</span>
                        </div>
                        <div className="pu-cart-item">
                            <div className="pu-cart-item-info">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5" />
                                    <path d="M2 12l10 5 10-5" />
                                </svg>
                                <span>Quality ({QUALITY_OPTIONS.find(o => o.id === selectedQuality)?.label || 'Cotton'})</span>
                            </div>
                            <span className="pu-cart-item-price">{qualityPrice}DT</span>
                        </div>
                    </div>
                    <div className="pu-cart-total-line">
                        <span className="pu-cart-total-label">Total</span>
                        <span className="pu-cart-total-price">{totalPrice}DT</span>
                    </div>
                </div>
            )}
        </div>
    );

    // Desktop floating price widget
    const DesktopPriceWidget = () => {
        const handleToggle = () => {
            if (desktopPriceLocked) {
                setDesktopPriceLocked(false);
                setDesktopPriceExpanded(false);
            } else {
                setDesktopPriceLocked(true);
                setDesktopPriceExpanded(true);
            }
        };
        
        const handleMouseEnter = () => {
            if (!desktopPriceLocked) {
                setDesktopPriceExpanded(true);
            }
        };
        
        const handleMouseLeave = () => {
            if (!desktopPriceLocked) {
                setDesktopPriceExpanded(false);
            }
        };
        
        return (
            <div 
                className={`pu-price-widget-desktop ${desktopPriceExpanded ? 'expanded' : ''} ${desktopPriceLocked ? 'locked' : ''}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <button
                    className="pu-price-widget-trigger"
                    type="button"
                    onClick={handleToggle}
                    aria-label="Voir le récapitulatif des prix"
                >
                    <div className="pu-price-widget-trigger-icon">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.895 17 15 17.895 15 19C15 20.105 15.895 21 17 21C18.105 21 19 20.105 19 19C19 17.895 18.105 17 17 17ZM9 19C9 20.105 8.105 21 7 21C5.895 21 5 20.105 5 19C5 17.895 5.895 17 7 17C8.105 17 9 17.895 9 19Z" />
                        </svg>
                    </div>
                    <div className="pu-price-widget-trigger-price">{totalPrice}DT</div>
                </button>

                <div className="pu-price-widget-panel">
                    <div className="pu-price-widget-header">
                        <div className="pu-price-widget-header-icon">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.895 17 15 17.895 15 19C15 20.105 15.895 21 17 21C18.105 21 19 20.105 19 19C19 17.895 18.105 17 17 17ZM9 19C9 20.105 8.105 21 7 21C5.895 21 5 20.105 5 19C5 17.895 5.895 17 7 17C8.105 17 9 17.895 9 19Z" />
                            </svg>
                        </div>
                        <div className="pu-price-widget-header-title">Récapitulatif</div>
                    </div>
                    <div className="pu-price-widget-content">
                        <div className="pu-price-widget-items">
                            <div className="pu-price-widget-item">
                                <div className="pu-price-widget-item-info">
                                    <div className="pu-price-widget-item-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                                            <path d="M3 6h18" />
                                            <path d="M16 10a4 4 0 0 1-8 0" />
                                        </svg>
                                    </div>
                                    <span className="pu-price-widget-item-label">Articles ({getProductName(selectedProduct)})</span>
                                </div>
                                <span className="pu-price-widget-item-price">{basePrice}DT</span>
                            </div>
                            <div className="pu-price-widget-item">
                                <div className="pu-price-widget-item-info">
                                    <div className="pu-price-widget-item-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                            <line x1="12" y1="22.08" x2="12" y2="12" />
                                        </svg>
                                    </div>
                                    <span className="pu-price-widget-item-label">Design</span>
                                </div>
                                <span className="pu-price-widget-item-price">{DESIGN_FEE}DT</span>
                            </div>
                            <div className="pu-price-widget-item">
                                <div className="pu-price-widget-item-info">
                                    <div className="pu-price-widget-item-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                            <path d="M2 17l10 5 10-5" />
                                            <path d="M2 12l10 5 10-5" />
                                        </svg>
                                    </div>
                                    <span className="pu-price-widget-item-label">Quality ({QUALITY_OPTIONS.find(o => o.id === selectedQuality)?.label || 'Cotton'})</span>
                                </div>
                                <span className="pu-price-widget-item-price">{qualityPrice}DT</span>
                            </div>
                        </div>
                        <div className="pu-price-widget-total">
                            <div className="pu-price-widget-total-label">Total</div>
                            <div className="pu-price-widget-total-price">{totalPrice}DT</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="product-upload-page">
            {/* Mobile sticky price bar */}
            <MobilePriceBar />
            
            {/* Desktop floating price widget */}
            <DesktopPriceWidget />

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
                                {(() => {
                                    const orderedColors = getOrderedColors();
                                    // The first color (index 0) should always be in the center
                                    const centerIndex = 0;
                                    return orderedColors.map((swatch, index) => {
                                        const isActive = index === centerIndex;
                                        const distanceFromCenter = index; // Distance from center (first item)
                                        const scale = Math.max(0.6, 1 - (distanceFromCenter * 0.15)); // Decrease by 15% for each step away, min 0.6
                                        const zIndex = isActive ? 100 : 50 - distanceFromCenter;

                                        // Calculate horizontal offset: center is 0, left is negative, right is positive
                                        // For items after center, alternate: 1->left, 2->right, 3->left, etc.
                                        let offset = 0;
                                        if (index > 0) {
                                            // Determine if this item should be on left or right
                                            const sideIndex = Math.floor((index - 1) / 2) + 1;
                                            const isLeft = (index - 1) % 2 === 0; // First new item goes left
                                            offset = isLeft ? -sideIndex * 70 : sideIndex * 70;
                                        }

                                        return (
                                            <div
                                                key={swatch.id}
                                                className={`pu-shirt ${isActive ? "active" : ""}`}
                                                style={{
                                                    left: '50%',
                                                    transform: `translate(calc(-50% + ${offset}px), -50%) scale(${scale})`,
                                                    zIndex: zIndex,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: '90px',
                                                        height: '110px',
                                                        backgroundColor: swatch.id === 'white' ? '#f5f5f5' : swatch.hex,
                                                        WebkitMask: 'url(/T-Shirt.png) no-repeat center / contain',
                                                        mask: 'url(/T-Shirt.png) no-repeat center / contain',
                                                        boxShadow: swatch.id === 'white' ? '0 0 0 1px rgba(0, 0, 0, 0.1)' : 'none',
                                                    }}
                                                />
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                            <div className="pu-color-swatches">
                                {COLOR_SWATCHES.map((swatch) => {
                                    const isSelected = selectedColors.includes(swatch.id);
                                    const isActive = swatch.id === activeColor;
                                    return (
                                        <button
                                            key={swatch.id}
                                            type="button"
                                            className={`pu-color-dot ${isSelected ? "active" : ""} ${isActive && isSelected ? "selected" : ""}`}
                                            style={{ background: swatch.hex }}
                                            onClick={() => toggleColor(swatch.id)}
                                            title={swatch.label}
                                        >
                                            {isSelected && (
                                                <svg
                                                    width="18"
                                                    height="18"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke={swatch.id === "white" ? "#000000" : "#ffffff"}
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    style={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: 'translate(-50%, -50%)',
                                                        pointerEvents: 'none',
                                                        filter: swatch.id === "white"
                                                            ? 'none'
                                                            : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))',
                                                    }}
                                                >
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </section>


                    <section className="pu-card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div className="pu-card-header" style={{ padding: '20px 18px 0' }}>
                            <h3 className="pu-card-subtitle">Modifiez votre design</h3>
                            <span className="pu-price-tag">Price Range 30DT</span>
                        </div>
                        <div style={{ height: '600px', minHeight: '500px' }}>
                            <DesignEditor
                                productType={selectedProduct}
                                productColor={activeColor ? COLOR_SWATCHES.find(s => s.id === activeColor)?.hex || '#ffffff' : '#ffffff'}
                                initialDesign={designEditorData}
                                onDesignChange={handleDesignChange}
                            />
                        </div>
                        <div style={{ padding: '16px 18px' }}>
                            <span className="pu-preview-label">Couleurs d'aperçu</span>
                            <div className="pu-mini-swatches">
                                {selectedColors.map((colorId) => {
                                    const swatch = COLOR_SWATCHES.find((c) => c.id === colorId);
                                    const isActive = colorId === activeColor;
                                    return (
                                        <button
                                            key={colorId}
                                            type="button"
                                            className={`pu-mini-dot ${isActive ? "active" : ""}`}
                                            style={{ background: swatch?.hex }}
                                            onClick={() => setActiveColor(colorId)}
                                            title={swatch?.label}
                                        />
                                    );
                                })}
                            </div>
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
                                <span>Articles ({getProductName(selectedProduct)})</span>
                                <span>{basePrice}DT</span>
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

