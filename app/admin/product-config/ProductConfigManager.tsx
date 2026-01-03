'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAlert } from '@/components/AlertContext';
import Image from 'next/image';
import * as fabric from 'fabric';
// @ts-ignore - react-color types
import { SketchPicker, ColorResult } from 'react-color';

type ProductType = {
    id: string;
    name: string;
    slug: string;
    image: string;
    backImage: string | null;
    basePrice: number;
    displayOrder: number;
    isActive: boolean;
    printAreaRatioFront?: number;
    printAreaRatioBack?: number;
    printAreaFront?: string | null;
    printAreaBack?: string | null;
    availableColorIds?: string[];
    qualities?: ProductTypeQuality[];
};

type ProductTypeQuality = {
    id: string;
    name: string;
    price: number;
    displayOrder: number;
    isDefault: boolean;
    isActive: boolean;
};

type ProductColor = {
    id: string;
    name: string;
    hex: string;
    filter: string | null;
    displayOrder: number;
    isActive: boolean;
};

export default function ProductConfigManager() {
    const { showAlert } = useAlert();
    
    const [productTypes, setProductTypes] = useState<ProductType[]>([]);
    const [colors, setColors] = useState<ProductColor[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Form states
    const [formData, setFormData] = useState<Partial<ProductType>>({});
    const [qualities, setQualities] = useState<ProductTypeQuality[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [newColorName, setNewColorName] = useState('');
    const [newColorHex, setNewColorHex] = useState('#000000');
    
    // Image upload states
    const [frontImageFile, setFrontImageFile] = useState<File | null>(null);
    const [backImageFile, setBackImageFile] = useState<File | null>(null);
    const [frontImagePreview, setFrontImagePreview] = useState<string | null>(null);
    const [backImagePreview, setBackImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);


    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [typesRes, colorsRes] = await Promise.all([
                fetch('/api/admin/product-types'),
                fetch('/api/admin/product-colors'),
            ]);

            const typesData = await typesRes.json();
            const colorsData = await colorsRes.json();

            // Parse availableColorIds from JSON string and convert R2 keys to URLs
            const parsedTypes = await Promise.all((typesData.productTypes || []).map(async (pt: any) => {
                let imageUrl = pt.image;
                let backImageUrl = pt.backImage;
                
                // If image is R2 key (not starting with http or /), get public URL via API
                if (pt.image && !pt.image.startsWith('http') && !pt.image.startsWith('/')) {
                    try {
                        const urlRes = await fetch('/api/admin/get-r2-url', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ key: pt.image }),
                        });
                        if (urlRes.ok) {
                            const urlData = await urlRes.json();
                            imageUrl = urlData.url;
                        }
                    } catch (e) {
                        console.error('Error getting R2 URL for front image:', e);
                        // Fallback to direct R2 URL
                        imageUrl = `https://pub-a54043a6fb8443aaa3cf47aa98675227.r2.dev/${pt.image}`;
                    }
                }
                
                if (pt.backImage && !pt.backImage.startsWith('http') && !pt.backImage.startsWith('/')) {
                    try {
                        const urlRes = await fetch('/api/admin/get-r2-url', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ key: pt.backImage }),
                        });
                        if (urlRes.ok) {
                            const urlData = await urlRes.json();
                            backImageUrl = urlData.url;
                        }
                    } catch (e) {
                        console.error('Error getting R2 URL for back image:', e);
                        // Fallback to direct R2 URL
                        backImageUrl = `https://pub-a54043a6fb8443aaa3cf47aa98675227.r2.dev/${pt.backImage}`;
                    }
                }

                return {
                    ...pt,
                    image: imageUrl,
                    backImage: backImageUrl,
                    availableColorIds: pt.availableColorIds ? JSON.parse(pt.availableColorIds) : [],
                    printAreaFront: pt.printAreaFront ? JSON.parse(pt.printAreaFront) : null,
                    printAreaBack: pt.printAreaBack ? JSON.parse(pt.printAreaBack) : null,
                };
            }));
            
            setProductTypes(parsedTypes);
            setColors(colorsData.colors || []);
        } catch (error) {
            console.error('Error loading data:', error);
            showAlert('Erreur lors du chargement des données', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (item: ProductType) => {
        setEditingId(item.id);
        
        // Load image URLs (already converted in loadData)
        const frontUrl = item.image;
        const backUrl = item.backImage;

        setFormData({
            ...item,
            printAreaRatioFront: item.printAreaRatioFront ?? 0.8,
            printAreaRatioBack: item.printAreaRatioBack ?? 0.8,
        });
        setSelectedColors(item.availableColorIds || []);
        setFrontImagePreview(frontUrl);
        setBackImagePreview(backUrl);
        
        // Load qualities for this product type
        try {
            const qualitiesRes = await fetch(`/api/admin/product-types/${item.id}/qualities`);
            const qualitiesData = await qualitiesRes.json();
            setQualities(qualitiesData.qualities || []);
        } catch (error) {
            console.error('Error loading qualities:', error);
            setQualities([]);
        }
        
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingId(null);
        setFormData({
            name: '',
            slug: '',
            image: '',
            backImage: null,
            basePrice: 20,
            displayOrder: productTypes.length,
            isActive: true,
            printAreaRatioFront: 0.8,
            printAreaRatioBack: 0.8,
        });
        setSelectedColors([]);
        setQualities([{ 
            id: `new-${Date.now()}`, 
            name: 'Normal', 
            price: 0, 
            displayOrder: 0, 
            isDefault: true, 
            isActive: true 
        }]);
        setFrontImagePreview(null);
        setBackImagePreview(null);
        setFrontImageFile(null);
        setBackImageFile(null);
        setShowModal(true);
    };


    // Handle file upload
    const handleFileUpload = async (file: File, type: 'front' | 'back'): Promise<string | null> => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/admin/upload-image', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            
            if (type === 'front') {
                setFormData(prev => ({ ...prev, image: data.key }));
                setFrontImagePreview(data.url);
                setFrontImageFile(null);
            } else {
                setFormData(prev => ({ ...prev, backImage: data.key }));
                setBackImagePreview(data.url);
                setBackImageFile(null);
            }

            showAlert('Image uploadée avec succès', 'success');
            return data.key;
        } catch (error) {
            console.error('Error uploading image:', error);
            showAlert('Erreur lors de l\'upload', 'error');
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    // Handle drag and drop
    const handleDragOver = (e: React.DragEvent, type: 'front' | 'back') => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: React.DragEvent, type: 'front' | 'back') => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            // Set preview immediately
            const reader = new FileReader();
            reader.onload = () => {
                if (type === 'front') {
                    setFrontImagePreview(reader.result as string);
                    setFrontImageFile(file);
                } else {
                    setBackImagePreview(reader.result as string);
                    setBackImageFile(file);
                }
            };
            reader.readAsDataURL(file);
            
            // Auto-upload the file after a small delay to ensure preview is set
            setTimeout(async () => {
                await handleFileUpload(file, type);
            }, 100);
        } else {
            showAlert('Veuillez déposer une image valide', 'warning');
        }
    };

    // Add quality
    const addQuality = () => {
        setQualities([...qualities, {
            id: `new-${Date.now()}`,
            name: '',
            price: 0,
            displayOrder: qualities.length,
            isDefault: false,
            isActive: true,
        }]);
    };

    // Remove quality
    const removeQuality = (id: string) => {
        setQualities(qualities.filter(q => q.id !== id));
    };

    // Update quality
    const updateQuality = (id: string, field: keyof ProductTypeQuality, value: any) => {
        setQualities(qualities.map(q => {
            if (q.id === id) {
                // If setting as default, unset others
                if (field === 'isDefault' && value) {
                    return { ...q, [field]: value };
                }
                return { ...q, [field]: value };
            }
            // Unset default if another is being set as default
            if (field === 'isDefault' && value) {
                return { ...q, isDefault: false };
            }
            return q;
        }));
    };


    // Handle save
    const handleSave = async () => {
        try {
            // Upload images if new files selected
            if (frontImageFile) {
                await handleFileUpload(frontImageFile, 'front');
            }
            if (backImageFile) {
                await handleFileUpload(backImageFile, 'back');
            }

            // Upload images first if new files selected
            let finalImage = formData.image;
            let finalBackImage = formData.backImage;

            if (frontImageFile) {
                const uploadedKey = await handleFileUpload(frontImageFile, 'front');
                if (uploadedKey) {
                    finalImage = uploadedKey;
                } else {
                    throw new Error('Échec de l\'upload de l\'image front');
                }
            }

            if (backImageFile) {
                const uploadedKey = await handleFileUpload(backImageFile, 'back');
                if (uploadedKey) {
                    finalBackImage = uploadedKey;
                }
            }

            if (!finalImage) {
                throw new Error('Image front est requise');
            }

            // Save product type
            const url = editingId
                ? `/api/admin/product-types/${editingId}`
                : '/api/admin/product-types';

            const saveData = {
                ...formData,
                image: finalImage,
                backImage: finalBackImage,
                availableColorIds: selectedColors,
                printAreaFront: formData.printAreaFront || null,
                printAreaBack: formData.printAreaBack || null,
            };

            const response = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(saveData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erreur lors de la sauvegarde');
            }

            const result = await response.json();
            const productTypeId = result.productType?.id || editingId;

            // Save qualities
            if (productTypeId && qualities.length > 0) {
                // Ensure at least one default quality
                const hasDefault = qualities.some(q => q.isDefault);
                if (!hasDefault && qualities.length > 0) {
                    qualities[0].isDefault = true;
                }

                for (const quality of qualities) {
                    if (!quality.name) continue; // Skip empty qualities
                    
                    const qualityUrl = quality.id.startsWith('new')
                        ? `/api/admin/product-types/${productTypeId}/qualities`
                        : `/api/admin/product-types/${productTypeId}/qualities/${quality.id}`;
                    
                    await fetch(qualityUrl, {
                        method: quality.id.startsWith('new') ? 'POST' : 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: quality.name,
                            price: quality.price,
                            displayOrder: quality.displayOrder,
                            isDefault: quality.isDefault,
                            isActive: quality.isActive,
                        }),
                    });
                }
            }

            showAlert('Enregistré avec succès', 'success');
            setShowModal(false);
            loadData();
        } catch (error: any) {
            showAlert(error.message || 'Erreur lors de la sauvegarde', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce type de produit ?')) return;

        try {
            const response = await fetch(`/api/admin/product-types/${id}`, { method: 'DELETE' });

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression');
            }

            showAlert('Supprimé avec succès', 'success');
            loadData();
        } catch (error) {
            showAlert('Erreur lors de la suppression', 'error');
        }
    };

    const toggleColor = (colorId: string) => {
        if (selectedColors.includes(colorId)) {
            setSelectedColors(selectedColors.filter(id => id !== colorId));
        } else {
            setSelectedColors([...selectedColors, colorId]);
        }
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '400px',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <div className="pu-spinner" style={{ width: '50px', height: '50px', borderWidth: '4px' }} />
                <p style={{ color: '#666', fontSize: '16px' }}>Chargement...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '0' }}>
            {/* Header - same as before */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px',
                flexWrap: 'wrap',
                gap: '16px',
            }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#0d1c23', margin: 0, marginBottom: '8px' }}>
                        Configuration des Produits
                    </h1>
                    <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
                        Gérez les types de produits, leurs zones de design et leurs couleurs disponibles
                    </p>
                </div>
                    <button
                    onClick={handleAdd}
                        style={{
                            padding: '12px 24px',
                        background: 'linear-gradient(135deg, #41eb5c 0%, #2dd44a 100%)',
                        color: 'white',
                            border: 'none',
                        borderRadius: '12px',
                            cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '14px',
                        boxShadow: '0 4px 16px rgba(65, 235, 92, 0.3)',
                    }}
                >
                    + Ajouter un Produit
                    </button>
            </div>

            {/* Product Types Grid - same as before but simplified */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '24px',
            }}>
                {productTypes.map((type) => (
                    <div
                        key={type.id}
                                style={{
                            background: '#ffffff',
                            borderRadius: '16px',
                            border: '2px solid #e5e7eb',
                            padding: '24px',
                                    cursor: 'pointer',
                            transition: 'all 0.3s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#41eb5c';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(65, 235, 92, 0.15)';
                            e.currentTarget.style.transform = 'translateY(-4px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        onClick={() => handleEdit(type)}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                                                background: type.isActive ? '#d1fae5' : '#fee2e2',
                                                color: type.isActive ? '#065f46' : '#991b1b',
                                                fontSize: '12px',
                            fontWeight: 600,
                                            }}>
                                                {type.isActive ? 'Actif' : 'Inactif'}
                    </div>

                                            <div style={{
                            width: '100%',
                            aspectRatio: '4/5',
                            background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '16px',
                            overflow: 'hidden',
                            border: '2px solid #e5e7eb',
                            position: 'relative',
                        }}>
                            {type.image ? (
                                <Image
                                    src={type.image}
                                    alt={type.name}
                                    width={200}
                                    height={250}
                                    style={{ objectFit: 'contain' }}
                                />
                            ) : (
                                <div style={{ color: '#9ca3af', fontSize: '14px' }}>Aucune image</div>
                            )}
                        </div>

                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: 700,
                            color: '#0d1c23',
                            margin: '0 0 8px 0',
                        }}>
                            {type.name}
                        </h3>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            marginBottom: '12px',
                        }}>
                            <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 600 }}>
                                {type.basePrice}DT
                                            </span>
                    </div>

                        {type.availableColorIds && Array.isArray(type.availableColorIds) && type.availableColorIds.length > 0 && (
                        <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginTop: '12px',
                            }}>
                                <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600 }}>
                                    {type.availableColorIds.length} couleur{type.availableColorIds.length > 1 ? 's' : ''}
                                </span>
                            </div>
                        )}
                            </div>
                ))}
                            </div>

            {/* Modal - Complete rewrite with all new features */}
            {showModal && (
                <ProductEditModal
                    formData={formData}
                    setFormData={setFormData}
                    selectedColors={selectedColors}
                    setSelectedColors={setSelectedColors}
                    toggleColor={toggleColor}
                    colors={colors}
                    setColors={setColors}
                    qualities={qualities}
                    setQualities={setQualities}
                    addQuality={addQuality}
                    removeQuality={removeQuality}
                    updateQuality={updateQuality}
                    frontImagePreview={frontImagePreview}
                    backImagePreview={backImagePreview}
                    setFrontImagePreview={setFrontImagePreview}
                    setBackImagePreview={setBackImagePreview}
                    frontImageFile={frontImageFile}
                    backImageFile={backImageFile}
                    setFrontImageFile={setFrontImageFile}
                    setBackImageFile={setBackImageFile}
                    handleFileUpload={handleFileUpload}
                    handleDragOver={handleDragOver}
                    handleDrop={handleDrop}
                    isUploading={isUploading}
                    showColorPicker={showColorPicker}
                    setShowColorPicker={setShowColorPicker}
                    newColorName={newColorName}
                    setNewColorName={setNewColorName}
                    newColorHex={newColorHex}
                    setNewColorHex={setNewColorHex}
                    showAlert={showAlert}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                    editingId={editingId}
                />
            )}
            </div>
    );
}

