'use client';

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProductUploadHeader from "../components/ProductUploadHeader";
import { combineDesigns } from "@/lib/utils/designRenderer";

type GenderOption = {
    id: string;
    label: string;
};

const GENDER_OPTIONS: GenderOption[] = [
    { id: "homme", label: "Homme" },
    { id: "femme", label: "Femme" },
    { id: "enfant", label: "Enfant" },
    { id: "groupe", label: "Groupe" },
    { id: "famille", label: "Famille" },
    { id: "couple", label: "Couple" },
    { id: "unisexe", label: "Unisexe" },
    { id: "sport", label: "Sport" },
    { id: "corporate", label: "Corporate" },
];

const MIN_PRICE = 55;

export default function ProductDetailsPage() {
    const router = useRouter();
    const [frontDesignImage, setFrontDesignImage] = useState<string | null>(null);
    const [backDesignImage, setBackDesignImage] = useState<string | null>(null);
    const [selectedMockup, setSelectedMockup] = useState<string | null>(null);
    const [designEditorData, setDesignEditorData] = useState<string | null>(null);
    const [selectedGenders, setSelectedGenders] = useState<string[]>(["homme"]);
    const [productName, setProductName] = useState<string>("");
    const [productPrice, setProductPrice] = useState<string>("55");
    const [displayPrice, setDisplayPrice] = useState<string>("55");
    const [description, setDescription] = useState<string>("");
    const [charCount, setCharCount] = useState<number>(0);
    const [mockupModalOpen, setMockupModalOpen] = useState(false);
    const [genderSelectionModalOpen, setGenderSelectionModalOpen] = useState(false);
    const [selectedGenderForMockup, setSelectedGenderForMockup] = useState<string>("homme");
    const [mockupLoading, setMockupLoading] = useState(false);
    const [generatedMockups, setGeneratedMockups] = useState<string[]>([]);
    const [isRenderingDesign, setIsRenderingDesign] = useState(true);

    // Load design data on mount
    useEffect(() => {
        const savedDesign = sessionStorage.getItem("uploadedDesign");
        const savedEditorData = sessionStorage.getItem("designEditorData");
        
        if (savedEditorData) {
            setDesignEditorData(savedEditorData);
            // Render the designs to display them
            renderUserDesigns(savedEditorData);
        } else if (savedDesign) {
            // Fallback to saved design if no editor data
            setSelectedMockup(savedDesign);
            setIsRenderingDesign(false);
        } else {
            setIsRenderingDesign(false);
        }
    }, []);

    const renderUserDesigns = async (editorData: string) => {
        try {
            setIsRenderingDesign(true);
            const designData = JSON.parse(editorData);
            const frontDesign = designData.front || null;
            const backDesign = designData.back || null;
            
            // Render front and back separately
            if (frontDesign) {
                const frontImg = await renderDesignToImage(frontDesign);
                setFrontDesignImage(frontImg);
            }
            
            if (backDesign) {
                const backImg = await renderDesignToImage(backDesign);
                setBackDesignImage(backImg);
            }
        } catch (error) {
            console.error('Error rendering designs:', error);
        } finally {
            setIsRenderingDesign(false);
        }
    };

    const renderDesignToImage = async (
        designJson: string,
        width: number = 400,
        height: number = 500
    ): Promise<string> => {
        const fabric = (await import('fabric')).fabric;
        
        return new Promise((resolve, reject) => {
            try {
                const canvas = new fabric.StaticCanvas(null, {
                    width,
                    height,
                    backgroundColor: 'transparent',
                });

                const design = JSON.parse(designJson);
                const { objects = [], w = width, h = height } = design;

                if (!objects || objects.length === 0) {
                    const dataUrl = canvas.toDataURL({
                        format: 'png',
                        quality: 1,
                        multiplier: 1,
                    });
                    canvas.dispose();
                    resolve(dataUrl);
                    return;
                }

                const scaleX = width / w;
                const scaleY = height / h;

                fabric.util.enlivenObjects(objects).then((objs: any[]) => {
                    objs.forEach((obj) => {
                        obj.set({
                            left: (obj.left || 0) * scaleX,
                            top: (obj.top || 0) * scaleY,
                            scaleX: (obj.scaleX || 1) * scaleX,
                            scaleY: (obj.scaleY || 1) * scaleY,
                        });
                        canvas.add(obj);
                    });

                    canvas.renderAll();

                    const dataUrl = canvas.toDataURL({
                        format: 'png',
                        quality: 1,
                        multiplier: 1,
                    });

                    canvas.dispose();
                    resolve(dataUrl);
                }).catch((error) => {
                    canvas.dispose();
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    };

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

    const openGenderSelectionModal = () => {
        setGenderSelectionModalOpen(true);
    };

    const closeGenderSelectionModal = () => {
        setGenderSelectionModalOpen(false);
    };

    const handleGenerateMockup = async () => {
        if (!designEditorData) {
            alert('Aucun design trouvé. Veuillez retourner à l\'éditeur de design.');
            return;
        }

        closeGenderSelectionModal();
        setMockupModalOpen(true);
        setMockupLoading(true);
        setGeneratedMockups([]);

        try {
            // Combine front and back designs
            const designData = JSON.parse(designEditorData);
            const frontDesign = designData.front || null;
            const backDesign = designData.back || null;
            
            // Check if we have at least one design
            if (!frontDesign && !backDesign) {
                throw new Error('Aucun design trouvé (ni recto ni verso)');
            }
            
            const combinedImage = await combineDesigns(frontDesign, backDesign);

            // Call API to generate mockups
            const response = await fetch('/api/generate-mockup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    designImageBase64: combinedImage,
                    gender: selectedGenderForMockup,
                }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(error.error || `Failed to generate mockups: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.success && data.images && data.images.length > 0) {
                setGeneratedMockups(data.images);
            } else {
                throw new Error('No images returned from API');
            }
        } catch (error: any) {
            console.error('Error generating mockups:', error);
            alert(`Erreur lors de la génération des maquettes: ${error.message}`);
            setMockupLoading(false);
        }
    };

    const closeMockupModal = () => {
        setMockupModalOpen(false);
        setMockupLoading(false);
        setGeneratedMockups([]);
    };

    const handleSelectMockup = (url: string) => {
        setSelectedMockup(url);
        sessionStorage.setItem("uploadedDesign", url);
        closeMockupModal();
    };

    const handleSubmit = () => {
        router.push("/dashboard/apercu");
    };

    const handleBack = () => {
        router.back();
    };

    const displayTotalPrice = parseFloat(productPrice) || MIN_PRICE;

    return (
        <div className="product-upload-page">
            <ProductUploadHeader 
                totalPrice={displayTotalPrice}
                showPriceDetails={true}
            />

            <main className="pu-mobile-main">
                <div className="pu-mobile-flow">
                    <button 
                        type="button" 
                        className="pd-back-button-top"
                        onClick={handleBack}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                        Retour
                    </button>
                    <div className="pd-intro">
                        <p className="pd-intro-title">Dernière étape, remplissez la description de votre produit</p>
                        <span className="pd-intro-line" />
                    </div>

                    <section className="pd-card">
                        <h3 className="pu-card-subtitle" style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 700, color: '#000' }}>
                            Aperçu de votre design
                        </h3>
                        
                        <div className="pd-preview-card" style={{ 
                            background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
                            borderRadius: '20px',
                            padding: '24px',
                            marginBottom: '20px',
                            border: '2px solid rgba(65, 235, 92, 0.2)',
                        }}>
                            {isRenderingDesign ? (
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    minHeight: '300px',
                                    flexDirection: 'column',
                                    gap: '12px'
                                }}>
                                    <div className="pu-spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
                                    <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Chargement du design...</p>
                                </div>
                            ) : (
                                <div className="pd-design-preview-grid" style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '20px',
                                    alignItems: 'center',
                                }}>
                                    {/* Front Design */}
                                    <div style={{
                                        background: '#fff',
                                        borderRadius: '16px',
                                        padding: '16px',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '12px',
                                    }}>
                                        <span style={{ 
                                            fontSize: '13px', 
                                            fontWeight: 700, 
                                            color: '#0d1c23',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Recto
                                        </span>
                                        <div style={{
                                            width: '100%',
                                            aspectRatio: '4/5',
                                            background: '#f9fafb',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                            border: '2px solid #e5e7eb',
                                        }}>
                                            {frontDesignImage ? (
                                                <img 
                                                    src={frontDesignImage} 
                                                    alt="Front Design" 
                                                    style={{ 
                                                        width: '100%', 
                                                        height: '100%', 
                                                        objectFit: 'contain',
                                                    }} 
                                                />
                                            ) : (
                                                <div style={{ 
                                                    color: '#9ca3af', 
                                                    fontSize: '12px',
                                                    textAlign: 'center',
                                                    padding: '20px'
                                                }}>
                                                    Aucun design recto
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Back Design */}
                                    <div style={{
                                        background: '#fff',
                                        borderRadius: '16px',
                                        padding: '16px',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '12px',
                                    }}>
                                        <span style={{ 
                                            fontSize: '13px', 
                                            fontWeight: 700, 
                                            color: '#0d1c23',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Verso
                                        </span>
                                        <div style={{
                                            width: '100%',
                                            aspectRatio: '4/5',
                                            background: '#f9fafb',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                            border: '2px solid #e5e7eb',
                                        }}>
                                            {backDesignImage ? (
                                                <img 
                                                    src={backDesignImage} 
                                                    alt="Back Design" 
                                                    style={{ 
                                                        width: '100%', 
                                                        height: '100%', 
                                                        objectFit: 'contain',
                                                    }} 
                                                />
                                            ) : (
                                                <div style={{ 
                                                    color: '#9ca3af', 
                                                    fontSize: '12px',
                                                    textAlign: 'center',
                                                    padding: '20px'
                                                }}>
                                                    Aucun design verso
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pd-action-row">
                            <button type="button" className="pd-action-primary" onClick={openGenderSelectionModal}>
                                GÉNÉRER UNE MAQUETTE
                            </button>
                            <button 
                                type="button" 
                                className="pd-action-refresh" 
                                onClick={() => designEditorData && renderUserDesigns(designEditorData)}
                                title="Actualiser l'aperçu"
                            >
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
                            <div className="pd-label">
                                Sélectionner le sexe du produit :<span>*</span>
                            </div>
                            <div className="pd-required-note">Doit être rempli*</div>
                            <div className="pd-gender-row">
                                {GENDER_OPTIONS.slice(0, 3).map((option) => (
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

            {/* Gender Selection Modal */}
            {genderSelectionModalOpen && (
                <div className="pu-popup-overlay" onClick={closeGenderSelectionModal}>
                    <div className="pu-popup" onClick={(event) => event.stopPropagation()}>
                        <button className="pu-popup-close" type="button" onClick={closeGenderSelectionModal}>
                            ×
                        </button>
                        <h2 className="pu-popup-title">Sélectionnez le type de maquette</h2>
                        <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
                            Choisissez le type de modèle pour votre maquette
                        </p>
                        <div className="pu-ai-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            {GENDER_OPTIONS.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    className={`pd-radio-option ${selectedGenderForMockup === option.id ? "active" : ""}`}
                                    onClick={() => setSelectedGenderForMockup(option.id)}
                                    style={{
                                        padding: '16px',
                                        borderRadius: '8px',
                                        border: selectedGenderForMockup === option.id ? '2px solid #3557ff' : '1px solid #ddd',
                                        backgroundColor: selectedGenderForMockup === option.id ? '#f0f4ff' : '#fff',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <span className="pd-radio-label">{option.label}</span>
                                </button>
                            ))}
                        </div>
                        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                type="button"
                                onClick={closeGenderSelectionModal}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    backgroundColor: '#fff',
                                    cursor: 'pointer',
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleGenerateMockup}
                                className="pd-action-primary"
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                Générer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mockup Selection Modal */}
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
                                <p>Génération des maquettes en cours...</p>
                                <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                                    Cela peut prendre quelques instants
                                </p>
                            </div>
                        ) : generatedMockups.length > 0 ? (
                            <div className="pu-ai-grid">
                                {generatedMockups.map((url, index) => (
                                    <button key={index} type="button" className="pu-ai-image-card" onClick={() => handleSelectMockup(url)}>
                                        <Image src={url} alt={`Maquette ${index + 1}`} width={200} height={200} style={{ objectFit: 'cover' }} />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <p style={{ color: '#666' }}>Aucune maquette générée</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

