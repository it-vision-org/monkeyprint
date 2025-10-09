'use client';

import Image from "next/image";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from 'react-dropzone';

export default function ProductUploadPage() {
    const router = useRouter();
    const [selectedProduct, setSelectedProduct] = useState<string | null>('tshirt');
    const [selectedColors, setSelectedColors] = useState<string[]>(['white']);
    const [selectedSizes, setSelectedSizes] = useState<string[]>(['XS']);
    const [uploadedDesign, setUploadedDesign] = useState<string | null>(null);
    const [showAIPopup, setShowAIPopup] = useState(false);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [aiImages, setAiImages] = useState<string[]>([]);
    const [aiPrompt, setAiPrompt] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const productTypes = [
        { id: 'hoodie', name: 'Hoodie', image: '/hoodie.png' },
        { id: 'tshirt', name: 'T-Shirt', image: '/T-shirt.png' },
        { id: 'product3', name: 'Product 3', image: '/product3.png' },
        { id: 'product4', name: 'Product 4', image: '/product4.png' },
        { id: 'product5', name: 'Product 5', image: '/product5.png' },
        { id: 'product6', name: 'Product 6', image: '/product6.png' }
    ];

    const availableColors = [
        { id: 'white', color: '#FFFFFF', border: '#E0E0E0' },
        { id: 'red', color: '#FF0000' },
        { id: 'black', color: '#000000' },
        { id: 'green', color: '#00FF00' },
        { id: 'blue', color: '#0000FF' }
    ];

    const availableSizes = ['S', 'M', 'L', 'XS', 'XL', '2XL', '3XL'];

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedDesign(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop, 
        accept: { 'image/png': ['.png'] },
        multiple: false
    });

    const toggleColor = (colorId: string) => {
        setSelectedColors(prev => 
            prev.includes(colorId) 
                ? prev.filter(c => c !== colorId)
                : [...prev, colorId]
        );
    };

    const toggleSize = (size: string) => {
        setSelectedSizes(prev => 
            prev.includes(size) 
                ? prev.filter(s => s !== size)
                : [...prev, size]
        );
    };

    const handleGenerateAI = () => {
        setIsLoadingAI(true);
        setShowAIPopup(true);
        
        // Simulate AI generation
        setTimeout(() => {
            setAiImages([
                'https://picsum.photos/seed/ai1/400/400',
                'https://picsum.photos/seed/ai2/400/400',
                'https://picsum.photos/seed/ai3/400/400',
                'https://picsum.photos/seed/ai4/400/400'
            ]);
            setIsLoadingAI(false);
        }, 2000);
    };

    const selectAIImage = (imageUrl: string) => {
        setUploadedDesign(imageUrl);
        setShowAIPopup(false);
        setAiImages([]);
    };

    const handleNext = () => {
        if (uploadedDesign) {
            sessionStorage.setItem('uploadedDesign', uploadedDesign);
        }
        router.push('/product-upload/details');
    };

    return (
        <div className="product-upload-page">
            {/* Header */}
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
                    
                    {/* User Icon - Logged In */}
                    <div className="mp-desktop-nav">
                        <button style={{ 
                            width: 48, 
                            height: 48, 
                            borderRadius: '50%', 
                            background: '#0d9488', 
                            border: 'none', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: 20,
                            fontWeight: 700
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </button>
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

            {/* Main Content */}
            <main className="pu-main">
                <div className="pu-container">
                    <div className="pu-content">
                        {/* Title */}
                        <h1 className="pu-title">Commençons par votre premier téléchargement.</h1>
                        <div className="pu-section">
                            {/* Product Type Selection */}
                            <h2 className="pu-section-title">Choisissez le type de produit</h2>
                            <div className="pu-products-grid">
                                {productTypes.map((product) => (
                                    <button
                                        key={product.id}
                                        className={`pu-product-card ${selectedProduct === product.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedProduct(product.id)}
                                    >
                                        <div className="pu-product-image-placeholder">
                                            <Image 
                                                src={product.image} 
                                                alt={product.name} 
                                                width={112} 
                                                height={112}
                                                style={{ objectFit: 'contain' }}
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="pu-section">
                            {/* Colors Selection */}
                            <h3 className="pu-section-subtitle">Couleurs disponibles</h3>
                            <div className="pu-colors-container">
                                <div className="pu-colors-grid">
                                    {availableColors.map((color) => (
                                        <button
                                            key={color.id}
                                            className={`pu-color-swatch ${selectedColors.includes(color.id) ? 'selected' : ''}`}
                                            data-color-id={color.id}
                                            style={{ 
                                                background: color.color,
                                                border: color.id === 'white' ? '2px solid #000' : `2px solid ${color.color}`
                                            }}
                                            onClick={() => toggleColor(color.id)}
                                        />
                                    ))}
                                </div>
                                <div className="pu-product-preview">
                                    <Image 
                                        src="/T-shirt.png" 
                                        alt="Product Preview" 
                                        width={140} 
                                        height={140}
                                        style={{ objectFit: 'contain' }}
                                        onError={(e) => {
                                            e.currentTarget.style.opacity = '0.3';
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="pu-section">
                            {/* Upload Design */}
                            <div {...getRootProps()} className={`pu-upload-zone ${isDragActive ? 'active' : ''}`}>
                                <input {...getInputProps()} />
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="pu-upload-icon">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                <p className="pu-upload-text">Téléchargez votre design</p>
                                <p className="pu-upload-subtext">Doit être uniquement au format PNG</p>
                            </div>
                            {/* AI Generator Button */}
                            <div className="pu-ai-section">
                                <div className="pu-ai-divider">OU GÉNÉRER AVEC IA</div>
                                <div className="pu-ai-input-group">
                                    <input 
                                        type="text" 
                                        className="pu-ai-input"
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        placeholder=""
                                    />
                                    <button className="pu-generate-btn" onClick={handleGenerateAI}>
                                        GÉNÉRER
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="pu-section">
                            {/* Design Preview */}
                            <h3 className="pu-section-subtitle">Modifiez votre design</h3>
                            <div className="pu-design-preview">
                                <div className="pu-design-preview-shirt">
                                    <Image 
                                        src="/T-Shirt-Design.png" 
                                        alt="Shirt Preview" 
                                        width={300} 
                                        height={350}
                                        style={{ objectFit: 'contain' }}
                                    />
                                    {uploadedDesign && (
                                        <div className="pu-design-overlay">
                                            <Image 
                                                src={uploadedDesign} 
                                                alt="Design" 
                                                width={100} 
                                                height={100}
                                                style={{ objectFit: 'contain' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Next Button */}
                        <button className="pu-next-button" onClick={handleNext}>
                            Suivant
                        </button>
                    </div>
                </div>
            </main>

            {/* AI Popup */}
            {showAIPopup && (
                <div className="pu-popup-overlay" onClick={() => !isLoadingAI && setShowAIPopup(false)}>
                    <div className="pu-popup" onClick={(e) => e.stopPropagation()}>
                        <button 
                            className="pu-popup-close" 
                            onClick={() => setShowAIPopup(false)}
                            disabled={isLoadingAI}
                        >
                            ×
                        </button>
                        <h2 className="pu-popup-title">Choisissez votre design généré par IA</h2>
                        
                        {isLoadingAI ? (
                            <div className="pu-loading">
                                <div className="pu-spinner"></div>
                                <p>Génération en cours...</p>
                            </div>
                        ) : (
                            <div className="pu-ai-grid">
                                {aiImages.map((img, idx) => (
                                    <button 
                                        key={idx} 
                                        className="pu-ai-image-card"
                                        onClick={() => selectAIImage(img)}
                                    >
                                        <Image 
                                            src={img} 
                                            alt={`AI Generated ${idx + 1}`} 
                                            width={200} 
                                            height={200}
                                            style={{ objectFit: 'cover', borderRadius: 12 }}
                                        />
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

