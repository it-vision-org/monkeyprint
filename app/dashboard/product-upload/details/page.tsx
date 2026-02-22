'use client';

import Image from "next/image";
// Note: Using document.createElement('img') instead of new Image() to avoid conflict with Next.js Image
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../../styles/product-upload.module.css";
// ProductUploadHeader removed - using dashboard layout instead
import { combineDesigns } from "@/lib/utils/designRenderer";
import { useAlert } from '@/components/providers/AlertContext';

type GenderOption = {
    id: string;
    label: string;
};

const GENDER_OPTIONS: GenderOption[] = [
    { id: "homme", label: "Homme" },
    { id: "femme", label: "Femme" },
    { id: "enfant", label: "Enfant" },
    { id: "famille", label: "Famille" },
    { id: "custom", label: "Personnaliser ou autre" },
];

// MIN_PRICE will be loaded from API
let MIN_PRICE = 55;

export default function ProductDetailsPage() {
    const router = useRouter();
    const { showAlert } = useAlert();
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
    const [customPrompt, setCustomPrompt] = useState<string>("");
    const [isFirstProduct, setIsFirstProduct] = useState<boolean>(true);
    const [minPrice, setMinPrice] = useState<number>(55);
    const [pricingSettings, setPricingSettings] = useState<any>(null);

    // Pricing UI States
    const [mobilePriceExpanded, setMobilePriceExpanded] = useState(false);
    const [desktopPriceExpanded, setDesktopPriceExpanded] = useState(false);
    const [desktopPriceLocked, setDesktopPriceLocked] = useState(false);

    // Pricing Data States (Loaded from sessionStorage)
    const [basePrice, setBasePrice] = useState(0);
    const [designFee, setDesignFee] = useState(0);
    const [qualityPrice, setQualityPrice] = useState(0);
    const [selectedQualityLabel, setSelectedQualityLabel] = useState("Cotton");
    const [totalPrice, setTotalPrice] = useState(0);
    const [productTypeLabel, setProductTypeLabel] = useState("T-Shirt");

    // Load design data and product data on mount
    useEffect(() => {
        const savedDesign = sessionStorage.getItem("uploadedDesign");
        const savedEditorData = sessionStorage.getItem("designEditorData");
        const editingProductId = sessionStorage.getItem("editingProductId");

        console.log('Details page loading - savedEditorData:', savedEditorData?.substring(0, 200));
        console.log('Details page loading - savedDesign:', savedDesign);
        console.log('Details page loading - editingProductId:', editingProductId);

        // Load pricing data from previous step
        setBasePrice(parseFloat(sessionStorage.getItem("productBasePrice") || "20"));
        setDesignFee(parseFloat(sessionStorage.getItem("productDesignFee") || "0"));
        setQualityPrice(parseFloat(sessionStorage.getItem("productQualityPrice") || "0"));
        setSelectedQualityLabel(sessionStorage.getItem("productQualityLabel") || "Cotton");
        setTotalPrice(parseFloat(sessionStorage.getItem("productTotalPrice") || "20"));
        setProductTypeLabel(sessionStorage.getItem("productTypeLabel") || "T-Shirt");

        // If editing, load product data
        if (editingProductId) {
            const editingProductName = sessionStorage.getItem("editingProductName");
            const editingProductDescription = sessionStorage.getItem("editingProductDescription");
            const editingProductPrice = sessionStorage.getItem("editingProductPrice");

            if (editingProductName) {
                setProductName(editingProductName);
            }
            if (editingProductDescription) {
                setDescription(editingProductDescription);
                setCharCount(editingProductDescription.length);
            }
            if (editingProductPrice) {
                const price = parseFloat(editingProductPrice);
                setProductPrice(price.toString());
                setDisplayPrice(price.toString());
            }
        }

        if (savedEditorData) {
            setDesignEditorData(savedEditorData);
            // Render the designs to display them
            renderUserDesigns(savedEditorData);
        } else {
            // Always render empty designs if no editor data exists
            const emptyDesignData = JSON.stringify({ front: null, back: null });
            setDesignEditorData(emptyDesignData);
            renderUserDesigns(emptyDesignData);

            // Fallback to saved design if no editor data but there's a saved design
            if (savedDesign) {
                setSelectedMockup(savedDesign);
            }
        }
    }, []);

    // Load pricing settings
    useEffect(() => {
        async function loadPricingSettings() {
            try {
                const response = await fetch('/api/product-config');
                const data = await response.json();
                if (data.pricingSettings) {
                    setPricingSettings(data.pricingSettings);
                    setMinPrice(data.pricingSettings.minPrice || 55);
                    // Set default prices if not already set
                    if (productPrice === "55") {
                        setProductPrice(data.pricingSettings.minPrice?.toString() || "55");
                        setDisplayPrice(data.pricingSettings.minPrice?.toString() || "55");
                    }
                }
            } catch (error) {
                console.error('Error loading pricing settings:', error);
            }
        }
        loadPricingSettings();
    }, []);

    // Check if this is the first product
    useEffect(() => {
        async function checkProductCount() {
            try {
                const response = await fetch('/api/check-product-count');
                const data = await response.json();
                setIsFirstProduct(data.count === 0);
            } catch (error) {
                console.error('Error checking product count:', error);
                setIsFirstProduct(false);
            }
        }
        checkProductCount();
    }, []);

    const generateCombinedImage = async () => {
        // Use the already-rendered preview images which are correctly displayed
        // This ensures the combined image matches exactly what the user sees
        if (!frontDesignImage && !backDesignImage) {
            // If preview images aren't ready, wait a bit and try again
            await new Promise(resolve => setTimeout(resolve, 500));
            if (!frontDesignImage && !backDesignImage) {
                return null;
            }
        }

        try {
            let combined: string;

            if (frontDesignImage && backDesignImage) {
                // Combine the preview images side by side
                const canvas = document.createElement('canvas');
                // Each preview is 400x500, so combined is 800x500
                canvas.width = 800; // 400 * 2
                canvas.height = 500;
                const ctx = canvas.getContext('2d');

                if (ctx) {
                    // Load and draw front image (left side)
                    const frontImageEl = document.createElement('img');
                    frontImageEl.crossOrigin = 'anonymous';
                    frontImageEl.src = frontDesignImage;
                    await new Promise((resolve, reject) => {
                        frontImageEl.onload = () => {
                            ctx.drawImage(frontImageEl, 0, 0, 400, 500);
                            resolve(null);
                        };
                        frontImageEl.onerror = reject;
                    });

                    // Load and draw back image (right side)
                    const backImageEl = document.createElement('img');
                    backImageEl.crossOrigin = 'anonymous';
                    backImageEl.src = backDesignImage;
                    await new Promise((resolve, reject) => {
                        backImageEl.onload = () => {
                            ctx.drawImage(backImageEl, 400, 0, 400, 500);
                            resolve(null);
                        };
                        backImageEl.onerror = reject;
                    });

                    combined = canvas.toDataURL('image/png', 1.0);
                } else {
                    return null;
                }
            } else if (frontDesignImage) {
                // Only front design
                combined = frontDesignImage;
            } else if (backDesignImage) {
                // Only back design
                combined = backDesignImage;
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
            showAlert('Impossible de générer l\'image combinée', 'error');
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
            showAlert('Impossible de générer l\'image combinée', 'error');
            return;
        }

        setSelectedMockup(imageToUse);
        sessionStorage.setItem("uploadedDesign", imageToUse);
    };

    const renderUserDesigns = async (editorData: string) => {
        try {
            setIsRenderingDesign(true);

            // Create empty design structure for default rendering
            const emptyDesign = JSON.stringify({ objects: [], w: 400, h: 500 });
            let designData: { front?: string | null; back?: string | null };

            if (!editorData || editorData.trim() === '') {
                console.log('No editor data provided, using empty designs');
                designData = { front: null, back: null };
            } else {
                console.log('Parsing design data:', editorData.substring(0, 300));
                designData = JSON.parse(editorData);
            }
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

            // Always render both front and back, even when empty
            // Render front design (always)
            try {
                const frontDesignToRender = (frontDesign && frontDesign.trim() !== '' && frontDesign !== 'null')
                    ? frontDesign
                    : emptyDesign;
                console.log('Rendering front design...');
                const frontImg = await renderDesignToImage(frontDesignToRender, 400, 500, 'front');
                console.log('Front design rendered successfully, length:', frontImg.length);
                setFrontDesignImage(frontImg);
            } catch (error) {
                console.error('Error rendering front design:', error);
            }

            // Render back design (always)
            try {
                const backDesignToRender = (backDesign && backDesign.trim() !== '' && backDesign !== 'null')
                    ? backDesign
                    : emptyDesign;
                console.log('Rendering back design...');
                const backImg = await renderDesignToImage(backDesignToRender, 400, 500, 'back');
                console.log('Back design rendered successfully, length:', backImg.length);
                setBackDesignImage(backImg);
            } catch (error) {
                console.error('Error rendering back design:', error);
            }

            // Generate combined image for download/preview after images are set
            // Use setTimeout to ensure state is updated first
            setTimeout(() => {
                generateCombinedImage();
            }, 100);
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

                // Load product background image - use dynamic R2 picture from sessionStorage
                let imagePath: string | null;
                if (side === 'front') {
                    imagePath = sessionStorage.getItem("productTypeImage");
                } else {
                    imagePath = sessionStorage.getItem("productTypeBackImage");
                }

                // If no image path, reject
                if (!imagePath) {
                    reject(new Error(`No ${side} image available`));
                    return;
                }

                const loadProductImage = (): Promise<HTMLImageElement> => {
                    return new Promise((resolve, reject) => {
                        // Use HTMLImageElement constructor to avoid conflict with Next.js Image
                        const img = document.createElement('img') as HTMLImageElement;
                        img.crossOrigin = 'anonymous';
                        img.onload = () => resolve(img);
                        img.onerror = () => {
                            // Fallback to front image if back doesn't exist
                            if (side === 'back') {
                                const frontImagePath = sessionStorage.getItem("productTypeImage");
                                if (frontImagePath) {
                                    const fallbackImg = document.createElement('img') as HTMLImageElement;
                                    fallbackImg.crossOrigin = 'anonymous';

                                    // Proxy R2 URLs if needed
                                    const isExternalUrl = frontImagePath.startsWith('http://') || frontImagePath.startsWith('https://');
                                    const isLocalhost = frontImagePath.includes('localhost') || frontImagePath.startsWith('/');
                                    const finalSrc = (isExternalUrl && !isLocalhost)
                                        ? `/api/proxy-image?url=${encodeURIComponent(frontImagePath)}`
                                        : frontImagePath;

                                    fallbackImg.onload = () => resolve(fallbackImg);
                                    fallbackImg.onerror = reject;
                                    fallbackImg.src = finalSrc;
                                } else {
                                    reject(new Error('Failed to load product image and no fallback available'));
                                }
                            } else {
                                reject(new Error('Failed to load product image'));
                            }
                        };

                        // Proxy R2 URLs if needed (external URLs that aren't localhost)
                        const isExternalUrl = imagePath.startsWith('http://') || imagePath.startsWith('https://');
                        const isLocalhost = imagePath.includes('localhost') || imagePath.startsWith('/');
                        const finalSrc = (isExternalUrl && !isLocalhost)
                            ? `/api/proxy-image?url=${encodeURIComponent(imagePath)}`
                            : imagePath;

                        img.src = finalSrc;
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

                        fabric.util.enlivenObjects(objects).then(async (objs: any[]) => {
                            console.log('Enlivened objects:', objs.length, 'objects');
                            console.log('Object types:', objs.map(o => o.type || o.constructor.name));
                            // Wait for all images to be fully loaded
                            const imagePromises = objs
                                .filter(obj => obj.type === 'image' || obj instanceof fabric.FabricImage)
                                .map((imgObj: any) => {
                                    return new Promise<void>((resolve) => {
                                        if (imgObj.getElement) {
                                            const imgEl = imgObj.getElement() as HTMLImageElement;
                                            if (imgEl) {
                                                if (imgEl.complete && imgEl.naturalHeight !== 0) {
                                                    resolve();
                                                } else {
                                                    imgEl.onload = () => resolve();
                                                    imgEl.onerror = () => resolve(); // Continue even if image fails
                                                }
                                            } else {
                                                resolve();
                                            }
                                        } else {
                                            resolve();
                                        }
                                    });
                                });

                            await Promise.all(imagePromises);

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

                            // Wait a bit more to ensure all images are rendered
                            await new Promise(resolve => setTimeout(resolve, 100));

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
                            console.error('Error enlivening objects:', error);
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

                        fabric.util.enlivenObjects(objects).then(async (objs: any[]) => {
                            // Wait for all images to be fully loaded
                            const imagePromises = objs
                                .filter(obj => obj.type === 'image' || obj instanceof fabric.FabricImage)
                                .map((imgObj: any) => {
                                    return new Promise<void>((resolve) => {
                                        if (imgObj.getElement) {
                                            const imgEl = imgObj.getElement() as HTMLImageElement;
                                            if (imgEl) {
                                                if (imgEl.complete && imgEl.naturalHeight !== 0) {
                                                    resolve();
                                                } else {
                                                    imgEl.onload = () => resolve();
                                                    imgEl.onerror = () => resolve();
                                                }
                                            } else {
                                                resolve();
                                            }
                                        } else {
                                            resolve();
                                        }
                                    });
                                });

                            await Promise.all(imagePromises);

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
                            await new Promise(resolve => setTimeout(resolve, 100));

                            const dataUrl = canvas.toDataURL({
                                format: 'png',
                                quality: 1,
                                multiplier: 1,
                            });
                            canvas.dispose();
                            resolve(dataUrl);
                        }).catch((error) => {
                            console.error('Error enlivening objects (fallback):', error);
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
        if (!pricingSettings) return 0;

        const base = parseFloat(productPrice) || 0;
        const display = parseFloat(displayPrice) || 0;

        switch (pricingSettings.profitCalculationType) {
            case 'PERCENTAGE':
                if (pricingSettings.profitPercentage) {
                    return (base * pricingSettings.profitPercentage) / 100;
                }
                return 0;
            case 'FIXED':
                return pricingSettings.profitFixedAmount || 0;
            case 'DIFFERENCE':
            default:
                const delta = display - base;
                return delta > 0 ? delta : 0;
        }
    }, [productPrice, displayPrice, pricingSettings]);

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
            showAlert('Aucun design trouvé. Veuillez retourner à l\'éditeur de design.', 'warning');
            return;
        }

        closeGenderSelectionModal();
        setMockupModalOpen(true);
        setMockupLoading(true);
        setGeneratedMockups([]);

        try {
            // Use the same preview images that are correctly displayed
            // This ensures we send exactly what the user sees to Gemini
            if (!frontDesignImage && !backDesignImage) {
                throw new Error('Les images de prévisualisation ne sont pas encore prêtes. Veuillez attendre un instant.');
            }

            let combinedImage: string;

            if (frontDesignImage && backDesignImage) {
                // Combine the preview images side by side (same as generateCombinedImage)
                const canvas = document.createElement('canvas');
                // Each preview is 400x500, so combined is 800x500
                canvas.width = 800; // 400 * 2
                canvas.height = 500;
                const ctx = canvas.getContext('2d');

                if (ctx) {
                    // Load and draw front image (left side)
                    const frontImageEl = document.createElement('img');
                    frontImageEl.crossOrigin = 'anonymous';
                    frontImageEl.src = frontDesignImage;
                    await new Promise((resolve, reject) => {
                        frontImageEl.onload = () => {
                            ctx.drawImage(frontImageEl, 0, 0, 400, 500);
                            resolve(null);
                        };
                        frontImageEl.onerror = reject;
                    });

                    // Load and draw back image (right side)
                    const backImageEl = document.createElement('img');
                    backImageEl.crossOrigin = 'anonymous';
                    backImageEl.src = backDesignImage;
                    await new Promise((resolve, reject) => {
                        backImageEl.onload = () => {
                            ctx.drawImage(backImageEl, 400, 0, 400, 500);
                            resolve(null);
                        };
                        backImageEl.onerror = reject;
                    });

                    combinedImage = canvas.toDataURL('image/png', 1.0);
                } else {
                    throw new Error('Impossible de créer le contexte canvas');
                }
            } else if (frontDesignImage) {
                // Only front design
                combinedImage = frontDesignImage;
            } else if (backDesignImage) {
                // Only back design
                combinedImage = backDesignImage;
            } else {
                throw new Error('Aucune image de design disponible');
            }

            console.log('Combined image length:', combinedImage.length);
            console.log('Combined image preview:', combinedImage.substring(0, 100));
            console.log('Sending to API - using preview images:', !!frontDesignImage && !!backDesignImage);

            // Call API to generate mockups
            const response = await fetch('/api/generate-mockup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    designImageBase64: combinedImage,
                    gender: selectedGenderForMockup,
                    customPrompt: selectedGenderForMockup === 'custom' ? customPrompt : undefined,
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
            showAlert(`Erreur lors de la génération des maquettes: ${error.message}`, 'error');
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

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!productName || !productPrice) {
            showAlert("Veuillez remplir le nom et le prix du produit.", 'warning');
            return;
        }

        // Check if user has selected a mockup or we need to use combined image
        let finalImage = selectedMockup;

        if (!finalImage) {
            // If no mockup selected, generate and use the combined image
            finalImage = combinedDesignImage || await generateCombinedImage();
        }

        if (!finalImage) {
            showAlert("Veuillez générer une maquette ou attendre que les aperçus se chargent.", 'warning');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('name', productName);
            formData.append('description', description);
            formData.append('price', productPrice);
            formData.append('type', sessionStorage.getItem("productType") || 'tshirt');
            formData.append('designData', designEditorData || '{}');

            // Send only the final mockup image
            formData.append('mockupImage', finalImage);

            // If editing, include product ID
            const editingProductId = sessionStorage.getItem("editingProductId");
            if (editingProductId) {
                formData.append('productId', editingProductId);
            }

            const { createProduct } = await import('../../../product-upload/actions');
            const result = await createProduct(formData);

            // Check if there's an error returned (not a redirect)
            if (result?.error) {
                showAlert(`Erreur: ${result.error}`, 'error');
                setIsSubmitting(false);
            }
            // If no error and no result, redirect happened (which throws)
        } catch (error: any) {
            // Check if it's a Next.js redirect (which is expected and not an error)
            if (error?.digest?.startsWith('NEXT_REDIRECT')) {
                // This is normal - redirect is happening, product was saved successfully
                // Clean up edit mode sessionStorage
                sessionStorage.removeItem("editingProductId");
                sessionStorage.removeItem("editingProductName");
                sessionStorage.removeItem("editingProductDescription");
                sessionStorage.removeItem("editingProductPrice");
                return;
            }
            // Only show error for actual errors
            console.error('Product save error:', error);
            showAlert("Une erreur est survenue lors de l'enregistrement du produit.", 'error');
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const displayTotalPrice = parseFloat(productPrice) || minPrice;

    // Mobile sticky price bar
    const MobilePriceBar = () => (
        <div className={`${styles.puCartContainer} ${styles.puCartContainerMobile}`}>
            <button
                className={styles.puCartBar}
                type="button"
                aria-expanded={mobilePriceExpanded}
                onClick={() => setMobilePriceExpanded((prev) => !prev)}
            >
                <div className={styles.puCartContent}>
                    <svg
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
                <div className={styles.puCartTotal}>
                    <span className={styles.puCartPrice}>{totalPrice}DT</span>
                    <svg
                        width="16"
                        height="10"
                        viewBox="0 0 16 10"
                        fill="none"
                        className={mobilePriceExpanded ? styles.expanded : ""}
                    >
                        <path
                            d="M1 1L8 8L15 1"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </button>
            {mobilePriceExpanded && (
                <div className={`${styles.puCartDetails} ${styles.puCartDetailsMobile}`}>
                    <div className={styles.puCartDetailsHeader}>
                        <h3 className={styles.puCartDetailsTitle}>Détails du prix</h3>
                    </div>
                    <div className={styles.puCartItems}>
                        <div className={styles.puCartItem}>
                            <div className={styles.puCartItemInfo}>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                                    <path d="M3 6h18" />
                                    <path d="M16 10a4 4 0 0 1-8 0" />
                                </svg>
                                <span>
                                    Articles ({productTypeLabel})
                                </span>
                            </div>
                            <span className={styles.puCartItemPrice}>{basePrice}DT</span>
                        </div>
                        <div className={styles.puCartItem}>
                            <div className={styles.puCartItemInfo}>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                    <line x1="12" y1="22.08" x2="12" y2="12" />
                                </svg>
                                <span>Design</span>
                            </div>
                            <span className={styles.puCartItemPrice}>{designFee}DT</span>
                        </div>
                        <div className={styles.puCartItem}>
                            <div className={styles.puCartItemInfo}>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5" />
                                    <path d="M2 12l10 5 10-5" />
                                </svg>
                                <span className={styles.puPriceWidgetItemLabel}>
                                    Quality ({selectedQualityLabel})
                                </span>
                            </div>
                            <span className={styles.puCartItemPrice}>{qualityPrice}DT</span>
                        </div>
                    </div>
                    <div className={styles.puCartTotalLine}>
                        <span className={styles.puCartTotalLabel}>Total</span>
                        <span className={styles.puCartTotalPrice}>{totalPrice}DT</span>
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
                className={`${styles.puPriceWidgetDesktop} ${desktopPriceExpanded ? styles.expanded : ""} ${desktopPriceLocked ? styles.locked : ""}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <button
                    className={styles.puPriceWidgetTrigger}
                    type="button"
                    onClick={handleToggle}
                    aria-label="Voir le récapitulatif des prix"
                >
                    <div className={styles.puPriceWidgetTriggerIcon}>
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
                    <div className={styles.puPriceWidgetTriggerPrice}>{totalPrice}DT</div>
                </button>

                <div className={styles.puPriceWidgetPanel}>
                    <div className={styles.puPriceWidgetHeader}>
                        <div className={styles.puPriceWidgetHeaderIcon}>
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
                        <div className={styles.puPriceWidgetHeaderTitle}>Récapitulatif</div>
                    </div>
                    <div className={styles.puPriceWidgetContent}>
                        <div className={styles.puPriceWidgetItems}>
                            <div className={styles.puPriceWidgetItem}>
                                <div className={styles.puPriceWidgetItemInfo}>
                                    <div className={styles.puPriceWidgetItemIcon}>
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                                            <path d="M3 6h18" />
                                            <path d="M16 10a4 4 0 0 1-8 0" />
                                        </svg>
                                    </div>
                                    <span className={styles.puPriceWidgetItemLabel}>
                                        Articles ({productTypeLabel})
                                    </span>
                                </div>
                                <span className={styles.puPriceWidgetItemPrice}>
                                    {basePrice}DT
                                </span>
                            </div>
                            <div className={styles.puPriceWidgetItem}>
                                <div className={styles.puPriceWidgetItemInfo}>
                                    <div className={styles.puPriceWidgetItemIcon}>
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                            <line x1="12" y1="22.08" x2="12" y2="12" />
                                        </svg>
                                    </div>
                                    <span className={styles.puPriceWidgetItemLabel}>Design</span>
                                </div>
                                <span className={styles.puPriceWidgetItemPrice}>
                                    {designFee}DT
                                </span>
                            </div>
                            <div className={styles.puPriceWidgetItem}>
                                <div className={styles.puPriceWidgetItemInfo}>
                                    <div className={styles.puPriceWidgetItemIcon}>
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                            <path d="M2 17l10 5 10-5" />
                                            <path d="M2 12l10 5 10-5" />
                                        </svg>
                                    </div>
                                    <span className={styles.puPriceWidgetItemLabel}>
                                        Quality ({selectedQualityLabel})
                                    </span>
                                </div>
                                <span className={styles.puPriceWidgetItemPrice}>
                                    {qualityPrice}DT
                                </span>
                            </div>
                        </div>
                        <div className={styles.puPriceWidgetTotal}>
                            <div className={styles.puPriceWidgetTotalLabel}>Total</div>
                            <div className={styles.puPriceWidgetTotalPrice}>{totalPrice}DT</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.productUploadPage}>
            <MobilePriceBar />
            <DesktopPriceWidget />
            <main className={styles.puMobileMain} style={{ paddingBottom: mobilePriceExpanded ? "260px" : "120px" }}>
                <div className={styles.puMobileFlow}>
                    <button
                        onClick={handleBack}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            fontSize: '15px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            marginBottom: '6px',
                            padding: '8px 0',
                            transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Retour à l'édition
                    </button>
                    <div className={styles.pdIntro}>
                        <p className={styles.pdIntroTitle}>
                            {sessionStorage.getItem("editingProductId")
                                ? "Modifiez les détails de votre produit"
                                : "Dernière étape, remplissez la description de votre produit"}
                        </p>
                        <span className={styles.pdIntroLine} />
                    </div>

                    <section className={styles.pdCard}>
                        <h3 className={styles.puCardSubtitle} style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 700, color: '#000' }}>
                            Aperçu de votre design
                        </h3>

                        <div className={styles.pdPreviewCard}>
                            {isRenderingDesign ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: '300px',
                                    flexDirection: 'column',
                                    gap: '12px'
                                }}>
                                    <div className={styles.puSpinner} />
                                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', margin: 0 }}>Chargement du design...</p>
                                </div>
                            ) : (
                                <div className={styles.pdDesignPreviewGrid}>
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

                        <div className={styles.pdActionRow}>
                            <button type="button" className={styles.pdActionPrimary} onClick={openGenderSelectionModal} style={{ flex: '1', minWidth: '200px' }}>
                                GÉNÉRER UNE MAQUETTE
                            </button>
                            <button
                                type="button"
                                className={styles.pdActionRefresh}
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

                    <section className={styles.pdCard}>
                        <div className={styles.pdField}>
                            <div className={styles.pdLabel}>
                                Sélectionner le sexe du produit :<span>*</span>
                            </div>
                            <div className={styles.pdRequiredNote}>Doit être rempli*</div>
                            <div className={styles.pdGenderRow}>
                                {GENDER_OPTIONS.slice(0, 3).map((option) => (
                                    <label key={option.id} className={`${styles.pdRadioOption} ${selectedGenders.includes(option.id) ? styles.active : ""}`}>
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
                                        <span className={styles.pdRadioLabel}>{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className={styles.pdCard}>
                        <div className={styles.pdField}>
                            <label htmlFor="product-name" className={styles.pdLabel}>
                                Nom du produit :<span>*</span>
                            </label>
                            <div className={styles.pdRequiredNote}>Doit être rempli*</div>
                            <input
                                id="product-name"
                                className={styles.pdInput}
                                type="text"
                                value={productName}
                                onChange={(event) => setProductName(event.target.value)}
                            />
                        </div>

                        <div className={styles.pdField}>
                            <div className={styles.pdLabel}>
                                Prix du produit :<span>*</span>
                            </div>
                            <div className={styles.pdRequiredNote}>Doit être rempli*</div>
                            <div className={styles.pdPriceRow}>
                                <div className={styles.pdInputWrapper}>
                                    <input
                                        className={styles.pdInput}
                                        type="number"
                                        min={minPrice}
                                        value={productPrice}
                                        onChange={(event) => setProductPrice(event.target.value)}
                                    />
                                    <span className={styles.pdInputSuffix}>DT</span>
                                </div>
                                <div className={styles.pdProfit}>
                                    <span className={styles.pdProfitLabel}>Tu prends</span>
                                    <button type="button" className={styles.pdProfitPill}>{profit.toFixed(0)}DT</button>
                                </div>
                            </div>
                        </div>

                        <div className={styles.pdField}>
                            <label htmlFor="display-price" className={styles.pdLabel}>
                                Prix affiché :
                            </label>
                            <input
                                id="display-price"
                                className={styles.pdInput}
                                type="number"
                                min={productPrice}
                                value={displayPrice}
                                onChange={(event) => setDisplayPrice(event.target.value)}
                            />
                        </div>

                        <div className={styles.pdField}>
                            <label htmlFor="description" className={styles.pdLabel}>
                                Description :
                            </label>
                            <textarea
                                id="description"
                                className={styles.pdTextarea}
                                value={description}
                                maxLength={3000}
                                onChange={(event) => handleDescriptionChange(event.target.value)}
                            />
                            <div className={styles.pdTextareaCounter}>3000 Personnages</div>
                        </div>
                    </section>

                    <button className={styles.pdSubmit} type="button" onClick={handleSubmit}>
                        {sessionStorage.getItem("editingProductId")
                            ? "ENREGISTRER LES MODIFICATIONS"
                            : (isFirstProduct ? "VOTRE SITE WEB EST PRÊT" : "PUBLIER LE PRODUIT")}
                    </button>
                </div>
            </main>

            {/* Gender Selection Modal - Overhauled */}
            {genderSelectionModalOpen && (
                <div className={styles.puPopupOverlay} onClick={closeGenderSelectionModal}>
                    <div
                        className={styles.puPopup}
                        onClick={(event) => event.stopPropagation()}
                        style={{
                            maxWidth: '600px',
                            padding: '32px',
                        }}
                    >
                        <button
                            className={styles.puPopupClose}
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
                            <h2 className={styles.puPopupTitle} style={{
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
                                                            option.id === 'famille' ? '👨‍👩‍👧‍👦' :
                                                                option.id === 'custom' ? '✏️' : '👤'}
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

                        {/* Custom Prompt Input */}
                        {selectedGenderForMockup === 'custom' && (
                            <div style={{
                                marginBottom: '24px',
                                padding: '20px',
                                background: '#f9fafb',
                                borderRadius: '12px',
                                border: '2px solid #e5e7eb',
                            }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#0d1c23',
                                    marginBottom: '8px',
                                }}>
                                    Décrivez votre maquette personnalisée
                                </label>
                                <textarea
                                    value={customPrompt}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 200) {
                                            setCustomPrompt(e.target.value);
                                        }
                                    }}
                                    placeholder="Ex: Un groupe d'amis portant des t-shirts lors d'un événement sportif..."
                                    style={{
                                        width: '100%',
                                        minHeight: '100px',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '2px solid #e5e7eb',
                                        fontSize: '14px',
                                        fontFamily: 'inherit',
                                        resize: 'vertical',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        backgroundColor: '#ffffff',
                                        color: '#0d1c23',
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = '#41eb5c';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                    }}
                                />
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: '8px',
                                }}>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '12px',
                                        color: '#6b7280',
                                        fontStyle: 'italic',
                                    }}>
                                        Maximum 200 caractères
                                    </p>
                                    <span style={{
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: customPrompt.length >= 200 ? '#ef4444' : '#6b7280',
                                    }}>
                                        {customPrompt.length}/200
                                    </span>
                                </div>
                            </div>
                        )}

                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'center',
                            paddingTop: '8px',
                        }}>
                            <button
                                type="button"
                                onClick={closeGenderSelectionModal}
                                className={styles.pdActionSecondary}
                                style={{
                                    minWidth: "120px",
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleGenerateMockup}
                                disabled={selectedGenderForMockup === 'custom' && (!customPrompt || customPrompt.trim().length === 0)}
                                className={styles.pdActionPrimary}
                                style={{
                                    padding: '14px 32px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    cursor: (selectedGenderForMockup === 'custom' && (!customPrompt || customPrompt.trim().length === 0)) ? 'not-allowed' : 'pointer',
                                    fontSize: '15px',
                                    fontWeight: 700,
                                    color: '#ffffff',
                                    background: (selectedGenderForMockup === 'custom' && (!customPrompt || customPrompt.trim().length === 0))
                                        ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                                        : 'linear-gradient(135deg, #41eb5c 0%, #2dd44a 100%)',
                                    boxShadow: (selectedGenderForMockup === 'custom' && (!customPrompt || customPrompt.trim().length === 0))
                                        ? 'none'
                                        : '0 4px 16px rgba(65, 235, 92, 0.3)',
                                    transition: 'all 0.2s',
                                    minWidth: '140px',
                                    opacity: (selectedGenderForMockup === 'custom' && (!customPrompt || customPrompt.trim().length === 0)) ? 0.6 : 1,
                                }}
                                onMouseEnter={(e) => {
                                    if (!(selectedGenderForMockup === 'custom' && (!customPrompt || customPrompt.trim().length === 0))) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(65, 235, 92, 0.4)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!(selectedGenderForMockup === 'custom' && (!customPrompt || customPrompt.trim().length === 0))) {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(65, 235, 92, 0.3)';
                                    }
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
                <div className={styles.puPopupOverlay} onClick={() => !mockupLoading && closeMockupModal()}>
                    <div className={styles.puPopup} onClick={(event) => event.stopPropagation()}>
                        <button className={styles.puPopupClose} type="button" onClick={closeMockupModal} disabled={mockupLoading}>
                            ×
                        </button>
                        <h2 className={styles.puPopupTitle}>Choisissez une maquette</h2>
                        {mockupLoading ? (
                            <div className={styles.puLoading}>
                                <div className={styles.puSpinner} />
                                <p>Génération des maquettes en cours...</p>
                                <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                                    Cela peut prendre quelques instants
                                </p>
                            </div>
                        ) : generatedMockups.length > 0 ? (
                            <div className={styles.puAiGrid}>
                                {generatedMockups.map((url, index) => (
                                    <button key={index} type="button" className={styles.puAiImageCard} onClick={() => handleSelectMockup(url)}>
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

