'use client';

import Image from "next/image";
// Note: Using document.createElement('img') instead of new Image() to avoid conflict with Next.js Image
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
    const [combinedDesignImage, setCombinedDesignImage] = useState<string | null>(null);

    // Load design data on mount
    useEffect(() => {
        const savedDesign = sessionStorage.getItem("uploadedDesign");
        const savedEditorData = sessionStorage.getItem("designEditorData");
        
        console.log('Details page loading - savedEditorData:', savedEditorData?.substring(0, 200));
        console.log('Details page loading - savedDesign:', savedDesign);
        
        if (savedEditorData) {
            setDesignEditorData(savedEditorData);
            // Render the designs to display them
            renderUserDesigns(savedEditorData);
        } else if (savedDesign) {
            // Fallback to saved design if no editor data
            setSelectedMockup(savedDesign);
            setIsRenderingDesign(false);
        } else {
            console.log('No design data found in sessionStorage');
            setIsRenderingDesign(false);
        }
    }, []);

    const generateCombinedImage = async () => {
        if (!designEditorData) return null;
        
        try {
            const designData = JSON.parse(designEditorData);
            const frontDesign = designData.front || null;
            const backDesign = designData.back || null;
            
            if (!frontDesign && !backDesign) return null;
            
            let combined: string;
            
            if (frontDesign && backDesign) {
                // Render both with backgrounds
                const frontImg = await renderDesignToImage(frontDesign, 800, 1000, 'front');
                const backImg = await renderDesignToImage(backDesign, 800, 1000, 'back');
                
                // Combine them side by side
                const canvas = document.createElement('canvas');
                canvas.width = 1600; // 800 * 2
                canvas.height = 1000;
                const ctx = canvas.getContext('2d');
                
                if (ctx) {
                    // Load and draw front image
                    const frontImageEl = document.createElement('img');
                    frontImageEl.src = frontImg;
                    await new Promise((resolve) => {
                        frontImageEl.onload = () => {
                            ctx.drawImage(frontImageEl, 0, 0, 800, 1000);
                            resolve(null);
                        };
                    });
                    
                    // Load and draw back image
                    const backImageEl = document.createElement('img');
                    backImageEl.src = backImg;
                    await new Promise((resolve) => {
                        backImageEl.onload = () => {
                            ctx.drawImage(backImageEl, 800, 0, 800, 1000);
                            resolve(null);
                        };
                    });
                    
                    combined = canvas.toDataURL('image/png');
                } else {
                    return null;
                }
            } else if (frontDesign) {
                combined = await renderDesignToImage(frontDesign, 800, 1000, 'front');
            } else if (backDesign) {
                combined = await renderDesignToImage(backDesign, 800, 1000, 'back');
            } else {
                return null;
            }
            
            setCombinedDesignImage(combined);
            return combined;
        } catch (error) {
            console.error('Error generating combined image:', error);
            return null;
        }
    };

    const downloadCombinedImage = async () => {
        let imageToDownload = combinedDesignImage;
        
        // Generate if not already generated
        if (!imageToDownload) {
            imageToDownload = await generateCombinedImage();
        }
        
        if (!imageToDownload) {
            alert('Impossible de générer l\'image combinée');
            return;
        }
        
        // Create download link
        const link = document.createElement('a');
        link.download = `design-combine-${Date.now()}.png`;
        link.href = imageToDownload;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const useCombinedAsPreview = async () => {
        let imageToUse = combinedDesignImage;
        
        // Generate if not already generated
        if (!imageToUse) {
            imageToUse = await generateCombinedImage();
        }
        
        if (!imageToUse) {
            alert('Impossible de générer l\'image combinée');
            return;
        }
        
        setSelectedMockup(imageToUse);
        sessionStorage.setItem("uploadedDesign", imageToUse);
    };

    const renderUserDesigns = async (editorData: string) => {
        try {
            setIsRenderingDesign(true);
            
            if (!editorData || editorData.trim() === '') {
                console.log('No editor data provided');
                setIsRenderingDesign(false);
                return;
            }
            
            console.log('Parsing design data:', editorData.substring(0, 300));
            const designData = JSON.parse(editorData);
            console.log('Parsed design data structure:', {
                hasFront: !!designData.front,
                hasBack: !!designData.back,
                frontType: typeof designData.front,
                backType: typeof designData.back,
                frontLength: designData.front?.length,
                backLength: designData.back?.length
            });
            
            const frontDesign = designData.front || null;
            const backDesign = designData.back || null;
            
            console.log('Front design:', frontDesign ? `${frontDesign.substring(0, 100)}...` : 'null');
            console.log('Back design:', backDesign ? `${backDesign.substring(0, 100)}...` : 'null');
            
            // Render front and back separately
            if (frontDesign && frontDesign.trim() !== '' && frontDesign !== 'null') {
                try {
                    console.log('Rendering front design...');
                    const frontImg = await renderDesignToImage(frontDesign, 400, 500, 'front');
                    console.log('Front design rendered successfully, length:', frontImg.length);
                    setFrontDesignImage(frontImg);
                } catch (error) {
                    console.error('Error rendering front design:', error);
                }
            } else {
                console.log('Skipping front design - empty or null');
            }
            
            if (backDesign && backDesign.trim() !== '' && backDesign !== 'null') {
                try {
                    console.log('Rendering back design...');
                    const backImg = await renderDesignToImage(backDesign, 400, 500, 'back');
                    console.log('Back design rendered successfully, length:', backImg.length);
                    setBackDesignImage(backImg);
                } catch (error) {
                    console.error('Error rendering back design:', error);
                }
            } else {
                console.log('Skipping back design - empty or null');
            }
            
            // Generate combined image for download/preview
            await generateCombinedImage();
        } catch (error) {
            console.error('Error rendering designs:', error);
            console.error('Editor data:', editorData?.substring(0, 200));
        } finally {
            setIsRenderingDesign(false);
        }
    };

    const renderDesignToImage = async (
        designJson: string,
        width: number = 400,
        height: number = 500,
        side: 'front' | 'back' = 'front'
    ): Promise<string> => {
        // Import fabric correctly - when using dynamic import, fabric is the namespace
        const fabric = await import('fabric');
        
        // Get product type and color from sessionStorage
        const productType = sessionStorage.getItem("productType") || "tshirt";
        const productColor = sessionStorage.getItem("productColor") || "#ffffff";
        
        return new Promise((resolve, reject) => {
            try {
                if (!fabric || !fabric.StaticCanvas) {
                    console.error('Fabric module structure:', Object.keys(fabric));
                    throw new Error('Fabric.js StaticCanvas not available');
                }
                
                const canvas = new fabric.StaticCanvas(undefined, {
                    width,
                    height,
                    backgroundColor: 'transparent',
                });

                const design = JSON.parse(designJson);
                const { objects = [], w = width, h = height } = design;

                // Load product background image
                const base = productType.toLowerCase().includes('hoodie') ? 'Hoodie' : 'T-Shirt';
                const imagePath = side === 'front' ? `/${base}.png` : `/${base}-Back.png`;
                
                const loadProductImage = (): Promise<HTMLImageElement> => {
                    return new Promise((resolve, reject) => {
                        // Use HTMLImageElement constructor to avoid conflict with Next.js Image
                        const img = document.createElement('img') as HTMLImageElement;
                        img.crossOrigin = 'anonymous';
                        img.onload = () => resolve(img);
                        img.onerror = () => {
                            // Fallback to front image if back doesn't exist
                            if (side === 'back') {
                                const fallbackImg = document.createElement('img') as HTMLImageElement;
                                fallbackImg.crossOrigin = 'anonymous';
                                fallbackImg.onload = () => resolve(fallbackImg);
                                fallbackImg.onerror = reject;
                                fallbackImg.src = `/${base}.png`;
                            } else {
                                reject(new Error('Failed to load product image'));
                            }
                        };
                        img.src = imagePath;
                    });
                };

                loadProductImage().then((productImg) => {
                    // Create fabric image from product image
                    const bgImg = new fabric.FabricImage(productImg, {
                        originX: 'center',
                        originY: 'center',
                    });

                    const scale = Math.min(
                        (width * 0.88) / (bgImg.width || 1),
                        (height * 0.88) / (bgImg.height || 1)
                    );

                    bgImg.set({
                        left: width / 2,
                        top: height / 2,
                        scaleX: scale,
                        scaleY: scale,
                        selectable: false,
                        evented: false,
                    });

                    // Apply color filter if not white
                    if (productColor && productColor !== '#FFFFFF' && productColor !== '#ffffff') {
                        try {
                            const blendFilter = new fabric.filters.BlendColor({
                                color: productColor,
                                mode: 'multiply',
                                alpha: 0.6
                            });
                            bgImg.filters = [blendFilter];
                            bgImg.applyFilters();
                        } catch (e) {
                            console.warn('Could not apply color filter:', e);
                        }
                    }

                    // Set as background
                    canvas.backgroundImage = bgImg;
                    canvas.renderAll();

                    // Add design objects on top
                    if (objects && objects.length > 0) {
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

                            // Ensure everything is rendered before exporting
                            canvas.renderAll();
                            
                            // Use requestAnimationFrame to ensure everything is rendered
                            requestAnimationFrame(() => {
                                const dataUrl = canvas.toDataURL({
                                    format: 'png',
                                    quality: 1,
                                    multiplier: 1,
                                });

                                canvas.dispose();
                                resolve(dataUrl);
                            });
                        }).catch((error) => {
                            canvas.dispose();
                            reject(error);
                        });
                    } else {
                        // No design objects, just render background
                        canvas.renderAll();
                        requestAnimationFrame(() => {
                            const dataUrl = canvas.toDataURL({
                                format: 'png',
                                quality: 1,
                                multiplier: 1,
                            });
                            canvas.dispose();
                            resolve(dataUrl);
                        });
                    }
                }).catch((error) => {
                    console.error('Error loading product image:', error);
                    // Fallback: render without background
                    if (objects && objects.length > 0) {
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
                    } else {
                        canvas.dispose();
                        reject(error);
                    }
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
            
            // Use the same renderDesignToImage that includes backgrounds
            // This ensures we send the full canvas (background + design) to Gemini
            let combinedImage: string;
            
            if (frontDesign && backDesign) {
                // Render both with backgrounds
                const frontImg = await renderDesignToImage(frontDesign, 800, 1000, 'front');
                const backImg = await renderDesignToImage(backDesign, 800, 1000, 'back');
                
                // Combine them side by side
                const canvas = document.createElement('canvas');
                canvas.width = 1600; // 800 * 2
                canvas.height = 1000;
                const ctx = canvas.getContext('2d');
                
                if (ctx) {
                    // Load and draw front image
                    const frontImageEl = document.createElement('img');
                    frontImageEl.src = frontImg;
                    await new Promise((resolve) => {
                        frontImageEl.onload = () => {
                            ctx.drawImage(frontImageEl, 0, 0, 800, 1000);
                            resolve(null);
                        };
                    });
                    
                    // Load and draw back image
                    const backImageEl = document.createElement('img');
                    backImageEl.src = backImg;
                    await new Promise((resolve) => {
                        backImageEl.onload = () => {
                            ctx.drawImage(backImageEl, 800, 0, 800, 1000);
                            resolve(null);
                        };
                    });
                    
                    combinedImage = canvas.toDataURL('image/png');
                } else {
                    // Fallback to old method
                    combinedImage = await combineDesigns(frontDesign, backDesign);
                }
            } else if (frontDesign) {
                combinedImage = await renderDesignToImage(frontDesign, 800, 1000, 'front');
            } else if (backDesign) {
                combinedImage = await renderDesignToImage(backDesign, 800, 1000, 'back');
            } else {
                throw new Error('No design found');
            }
            
            console.log('Combined image length:', combinedImage.length);
            console.log('Combined image preview:', combinedImage.substring(0, 100));
            console.log('Sending to API - image includes background:', combinedImage.includes('data:image'));

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
            
            console.log('API Response:', { success: data.success, imagesCount: data.images?.length });
            
            if (data.success && data.images && data.images.length > 0) {
                console.log('Setting mockups:', data.images.length, 'images');
                setGeneratedMockups(data.images);
                setMockupLoading(false); // Stop loading when images are successfully set
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

                        {/* Selected Mockup Display */}
                        {selectedMockup && (
                            <div style={{
                                marginTop: '24px',
                                padding: '20px',
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                borderRadius: '16px',
                                border: '2px solid #41eb5c',
                                boxShadow: '0 4px 16px rgba(65, 235, 92, 0.15)',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginBottom: '16px',
                                }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        background: 'linear-gradient(135deg, #41eb5c 0%, #2dd44a 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </div>
                                    <h4 style={{
                                        margin: 0,
                                        fontSize: '16px',
                                        fontWeight: 700,
                                        color: '#0d1c23',
                                    }}>
                                        Maquette sélectionnée
                                    </h4>
                                </div>
                                <div style={{
                                    width: '100%',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '2px solid #e5e7eb',
                                    background: '#fff',
                                }}>
                                    <img 
                                        src={selectedMockup} 
                                        alt="Selected Mockup" 
                                        style={{ 
                                            width: '100%', 
                                            height: 'auto',
                                            display: 'block',
                                        }} 
                                    />
                                </div>
                                <p style={{
                                    marginTop: '12px',
                                    margin: 0,
                                    fontSize: '13px',
                                    color: '#6b7280',
                                    textAlign: 'center',
                                    fontStyle: 'italic',
                                }}>
                                    Ceci est l'aperçu final de votre produit
                                </p>
                            </div>
                        )}

                        <div className="pd-action-row" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <button type="button" className="pd-action-primary" onClick={openGenderSelectionModal} style={{ flex: '1', minWidth: '200px' }}>
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
                        
                        {/* Combined Image Actions */}
                        {(frontDesignImage || backDesignImage) && (
                            <div style={{
                                marginTop: '16px',
                                padding: '16px',
                                background: '#f9fafb',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                display: 'flex',
                                gap: '12px',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                            }}>
                                <div style={{ flex: '1', minWidth: '200px' }}>
                                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0d1c23', marginBottom: '4px' }}>
                                        Image combinée (Recto + Verso)
                                    </p>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                                        Téléchargez ou utilisez comme aperçu final
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <button
                                        type="button"
                                        onClick={downloadCombinedImage}
                                        style={{
                                            padding: '10px 20px',
                                            borderRadius: '8px',
                                            border: '2px solid #41eb5c',
                                            background: '#ffffff',
                                            color: '#41eb5c',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#f0fdf4';
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#ffffff';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="7 10 12 15 17 10"></polyline>
                                            <line x1="12" y1="15" x2="12" y2="3"></line>
                                        </svg>
                                        Télécharger
                                    </button>
                                    <button
                                        type="button"
                                        onClick={useCombinedAsPreview}
                                        style={{
                                            padding: '10px 20px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: 'linear-gradient(135deg, #41eb5c 0%, #2dd44a 100%)',
                                            color: '#ffffff',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            boxShadow: '0 2px 8px rgba(65, 235, 92, 0.3)',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(65, 235, 92, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(65, 235, 92, 0.3)';
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        Utiliser comme aperçu
                                    </button>
                                </div>
                            </div>
                        )}
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

            {/* Gender Selection Modal - Overhauled */}
            {genderSelectionModalOpen && (
                <div className="pu-popup-overlay" onClick={closeGenderSelectionModal}>
                    <div 
                        className="pu-popup" 
                        onClick={(event) => event.stopPropagation()}
                        style={{
                            maxWidth: '600px',
                            padding: '32px',
                        }}
                    >
                        <button 
                            className="pu-popup-close" 
                            type="button" 
                            onClick={closeGenderSelectionModal}
                            style={{
                                top: '20px',
                                right: '20px',
                                fontSize: '28px',
                                color: '#666',
                            }}
                        >
                            ×
                        </button>
                        
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <h2 className="pu-popup-title" style={{ 
                                fontSize: '28px', 
                                fontWeight: 700, 
                                color: '#0d1c23',
                                marginBottom: '12px',
                            }}>
                                Sélectionnez le type de maquette
                            </h2>
                            <p style={{ 
                                fontSize: '15px', 
                                color: '#6b7280',
                                margin: 0,
                                lineHeight: '1.5',
                            }}>
                                Choisissez le type de modèle pour générer votre maquette personnalisée
                            </p>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                            gap: '16px',
                            marginBottom: '32px',
                        }}>
                            {GENDER_OPTIONS.map((option) => {
                                const isSelected = selectedGenderForMockup === option.id;
                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => setSelectedGenderForMockup(option.id)}
                                        style={{
                                            padding: '20px 16px',
                                            borderRadius: '16px',
                                            border: isSelected ? '2px solid #41eb5c' : '2px solid #e5e7eb',
                                            backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            boxShadow: isSelected 
                                                ? '0 8px 24px rgba(65, 235, 92, 0.15)' 
                                                : '0 2px 8px rgba(0, 0, 0, 0.05)',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.borderColor = '#41eb5c';
                                                e.currentTarget.style.backgroundColor = '#f9fafb';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.borderColor = '#e5e7eb';
                                                e.currentTarget.style.backgroundColor = '#ffffff';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                                            }
                                        }}
                                    >
                                        {isSelected && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                backgroundColor: '#41eb5c',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 2px 8px rgba(65, 235, 92, 0.3)',
                                            }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            </div>
                                        )}
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            backgroundColor: isSelected ? '#41eb5c' : '#f3f4f6',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '4px',
                                            transition: 'all 0.3s',
                                        }}>
                                            <span style={{
                                                fontSize: '24px',
                                                color: isSelected ? '#ffffff' : '#6b7280',
                                            }}>
                                                {option.id === 'homme' ? '👨' : 
                                                 option.id === 'femme' ? '👩' :
                                                 option.id === 'enfant' ? '👶' :
                                                 option.id === 'groupe' ? '👥' :
                                                 option.id === 'famille' ? '👨‍👩‍👧‍👦' :
                                                 option.id === 'couple' ? '💑' :
                                                 option.id === 'sport' ? '⚽' :
                                                 option.id === 'corporate' ? '💼' : '👤'}
                                            </span>
                                        </div>
                                        <span style={{
                                            fontSize: '14px',
                                            fontWeight: isSelected ? 700 : 600,
                                            color: isSelected ? '#0d1c23' : '#4b5563',
                                            textAlign: 'center',
                                        }}>
                                            {option.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div style={{ 
                            display: 'flex', 
                            gap: '12px', 
                            justifyContent: 'center',
                            paddingTop: '8px',
                        }}>
                            <button
                                type="button"
                                onClick={closeGenderSelectionModal}
                                style={{
                                    padding: '14px 32px',
                                    borderRadius: '12px',
                                    border: '2px solid #e5e7eb',
                                    backgroundColor: '#ffffff',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    color: '#4b5563',
                                    transition: 'all 0.2s',
                                    minWidth: '120px',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#d1d5db';
                                    e.currentTarget.style.backgroundColor = '#f9fafb';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#e5e7eb';
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleGenerateMockup}
                                className="pd-action-primary"
                                style={{
                                    padding: '14px 32px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    fontWeight: 700,
                                    color: '#ffffff',
                                    background: 'linear-gradient(135deg, #41eb5c 0%, #2dd44a 100%)',
                                    boxShadow: '0 4px 16px rgba(65, 235, 92, 0.3)',
                                    transition: 'all 0.2s',
                                    minWidth: '140px',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(65, 235, 92, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(65, 235, 92, 0.3)';
                                }}
                            >
                                Générer la maquette
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