// Separate modal component for better organization
function ProductEditModal({
    formData,
    setFormData,
    selectedColors,
    setSelectedColors,
    toggleColor,
    colors,
    setColors,
    qualities,
    setQualities,
    addQuality,
    removeQuality,
    updateQuality,
    frontImagePreview,
    backImagePreview,
    setFrontImagePreview,
    setBackImagePreview,
    frontImageFile,
    backImageFile,
    setFrontImageFile,
    setBackImageFile,
    handleFileUpload,
    handleDragOver,
    handleDrop,
    isUploading,
    showColorPicker,
    setShowColorPicker,
    newColorName,
    setNewColorName,
    newColorHex,
    setNewColorHex,
    showAlert,
    onClose,
    onSave,
    editingId,
}: any) {
    const frontCanvasRef = useRef<HTMLCanvasElement>(null);
    const backCanvasRef = useRef<HTMLCanvasElement>(null);
    const frontFabricCanvas = useRef<fabric.Canvas | null>(null);
    const backFabricCanvas = useRef<fabric.Canvas | null>(null);

    // Initialize canvases when images are available
    useEffect(() => {
        if (frontImagePreview && frontCanvasRef.current && !frontFabricCanvas.current) {
            const existingArea = formData.printAreaFront ? JSON.parse(formData.printAreaFront) : null;
            const canvas = initPrintableAreaCanvas(frontCanvasRef.current, frontImagePreview, 'front', existingArea);
            frontFabricCanvas.current = canvas || null;
        }
    }, [frontImagePreview]);

    useEffect(() => {
        if (backImagePreview && backCanvasRef.current && !backFabricCanvas.current) {
            const existingArea = formData.printAreaBack ? JSON.parse(formData.printAreaBack) : null;
            const canvas = initPrintableAreaCanvas(backCanvasRef.current, backImagePreview, 'back', existingArea);
            backFabricCanvas.current = canvas || null;
        }
    }, [backImagePreview]);

    // Cleanup canvases on unmount
    useEffect(() => {
        return () => {
            if (frontFabricCanvas.current) {
                frontFabricCanvas.current.dispose();
                frontFabricCanvas.current = null;
            }
            if (backFabricCanvas.current) {
                backFabricCanvas.current.dispose();
                backFabricCanvas.current = null;
            }
        };
    }, []);

    const initPrintableAreaCanvas = useCallback((
        canvasElement: HTMLCanvasElement,
        imageUrl: string,
        side: 'front' | 'back',
        existingArea?: { x: number; y: number; width: number; height: number } | null
    ) => {
        if (!canvasElement) return;

        // Dispose existing canvas if any
        if (side === 'front' && frontFabricCanvas.current) {
            frontFabricCanvas.current.dispose();
        } else if (side === 'back' && backFabricCanvas.current) {
            backFabricCanvas.current.dispose();
        }

        // Create fabric canvas
        const canvas = new fabric.Canvas(canvasElement, {
            width: 400,
            height: 500,
            backgroundColor: '#f9fafb',
        });

        // Load product image as background
        fabric.FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' }).then((img) => {
            const scale = Math.min(
                (canvas.getWidth() * 0.88) / (img.width || 1),
                (canvas.getHeight() * 0.88) / (img.height || 1)
            );

            img.set({
                left: canvas.getWidth() / 2,
                top: canvas.getHeight() / 2,
                originX: 'center',
                originY: 'center',
                scaleX: scale,
                scaleY: scale,
                selectable: false,
                evented: false,
            });

            canvas.backgroundImage = img;

            // Create or use existing printable area rectangle
            let printX: number, printY: number, printW: number, printH: number;

            if (existingArea && existingArea.width && existingArea.height) {
                // Use existing area
                printX = existingArea.x;
                printY = existingArea.y;
                printW = existingArea.width;
                printH = existingArea.height;
            } else {
                // Create default centered rectangle (80% of image size)
                const imgWidth = (img.width || 400) * scale;
                const imgHeight = (img.height || 500) * scale;
                printW = imgWidth * 0.8;
                printH = imgHeight * 0.8;
                printX = (canvas.getWidth() - printW) / 2;
                printY = (canvas.getHeight() - printH) / 2;
            }

            // Create printable area rectangle
            const printRect = new fabric.Rect({
                left: printX,
                top: printY,
                width: printW,
                height: printH,
                fill: 'rgba(65, 235, 92, 0.2)',
                stroke: '#41eb5c',
                strokeWidth: 3,
                strokeDashArray: [10, 5],
                cornerColor: '#41eb5c',
                cornerSize: 12,
                transparentCorners: false,
                cornerStyle: 'circle',
                borderColor: '#2dd44a',
                borderScaleFactor: 2,
                lockRotation: true,
                hasRotatingPoint: false,
            });

            canvas.add(printRect);
            canvas.setActiveObject(printRect);

            // Update formData whenever rectangle is modified
            const updatePrintArea = () => {
                const rect = canvas.getActiveObject() as fabric.Rect;
                if (!rect) return;

                const area = {
                    x: rect.left || 0,
                    y: rect.top || 0,
                    width: (rect.width || 0) * (rect.scaleX || 1),
                    height: (rect.height || 0) * (rect.scaleY || 1),
                };

                setFormData((prev: any) => ({
                    ...prev,
                    [side === 'front' ? 'printAreaFront' : 'printAreaBack']: JSON.stringify(area)
                }));
            };

            canvas.on('object:modified', updatePrintArea);
            canvas.on('object:scaling', updatePrintArea);
            canvas.on('object:moving', updatePrintArea);

            // Save initial state
            updatePrintArea();

            canvas.renderAll();
        });

        return canvas;
    }, [setFormData]);
    return (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
            padding: '20px',
        }} onClick={onClose}>
                    <div style={{
                        background: 'white',
                        padding: '32px',
                borderRadius: '20px',
                maxWidth: '1200px',
                width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    }} onClick={(e) => e.stopPropagation()}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                }}>
                    <h3 style={{ fontSize: '28px', fontWeight: 700, color: '#0d1c23', margin: 0 }}>
                        {editingId ? 'Modifier le Produit' : 'Ajouter un Produit'}
                        </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '32px',
                            color: '#9ca3af',
                            cursor: 'pointer',
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Basic Info */}
                                <div>
                        <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Informations de Base</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                                    Nom du Produit *
                                </label>
                                    <input
                                        type="text"
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                    }}
                                    />
                                </div>
                                <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                                    Slug *
                                </label>
                                    <input
                                        type="text"
                                        value={formData.slug || ''}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                    }}
                                    />
                                </div>
                                </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                                <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                                    Prix de Base (DT) *
                                </label>
                                    <input
                                        type="number"
                                        value={formData.basePrice || ''}
                                    onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                    }}
                                    />
                                </div>
                                <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                                    Ordre d'Affichage
                                </label>
                                    <input
                                        type="number"
                                        value={formData.displayOrder || 0}
                                        onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                    }}
                                    />
                                </div>
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive !== false}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        />
                                <span style={{ fontWeight: 600, fontSize: '14px' }}>Produit Actif</span>
                                    </label>
                                </div>
                            </div>

                    {/* Image Upload with Drag and Drop */}
                                <div>
                        <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Images du Produit</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            {/* Front Image */}
                                <div>
                                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, fontSize: '14px' }}>
                                    Image Front *
                                </label>
                                <div
                                    onDragOver={(e) => handleDragOver(e, 'front')}
                                    onDrop={(e) => handleDrop(e, 'front')}
                                    onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = 'image/*';
                                        input.onchange = async (e: any) => {
                                            const file = e.target.files[0];
                                            if (file && file.type.startsWith('image/')) {
                                                // Set preview immediately
                                                setFrontImageFile(file);
                                                const reader = new FileReader();
                                                reader.onload = () => setFrontImagePreview(reader.result as string);
                                                reader.readAsDataURL(file);
                                                
                                                // Auto-upload after preview is set
                                                setTimeout(async () => {
                                                    await handleFileUpload(file, 'front');
                                                }, 100);
                                            } else {
                                                showAlert('Veuillez sélectionner une image valide', 'warning');
                                            }
                                        };
                                        input.click();
                                    }}
                                    style={{
                                        width: '100%',
                                        aspectRatio: '4/5',
                                        border: '2px dashed #e5e7eb',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        background: frontImagePreview ? 'transparent' : '#f9fafb',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!frontImagePreview) {
                                            e.currentTarget.style.borderColor = '#41eb5c';
                                            e.currentTarget.style.background = '#f0fdf4';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!frontImagePreview) {
                                            e.currentTarget.style.borderColor = '#e5e7eb';
                                            e.currentTarget.style.background = '#f9fafb';
                                        }
                                    }}
                                >
                                    {isUploading && !frontImagePreview ? (
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '12px',
                                            width: '100%',
                                            height: '100%',
                                        }}>
                                            <div className="pu-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
                                            <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>Upload en cours...</p>
                                        </div>
                                    ) : frontImagePreview ? (
                                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                            <img
                                                src={frontImagePreview}
                                                alt="Front preview"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain',
                                                    borderRadius: '10px',
                                                }}
                                            />
                                            {isUploading && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '12px',
                                                    right: '12px',
                                                    padding: '8px 12px',
                                                    background: 'rgba(0,0,0,0.7)',
                                                    color: 'white',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                }}>
                                                    Upload...
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#9ca3af', marginBottom: '12px' }}>
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="17 8 12 3 7 8" />
                                                <line x1="12" y1="3" x2="12" y2="15" />
                                            </svg>
                                            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0, textAlign: 'center' }}>
                                                Glissez-déposez une image<br />ou cliquez pour sélectionner
                                            </p>
                                        </>
                                    )}
                                </div>
                                </div>

                            {/* Back Image */}
                                <div>
                                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, fontSize: '14px' }}>
                                    Image Back
                                    </label>
                                <div
                                    onDragOver={(e) => handleDragOver(e, 'back')}
                                    onDrop={(e) => handleDrop(e, 'back')}
                                    onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = 'image/*';
                                        input.onchange = async (e: any) => {
                                            const file = e.target.files[0];
                                            if (file && file.type.startsWith('image/')) {
                                                // Set preview immediately
                                                setBackImageFile(file);
                                                const reader = new FileReader();
                                                reader.onload = () => setBackImagePreview(reader.result as string);
                                                reader.readAsDataURL(file);
                                                
                                                // Auto-upload after preview is set
                                                setTimeout(async () => {
                                                    await handleFileUpload(file, 'back');
                                                }, 100);
                                            } else {
                                                showAlert('Veuillez sélectionner une image valide', 'warning');
                                            }
                                        };
                                        input.click();
                                    }}
                                    style={{
                                        width: '100%',
                                        aspectRatio: '4/5',
                                        border: '2px dashed #e5e7eb',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        background: backImagePreview ? 'transparent' : '#f9fafb',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!backImagePreview) {
                                            e.currentTarget.style.borderColor = '#41eb5c';
                                            e.currentTarget.style.background = '#f0fdf4';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!backImagePreview) {
                                            e.currentTarget.style.borderColor = '#e5e7eb';
                                            e.currentTarget.style.background = '#f9fafb';
                                        }
                                    }}
                                >
                                    {isUploading && !backImagePreview ? (
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '12px',
                                            width: '100%',
                                            height: '100%',
                                        }}>
                                            <div className="pu-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
                                            <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>Upload en cours...</p>
                                        </div>
                                    ) : backImagePreview ? (
                                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                            <img
                                                src={backImagePreview}
                                                alt="Back preview"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain',
                                                    borderRadius: '10px',
                                                }}
                                            />
                                            {isUploading && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '12px',
                                                    right: '12px',
                                                    padding: '8px 12px',
                                                    background: 'rgba(0,0,0,0.7)',
                                                    color: 'white',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                }}>
                                                    Upload...
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#9ca3af', marginBottom: '12px' }}>
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="17 8 12 3 7 8" />
                                                <line x1="12" y1="3" x2="12" y2="15" />
                                            </svg>
                                            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0, textAlign: 'center' }}>
                                                Glissez-déposez une image<br />ou cliquez pour sélectionner
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Design Area - Drawable Rectangle */}
                    <div style={{ marginTop: '32px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#0d1c23' }}>
                                Zone de Design (Printable Area)
                            </h4>
                            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>
                                Définissez la zone imprimable en dessinant un rectangle sur chaque côté du produit. Cette zone sera utilisée dans l'éditeur de design pour guider les utilisateurs.
                            </p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            {/* Front Design Area */}
                            <div style={{
                                padding: '20px',
                                background: '#ffffff',
                                borderRadius: '16px',
                                border: '2px solid #e5e7eb',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontWeight: 600, fontSize: '15px', color: '#0d1c23' }}>
                                        Zone Recto (Front)
                                    </label>
                                </div>
                                {frontImagePreview ? (
                                    <div style={{
                                        width: '100%',
                                        aspectRatio: '4/5',
                                        borderRadius: '12px',
                                        border: '2px solid #e5e7eb',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        background: '#f9fafb',
                                    }}>
                                        <canvas ref={frontCanvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '12px',
                                            left: '12px',
                                            right: '12px',
                                            padding: '8px 12px',
                                            background: 'rgba(0, 0, 0, 0.7)',
                                            color: 'white',
                                            borderRadius: '8px',
                                            fontSize: '11px',
                                            textAlign: 'center',
                                            pointerEvents: 'none',
                                        }}>
                                            <strong>💡 Tip:</strong> Glissez et redimensionnez la zone verte pour définir l'aire imprimable
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{
                                        width: '100%',
                                        aspectRatio: '4/5',
                                        background: '#f9fafb',
                                        borderRadius: '12px',
                                        border: '2px dashed #d1d5db',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#9ca3af',
                                        fontSize: '14px',
                                        gap: '8px',
                                    }}>
                                        <span style={{ fontSize: '32px' }}>📷</span>
                                        <p style={{ margin: 0, textAlign: 'center', padding: '0 20px' }}>
                                            Téléchargez une image recto d'abord
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Back Design Area */}
                            <div style={{
                                padding: '20px',
                                background: '#ffffff',
                                borderRadius: '16px',
                                border: '2px solid #e5e7eb',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontWeight: 600, fontSize: '15px', color: '#0d1c23' }}>
                                        Zone Verso (Back)
                                    </label>
                                </div>
                                {backImagePreview ? (
                                    <div style={{
                                        width: '100%',
                                        aspectRatio: '4/5',
                                        borderRadius: '12px',
                                        border: '2px solid #e5e7eb',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        background: '#f9fafb',
                                    }}>
                                        <canvas ref={backCanvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '12px',
                                            left: '12px',
                                            right: '12px',
                                            padding: '8px 12px',
                                            background: 'rgba(0, 0, 0, 0.7)',
                                            color: 'white',
                                            borderRadius: '8px',
                                            fontSize: '11px',
                                            textAlign: 'center',
                                            pointerEvents: 'none',
                                        }}>
                                            <strong>💡 Tip:</strong> Glissez et redimensionnez la zone verte pour définir l'aire imprimable
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{
                                        width: '100%',
                                        aspectRatio: '4/5',
                                        background: '#f9fafb',
                                        borderRadius: '12px',
                                        border: '2px dashed #d1d5db',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#9ca3af',
                                        fontSize: '14px',
                                        gap: '8px',
                                    }}>
                                        <span style={{ fontSize: '32px' }}>📷</span>
                                        <p style={{ margin: 0, textAlign: 'center', padding: '0 20px' }}>
                                            Téléchargez une image verso d'abord
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Colors per Product */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                                Couleurs Disponibles pour ce Produit
                            </h4>
                            <button
                                onClick={() => {
                                    setShowColorPicker(true);
                                    setNewColorName('');
                                    setNewColorHex('#000000');
                                }}
                                style={{
                                    padding: '8px 16px',
                                    background: '#41eb5c',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '12px',
                                }}
                            >
                                + Ajouter Couleur
                            </button>
                        </div>
                        
                        {colors.length === 0 ? (
                            <div style={{
                                padding: '40px',
                                textAlign: 'center',
                                background: '#f9fafb',
                                borderRadius: '12px',
                                border: '2px dashed #e5e7eb',
                            }}>
                                <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 16px 0' }}>
                                    Aucune couleur disponible. Créez votre première couleur !
                                </p>
                                <button
                                    onClick={() => {
                                        setShowColorPicker(true);
                                        setNewColorName('');
                                        setNewColorHex('#000000');
                                    }}
                                    style={{
                                        padding: '10px 20px',
                                        background: '#41eb5c',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        fontSize: '14px',
                                    }}
                                >
                                    Créer une Couleur
                                </button>
                            </div>
                        ) : (
                            <>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                    gap: '12px',
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    padding: '12px',
                                    background: '#f9fafb',
                                    borderRadius: '12px',
                                }}>
                                    {colors.map((color: ProductColor) => {
                                    const isSelected = selectedColors.includes(color.id);
                                    return (
                                        <button
                                            key={color.id}
                                            type="button"
                                            onClick={() => toggleColor(color.id)}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '10px',
                                                border: isSelected ? '2px solid #41eb5c' : '2px solid #e5e7eb',
                                                background: isSelected ? '#f0fdf4' : '#ffffff',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '8px',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) {
                                                    e.currentTarget.style.borderColor = '#41eb5c';
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) {
                                                    e.currentTarget.style.borderColor = '#e5e7eb';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }
                                            }}
                                        >
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '10px',
                                                background: color.hex,
                                                border: '1px solid #e5e7eb',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            }} />
                                            <span style={{ fontSize: '12px', fontWeight: 600 }}>
                                                {color.name}
                                            </span>
                                            {isSelected && (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#41eb5c" strokeWidth="3">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            )}
                                        </button>
                                    );
                                    })}
                                </div>
                                {colors.filter((c: ProductColor) => !c.isActive).length > 0 && (
                                    <div style={{
                                        marginTop: '12px',
                                        padding: '12px',
                                        background: '#fef3c7',
                                        borderRadius: '8px',
                                        border: '1px solid #fbbf24',
                                    }}>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#92400e', fontWeight: 600 }}>
                                            💡 {colors.filter((c: ProductColor) => !c.isActive).length} couleur(s) inactive(s) - elles n'apparaîtront pas dans la sélection
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Color Picker Modal */}
                    {showColorPicker && (
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2000,
                            padding: '20px',
                        }} onClick={() => setShowColorPicker(false)}>
                            <div style={{
                                background: 'white',
                                padding: '24px',
                                borderRadius: '16px',
                                maxWidth: '400px',
                                width: '100%',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                            }} onClick={(e) => e.stopPropagation()}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '20px',
                                }}>
                                    <h4 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                                        Créer une Nouvelle Couleur
                                    </h4>
                                    <button
                                        onClick={() => setShowColorPicker(false)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            fontSize: '28px',
                                            color: '#9ca3af',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                                            Nom de la Couleur *
                                        </label>
                                        <input
                                            type="text"
                                            value={newColorName}
                                            onChange={(e) => setNewColorName(e.target.value)}
                                            placeholder="Ex: Rouge, Bleu, Blanc..."
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '10px',
                                                fontSize: '14px',
                                            }}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                                            Couleur
                                        </label>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                        }}>
                                            <div style={{
                                                width: '60px',
                                                height: '60px',
                                                borderRadius: '12px',
                                                background: newColorHex,
                                                border: '2px solid #e5e7eb',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                            }} />
                                            <input
                                                type="text"
                                                value={newColorHex}
                                                onChange={(e) => {
                                                    const hex = e.target.value;
                                                    if (/^#[0-9A-Fa-f]{0,6}$/.test(hex) || hex === '') {
                                                        setNewColorHex(hex);
                                                    }
                                                }}
                                                placeholder="#000000"
                                                style={{
                                                    flex: 1,
                                                    padding: '12px',
                                                    border: '2px solid #e5e7eb',
                                                    borderRadius: '10px',
                                                    fontSize: '14px',
                                                    fontFamily: 'monospace',
                                                }}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <SketchPicker
                                            color={newColorHex}
                                            onChange={(color: any) => setNewColorHex(color.hex)}
                                            presetColors={['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A']}
                                        />
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => setShowColorPicker(false)}
                                            style={{
                                                padding: '10px 20px',
                                                background: '#f3f4f6',
                                                color: '#0d1c23',
                                                border: 'none',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                fontWeight: 600,
                                                fontSize: '14px',
                                            }}
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (!newColorName.trim() || !newColorHex) {
                                                    showAlert('Veuillez remplir le nom et la couleur', 'warning');
                                                    return;
                                                }
                                                
                                                try {
                                                    const response = await fetch('/api/admin/product-colors', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            name: newColorName,
                                                            hex: newColorHex,
                                                            displayOrder: colors.length,
                                                            isActive: true,
                                                        }),
                                                    });
                                                    
                                                    if (!response.ok) {
                                                        const error = await response.json();
                                                        throw new Error(error.error || 'Erreur');
                                                    }
                                                    
                                                    const data = await response.json();
                                                    
                                                    // Add to colors list and select it
                                                    setColors([...colors, data.color]);
                                                    setSelectedColors([...selectedColors, data.color.id]);
                                                    
                                                    setShowColorPicker(false);
                                                    setNewColorName('');
                                                    setNewColorHex('#000000');
                                                    showAlert('Couleur créée avec succès', 'success');
                                                } catch (error: any) {
                                                    showAlert(error.message || 'Erreur lors de la création', 'error');
                                                }
                                            }}
                                            style={{
                                                padding: '10px 20px',
                                                background: 'linear-gradient(135deg, #41eb5c 0%, #2dd44a 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                fontWeight: 700,
                                                fontSize: '14px',
                                                boxShadow: '0 4px 16px rgba(65, 235, 92, 0.3)',
                                            }}
                                        >
                                            Créer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Qualities per Product */}
                                <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                                Qualités pour ce Produit
                            </h4>
                            <button
                                onClick={addQuality}
                                style={{
                                    padding: '8px 16px',
                                    background: '#41eb5c',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '12px',
                                }}
                            >
                                + Ajouter Qualité
                            </button>
                                </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {qualities.map((quality: ProductTypeQuality) => (
                                <div
                                    key={quality.id}
                                    style={{
                                        padding: '16px',
                                        background: '#f9fafb',
                                        borderRadius: '12px',
                                        border: quality.isDefault ? '2px solid #41eb5c' : '2px solid #e5e7eb',
                                    }}
                                >
                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto auto', gap: '12px', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            placeholder="Nom (ex: Normal, Premium)"
                                            value={quality.name}
                                            onChange={(e) => updateQuality(quality.id, 'name', e.target.value)}
                                            style={{
                                                padding: '10px',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                            }}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Prix additionnel"
                                            value={quality.price}
                                            onChange={(e) => updateQuality(quality.id, 'price', parseFloat(e.target.value) || 0)}
                                            style={{
                                                padding: '10px',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                            }}
                                        />
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={quality.isDefault}
                                                onChange={(e) => updateQuality(quality.id, 'isDefault', e.target.checked)}
                                            />
                                            <span style={{ fontSize: '12px', fontWeight: 600 }}>Par défaut</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={quality.isActive}
                                                onChange={(e) => updateQuality(quality.id, 'isActive', e.target.checked)}
                                            />
                                            <span style={{ fontSize: '12px' }}>Actif</span>
                                        </label>
                                        {qualities.length > 1 && (
                                            <button
                                                onClick={() => removeQuality(quality.id)}
                                                style={{
                                                    padding: '8px',
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                ×
                                            </button>
                                )}
                            </div>
                                </div>
                            ))}
                        </div>
                        {qualities.length === 0 && (
                            <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                                Aucune qualité. Cliquez sur "Ajouter Qualité" pour en créer une.
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                            <button
                            onClick={onClose}
                                style={{
                                padding: '12px 24px',
                                background: '#f3f4f6',
                                    color: '#0d1c23',
                                    border: 'none',
                                borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                fontSize: '14px',
                                }}
                            >
                                Annuler
                            </button>
                            <button
                            onClick={onSave}
                                style={{
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, #41eb5c 0%, #2dd44a 100%)',
                                    color: 'white',
                                    border: 'none',
                                borderRadius: '10px',
                                    cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '14px',
                                boxShadow: '0 4px 16px rgba(65, 235, 92, 0.3)',
                                }}
                            >
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
        </div>
    );
}
