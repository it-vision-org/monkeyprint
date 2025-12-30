'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import * as fabric from 'fabric';
// @ts-ignore - react-color types may not be available
import { SketchPicker, ColorResult } from 'react-color';
import styles from './DesignEditor.module.css';

type DesignEditorProps = {
    productType: string;
    productColor: string;
    initialDesign?: string | null;
    onDesignChange?: (designData: string) => void;
    onSave?: (designData: string) => void;
};

const FONTS = [
    'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
    'Georgia', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
];

const PRESET_COLORS = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000',
];

// Mobile detection helper
const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Helper to serialize canvas without background
const serializeCanvas = (canvas: fabric.Canvas): string | null => {
    try {
        const userObjects = canvas.getObjects().filter(obj => !(obj as any).isProductBackground);
        const objectsData = userObjects.map(obj => obj.toObject());
        return JSON.stringify({
            version: (fabric as any).version || '5.3.0',
            objects: objectsData,
        });
    } catch (error) {
        console.error('Error serializing canvas:', error);
        return null;
    }
};

// Helper to load design into canvas
const loadDesignIntoCanvas = async (
    canvas: fabric.Canvas,
    designData: string | null,
    updateBackground: () => void
): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            canvas.clear();
            
            if (!designData) {
                updateBackground();
                canvas.renderAll();
                resolve();
                return;
            }

            const parsed = JSON.parse(designData);
            const objects = parsed.objects || [];

            if (!Array.isArray(objects) || objects.length === 0) {
                updateBackground();
                canvas.renderAll();
                resolve();
                return;
            }

            const canvasJSON = {
                version: (fabric as any).version || '5.3.0',
                objects: objects,
            };

            canvas.loadFromJSON(JSON.stringify(canvasJSON), () => {
                // Remove any backgrounds that might have been loaded
                const loadedBackgrounds = canvas.getObjects().filter(obj => (obj as any).isProductBackground);
                loadedBackgrounds.forEach(bg => canvas.remove(bg));
                
                updateBackground();
                canvas.renderAll();
                resolve();
            }).catch((error: any) => {
                console.error('Failed to load design:', error);
                updateBackground();
                canvas.renderAll();
                reject(error);
            });
        } catch (error) {
            console.error('Failed to parse design:', error);
            updateBackground();
            canvas.renderAll();
            reject(error);
        }
    });
};

export default function DesignEditor({
    productType,
    productColor,
    initialDesign,
    onDesignChange,
    onSave,
}: DesignEditorProps) {
    // Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const fabricPreviewCanvasRef = useRef<fabric.Canvas | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const productImageRef = useRef<HTMLImageElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // History management
    const historyRef = useRef<string[]>([]);
    const historyIndexRef = useRef<number>(-1);
    const maxHistorySize = 50;
    
    // Design storage - SIMPLIFIED: Use state instead of refs for better reactivity
    const [frontDesign, setFrontDesign] = useState<string | null>(null);
    const [backDesign, setBackDesign] = useState<string | null>(null);
    
    // State flags
    const isSwitchingViewRef = useRef<boolean>(false);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const debouncedDesignChangeRef = useRef<NodeJS.Timeout | null>(null);
    
    // State
    const [activeTool, setActiveTool] = useState<'select' | 'text' | 'image' | 'draw'>('select');
    const [selectedElement, setSelectedElement] = useState<fabric.Object | null>(null);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [currentColor, setCurrentColor] = useState('#000000');
    const [showPropertyPanel, setShowPropertyPanel] = useState(false);
    const [currentView, setCurrentView] = useState<'front' | 'back'>('front');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isCanvasReady, setIsCanvasReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSwitchingView, setIsSwitchingView] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [canUndo, setCanUndo] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // Text properties
    const [textContent, setTextContent] = useState('Your text here');
    const [fontFamily, setFontFamily] = useState('Arial');
    const [fontSize, setFontSize] = useState(32);
    const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    
    // Draw properties
    const [brushSize, setBrushSize] = useState(10);
    
    // Image properties
    const [imageOpacity, setImageOpacity] = useState(100);

    // Memoized mobile state
    const isMobileDevice = useMemo(() => isMobile(), []);

    // Get user objects (exclude background)
    const getUserObjects = useCallback(() => {
        if (!fabricCanvasRef.current) return [];
        return fabricCanvasRef.current.getObjects().filter(obj => !(obj as any).isProductBackground);
    }, []);

    // History management
    const saveHistory = useCallback(() => {
        if (!fabricCanvasRef.current) return;
        
        try {
            const designData = serializeCanvas(fabricCanvasRef.current);
            if (!designData) return;
            
            historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
            historyRef.current.push(designData);
            historyIndexRef.current++;
            
            if (historyRef.current.length > maxHistorySize) {
                historyRef.current.shift();
                historyIndexRef.current--;
            }
            
            setCanUndo(historyIndexRef.current > 0);
            setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
        } catch (error) {
            console.error('Error saving history:', error);
        }
    }, []);

    const undo = useCallback(async () => {
        if (!fabricCanvasRef.current || historyIndexRef.current <= 0) return;
        
        historyIndexRef.current--;
        const designData = historyRef.current[historyIndexRef.current];
        
        if (designData) {
            await loadDesignIntoCanvas(
                fabricCanvasRef.current,
                designData,
                updateProductBackground
            );
            setCanUndo(historyIndexRef.current > 0);
            setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const redo = useCallback(async () => {
        if (!fabricCanvasRef.current || historyIndexRef.current >= historyRef.current.length - 1) return;
        
        historyIndexRef.current++;
        const designData = historyRef.current[historyIndexRef.current];
        
        if (designData) {
            await loadDesignIntoCanvas(
                fabricCanvasRef.current,
                designData,
                updateProductBackground
            );
            setCanUndo(historyIndexRef.current > 0);
            setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Update product background
    const updateProductBackground = useCallback(() => {
        if (!fabricCanvasRef.current || !productImageRef.current) return;
        
        const canvas = fabricCanvasRef.current;
        const img = productImageRef.current;
        
        // Remove existing backgrounds
        const existingBackgrounds = canvas.getObjects().filter(obj => (obj as any).isProductBackground);
        existingBackgrounds.forEach(bg => canvas.remove(bg));
        
        // Add product background
        const fabricImg = new fabric.Image(img, {
            crossOrigin: 'anonymous',
        });
        
        const canvasWidth = canvas.width || 400;
        const canvasHeight = canvas.height || 500;
        const scale = Math.min(
            (canvasWidth * 0.95) / (fabricImg.width || 1),
            (canvasHeight * 0.95) / (fabricImg.height || 1)
        );
        
        fabricImg.set({
            left: canvasWidth / 2,
            top: canvasHeight / 2,
            originX: 'center',
            originY: 'center',
            scaleX: scale,
            scaleY: scale,
            selectable: false,
            evented: false,
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            lockSkewingX: true,
            lockSkewingY: true,
        });
        
        // Apply color filter
        if (productColor && productColor !== '#FFFFFF' && productColor !== 'white') {
            try {
                const colorFilter = new fabric.filters.BlendColor({
                    color: productColor,
                    mode: 'multiply',
                    alpha: 0.6
                });
                fabricImg.filters = [colorFilter];
                fabricImg.applyFilters();
            } catch (error) {
                console.warn('Could not apply color filter:', error);
            }
        }
        
        (fabricImg as any).isProductBackground = true;
        canvas.add(fabricImg);
        canvas.sendObjectToBack(fabricImg);
        canvas.renderAll();
    }, [productColor]);

    // Update preview canvas - SIMPLIFIED
    const updatePreviewCanvas = useCallback(() => {
        if (!fabricPreviewCanvasRef.current || !productImageRef.current || !fabricCanvasRef.current) return;
        
        const previewCanvas = fabricPreviewCanvasRef.current;
        const mainCanvas = fabricCanvasRef.current;
        const otherView = currentView === 'front' ? 'back' : 'front';
        const designToLoad = otherView === 'front' ? frontDesign : backDesign;
        
        previewCanvas.clear();
        
        const mainWidth = mainCanvas.width || 500;
        const mainHeight = mainCanvas.height || 625;
        const previewWidth = previewCanvas.width || 200;
        const previewHeight = previewCanvas.height || 250;
        const scaleX = previewWidth / mainWidth;
        const scaleY = previewHeight / mainHeight;
        const scale = Math.min(scaleX, scaleY);
        
        const addBackground = (): void => {
            const img = productImageRef.current;
            if (!img) return;
            
            const fabricImg = new fabric.Image(img, {
                crossOrigin: 'anonymous',
            });
            
            const bgScale = Math.min(
                (previewWidth * 0.95) / (fabricImg.width || 1),
                (previewHeight * 0.95) / (fabricImg.height || 1)
            );
            
            fabricImg.set({
                left: previewWidth / 2,
                top: previewHeight / 2,
                originX: 'center',
                originY: 'center',
                scaleX: bgScale,
                scaleY: bgScale,
                selectable: false,
                evented: false,
                lockMovementX: true,
                lockMovementY: true,
                lockRotation: true,
                lockScalingX: true,
                lockScalingY: true,
                lockSkewingX: true,
                lockSkewingY: true,
            });
            
            if (productColor && productColor !== '#FFFFFF' && productColor !== 'white') {
                try {
                    const colorFilter = new fabric.filters.BlendColor({
                        color: productColor,
                        mode: 'multiply',
                        alpha: 0.6
                    });
                    fabricImg.filters = [colorFilter];
                    fabricImg.applyFilters();
                } catch (error) {
                    console.warn('Could not apply color filter to preview:', error);
                }
            }
            
            (fabricImg as any).isProductBackground = true;
            previewCanvas.add(fabricImg);
            previewCanvas.sendObjectToBack(fabricImg);
        };
        
        if (designToLoad) {
            try {
                const parsed = JSON.parse(designToLoad);
                const objects = parsed.objects || [];
                
                if (Array.isArray(objects) && objects.length > 0) {
                    const canvasJSON = {
                        version: (fabric as any).version || '5.3.0',
                        objects: objects,
                    };
                    
                    previewCanvas.loadFromJSON(JSON.stringify(canvasJSON), () => {
                        const loadedBackgrounds = previewCanvas.getObjects().filter(obj => (obj as any).isProductBackground);
                        loadedBackgrounds.forEach(bg => previewCanvas.remove(bg));
                        
                        const allObjects = previewCanvas.getObjects();
                        allObjects.forEach(obj => {
                            const objLeft = obj.left || 0;
                            const objTop = obj.top || 0;
                            const mainCenterX = mainWidth / 2;
                            const mainCenterY = mainHeight / 2;
                            const previewCenterX = previewWidth / 2;
                            const previewCenterY = previewHeight / 2;
                            
                            const relX = objLeft - mainCenterX;
                            const relY = objTop - mainCenterY;
                            
                            obj.set({
                                left: previewCenterX + (relX * scale),
                                top: previewCenterY + (relY * scale),
                                scaleX: (obj.scaleX || 1) * scale,
                                scaleY: (obj.scaleY || 1) * scale,
                                selectable: false,
                                evented: false,
                            });
                            
                            if (obj.type === 'i-text' || obj.type === 'textbox' || obj.type === 'text') {
                                const textObj = obj as fabric.IText;
                                const currentFontSize = textObj.fontSize || 32;
                                textObj.set('fontSize', currentFontSize * scale);
                            }
                            
                            if (obj.type === 'path') {
                                const pathObj = obj as fabric.Path;
                                const currentStrokeWidth = pathObj.strokeWidth || 1;
                                pathObj.set('strokeWidth', currentStrokeWidth * scale);
                            }
                            
                            obj.setCoords();
                        });
                        
                        addBackground();
                        previewCanvas.renderAll();
                    }).catch((error: any) => {
                        console.error('Failed to load preview design:', error);
                        addBackground();
                        previewCanvas.renderAll();
                    });
                } else {
                    addBackground();
                    previewCanvas.renderAll();
                }
            } catch (e) {
                console.error('Failed to parse preview design:', e);
                addBackground();
                previewCanvas.renderAll();
            }
        } else {
            addBackground();
            previewCanvas.renderAll();
        }
    }, [currentView, productColor, frontDesign, backDesign]);

    // Save current design to state
    const saveCurrentDesign = useCallback(() => {
        if (!fabricCanvasRef.current || !isCanvasReady) return null;
        
        const designData = serializeCanvas(fabricCanvasRef.current);
        if (!designData) return null;
        
        if (currentView === 'front') {
            setFrontDesign(designData);
        } else {
            setBackDesign(designData);
        }
        
        return designData;
    }, [currentView, isCanvasReady]);

    // Debounced design change
    const handleDesignChange = useCallback(() => {
        if (isSwitchingViewRef.current) return;
        
        if (debouncedDesignChangeRef.current) {
            clearTimeout(debouncedDesignChangeRef.current);
        }
        
        debouncedDesignChangeRef.current = setTimeout(() => {
            if (isSwitchingViewRef.current) return;
            
            const designData = saveCurrentDesign();
            if (!designData) return;
            
            if (onDesignChange) {
                const combined = JSON.stringify({
                    front: currentView === 'front' ? designData : frontDesign,
                    back: currentView === 'back' ? designData : backDesign,
                });
                onDesignChange(combined);
            }
            
            updatePreviewCanvas();
        }, 300);
    }, [onDesignChange, currentView, frontDesign, backDesign, saveCurrentDesign, updatePreviewCanvas]);

    // Get t-shirt bounds
    const getTShirtBounds = useCallback(() => {
        if (!fabricCanvasRef.current) return null;
        
        const canvas = fabricCanvasRef.current;
        const tshirtObj = canvas.getObjects().find(obj => (obj as any).isProductBackground);
        
        if (!tshirtObj) return null;
        
        const bounds = tshirtObj.getBoundingRect();
        const width80 = bounds.width * 0.8;
        const height80 = bounds.height * 0.8;
        const left80 = bounds.left + (bounds.width - width80) / 2;
        const top80 = bounds.top + (bounds.height - height80) / 2;
        
        return {
            left: left80,
            top: top80,
            width: width80,
            height: height80,
            right: left80 + width80,
            bottom: top80 + height80,
        };
    }, []);

    // Constrain object
    const constrainObject = useCallback((obj: fabric.Object) => {
        if ((obj as any).isProductBackground) return;
        
        const bounds = getTShirtBounds();
        if (!bounds) return;
        
        obj.setCoords();
        const objBounds = obj.getBoundingRect();
        
        let scaleChanged = false;
        if (objBounds.width > bounds.width) {
            const ratio = bounds.width / objBounds.width;
            const currentScaleX = obj.scaleX || 1;
            obj.set('scaleX', currentScaleX * ratio);
            scaleChanged = true;
        }
        if (objBounds.height > bounds.height) {
            const ratio = bounds.height / objBounds.height;
            const currentScaleY = obj.scaleY || 1;
            obj.set('scaleY', currentScaleY * ratio);
            scaleChanged = true;
        }
        
        if (scaleChanged) {
            obj.setCoords();
        }
        
        obj.setCoords();
        const finalBounds = obj.getBoundingRect();
        const currentLeft = obj.left || 0;
        const currentTop = obj.top || 0;
        let newLeft = currentLeft;
        let newTop = currentTop;
        let positionChanged = false;
        
        const offsetX = finalBounds.left - currentLeft;
        const offsetY = finalBounds.top - currentTop;
        
        if (finalBounds.left < bounds.left) {
            newLeft = bounds.left - offsetX;
            positionChanged = true;
        }
        if (finalBounds.top < bounds.top) {
            newTop = bounds.top - offsetY;
            positionChanged = true;
        }
        if (finalBounds.left + finalBounds.width > bounds.right) {
            newLeft = bounds.right - finalBounds.width - offsetX;
            positionChanged = true;
        }
        if (finalBounds.top + finalBounds.height > bounds.bottom) {
            newTop = bounds.bottom - finalBounds.height - offsetY;
            positionChanged = true;
        }
        
        if (positionChanged || scaleChanged) {
            obj.set({ 
                left: newLeft, 
                top: newTop 
            });
            obj.setCoords();
        }
    }, [getTShirtBounds]);

    // Load product image
    useEffect(() => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const productImagePath = productType.includes('hoodie') ? '/Hoodie.png' : '/T-Shirt.png';
        
        img.onload = () => {
            productImageRef.current = img;
            if (fabricCanvasRef.current && isCanvasReady) {
                updateProductBackground();
            }
        };
        
        img.onerror = () => {
            console.error('Failed to load product image:', productImagePath);
        };
        
        img.src = productImagePath;
    }, [productType, updateProductBackground, isCanvasReady]);

    // COMPLETELY REWRITTEN: Switch view function - SIMPLIFIED AND FIXED
    const switchView = useCallback(async (view: 'front' | 'back', event?: React.MouseEvent) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        // Guard clauses
        if (!fabricCanvasRef.current || view === currentView || !isCanvasReady) {
            return;
        }
        
        if (isSwitchingViewRef.current) {
            console.warn('View switch already in progress');
            return;
        }
        
        // Set switching flag immediately
        isSwitchingViewRef.current = true;
        setIsSwitchingView(true);
        
        try {
            // Step 1: Save current design BEFORE switching
            const currentDesignData = saveCurrentDesign();
            
            // Step 2: Update state with saved design
            if (currentDesignData) {
                if (currentView === 'front') {
                    setFrontDesign(currentDesignData);
                } else {
                    setBackDesign(currentDesignData);
                }
            }
            
            // Step 3: Clear selection and UI state
            setSelectedElement(null);
            setShowPropertyPanel(false);
            setActiveTool('select');
            setShowColorPicker(false);
            
            // Step 4: Update view state
            setCurrentView(view);
            
            // Step 5: Load the design for the new view
            const designToLoad = view === 'front' ? frontDesign : backDesign;
            await loadDesignIntoCanvas(
                fabricCanvasRef.current,
                designToLoad,
                updateProductBackground
            );
            
            // Step 6: Update preview canvas
            updatePreviewCanvas();
            
        } catch (error) {
            console.error('Error switching view:', error);
        } finally {
            // Always reset the switching flag
            isSwitchingViewRef.current = false;
            setIsSwitchingView(false);
        }
    }, [currentView, frontDesign, backDesign, isCanvasReady, saveCurrentDesign, updateProductBackground, updatePreviewCanvas]);

    // Initialize preview canvas
    useEffect(() => {
        if (isSwitchingViewRef.current) return;
        
        if (fabricPreviewCanvasRef.current) {
            try {
                fabricPreviewCanvasRef.current.off();
                fabricPreviewCanvasRef.current.dispose();
            } catch (e) {
                console.warn('Error disposing existing preview canvas:', e);
            }
            fabricPreviewCanvasRef.current = null;
        }
        
        if (!previewCanvasRef.current || !isCanvasReady) return;

        const previewCanvas = new fabric.Canvas(previewCanvasRef.current, {
            width: 200,
            height: 250,
            backgroundColor: 'transparent',
            preserveObjectStacking: true,
            selection: false,
        });

        fabricPreviewCanvasRef.current = previewCanvas;
        previewCanvas.selection = false;
        
        if (productImageRef.current && isCanvasReady) {
            setTimeout(() => {
                updatePreviewCanvas();
            }, 100);
        }
        
        return () => {
            if (isSwitchingViewRef.current) return;
            
            if (fabricPreviewCanvasRef.current) {
                try {
                    fabricPreviewCanvasRef.current.off();
                    fabricPreviewCanvasRef.current.dispose();
                } catch (e) {
                    console.warn('Error disposing preview canvas:', e);
                }
                fabricPreviewCanvasRef.current = null;
            }
        };
    }, [isCanvasReady, updatePreviewCanvas]);

    // Initialize main canvas
    useEffect(() => {
        setIsLoading(true);
        setIsCanvasReady(false);
        
        if (fabricCanvasRef.current) {
            try {
                fabricCanvasRef.current.off();
                fabricCanvasRef.current.dispose();
            } catch (e) {
                console.warn('Error disposing existing canvas:', e);
            }
            fabricCanvasRef.current = null;
        }
        
        if (!canvasRef.current) {
            setIsLoading(false);
            setIsCanvasReady(false);
            return;
        }

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: 500,
            height: 625,
            backgroundColor: 'transparent',
            preserveObjectStacking: true,
            selection: true,
        });

        fabricCanvasRef.current = canvas;

        // Initialize free drawing brush
        if (!canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        }
        if (canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush.width = brushSize;
            canvas.freeDrawingBrush.color = currentColor;
        }

        // Event handlers
        canvas.on('path:created', (e) => {
            if (e.path) {
                (e.path as any).isProductBackground = false;
                saveHistory();
                handleDesignChange();
            }
        });

        canvas.on('selection:created', (e) => {
            const obj = e.selected?.[0];
            if (obj && !(obj as any).isProductBackground) {
                setSelectedElement(obj);
                setShowPropertyPanel(true);
                updatePropertiesFromObject(obj);
            } else if (obj && (obj as any).isProductBackground) {
                canvas.discardActiveObject();
                canvas.renderAll();
            }
        });

        canvas.on('selection:updated', (e) => {
            const obj = e.selected?.[0];
            if (obj && !(obj as any).isProductBackground) {
                setSelectedElement(obj);
                updatePropertiesFromObject(obj);
            } else if (obj && (obj as any).isProductBackground) {
                canvas.discardActiveObject();
                canvas.renderAll();
            }
        });

        canvas.on('selection:cleared', () => {
            setSelectedElement(null);
            setShowPropertyPanel(false);
        });
        
        canvas.on('mouse:down', (e) => {
            if (e.target && (e.target as any).isProductBackground) {
                e.e.preventDefault();
                e.e.stopPropagation();
            }
        });

        canvas.on('object:modified', () => {
            saveHistory();
            handleDesignChange();
        });

        canvas.on('object:added', (e) => {
            if (e.target && !(e.target as any).isProductBackground) {
                handleDesignChange();
            }
        });

        canvas.on('object:removed', (e) => {
            if (e.target && !(e.target as any).isProductBackground) {
                saveHistory();
                handleDesignChange();
            }
        });

        // Handle resize with ResizeObserver for better performance
        const handleResize = () => {
            if (!fabricCanvasRef.current || !canvasRef.current) return;
            
            const container = canvasRef.current.parentElement;
            if (!container) return;
            
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            const aspectRatio = 4 / 5;
            
            let newWidth = Math.min(containerWidth * 0.95, isMobileDevice ? 400 : 700);
            let newHeight = newWidth / aspectRatio;
            
            if (newHeight > containerHeight * 0.95) {
                newHeight = containerHeight * 0.95;
                newWidth = newHeight * aspectRatio;
            }
            
            fabricCanvasRef.current.setDimensions({
                width: Math.max(300, newWidth),
                height: Math.max(375, newHeight),
            });
            
            updateProductBackground();
            fabricCanvasRef.current.renderAll();
        };

        // Use ResizeObserver for better performance
        if (containerRef.current) {
            resizeObserverRef.current = new ResizeObserver(() => {
                setTimeout(handleResize, 100);
            });
            resizeObserverRef.current.observe(containerRef.current);
        }

        // Initial setup
        setTimeout(() => {
            if (!fabricCanvasRef.current) {
                setIsLoading(false);
                setIsCanvasReady(false);
                return;
            }
            handleResize();
            setIsCanvasReady(true);
            setIsLoading(false);
            
            setTimeout(() => {
                historyRef.current = [JSON.stringify({ version: (fabric as any).version || '5.3.0', objects: [] })];
                historyIndexRef.current = 0;
                setCanUndo(false);
                setCanRedo(false);
            }, 300);
        }, 100);

        return () => {
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
                resizeObserverRef.current = null;
            }
            
            if (debouncedDesignChangeRef.current) {
                clearTimeout(debouncedDesignChangeRef.current);
                debouncedDesignChangeRef.current = null;
            }
            
            if (fabricCanvasRef.current) {
                try {
                    fabricCanvasRef.current.off();
                    fabricCanvasRef.current.dispose();
                } catch (e) {
                    console.warn('Error disposing canvas:', e);
                }
                fabricCanvasRef.current = null;
            }
            
            if (fabricPreviewCanvasRef.current) {
                try {
                    fabricPreviewCanvasRef.current.off();
                    fabricPreviewCanvasRef.current.dispose();
                } catch (e) {
                    console.warn('Error disposing preview canvas:', e);
                }
                fabricPreviewCanvasRef.current = null;
            }
            
            isSwitchingViewRef.current = false;
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Set up constraint event handlers
    useEffect(() => {
        if (!fabricCanvasRef.current || !isCanvasReady) return;

        const canvas = fabricCanvasRef.current;

        const handleObjectMoving = (e: any) => {
            if (e.target && !(e.target as any).isProductBackground && e.target.type !== 'path') {
                constrainObject(e.target);
                canvas.renderAll();
            }
        };

        const handleObjectScaling = (e: any) => {
            if (e.target && !(e.target as any).isProductBackground && e.target.type !== 'path') {
                constrainObject(e.target);
                canvas.renderAll();
            }
        };

        const handleObjectModified = (e: any) => {
            if (e.target && !(e.target as any).isProductBackground && e.target.type !== 'path') {
                constrainObject(e.target);
            }
        };

        const handleObjectAdded = (e: any) => {
            if (e.target && !(e.target as any).isProductBackground && e.target.type !== 'path') {
                constrainObject(e.target);
                canvas.renderAll();
            }
        };

        canvas.on('object:moving', handleObjectMoving);
        canvas.on('object:scaling', handleObjectScaling);
        canvas.on('object:modified', handleObjectModified);
        canvas.on('object:added', handleObjectAdded);

        return () => {
            canvas.off('object:moving', handleObjectMoving);
            canvas.off('object:scaling', handleObjectScaling);
            canvas.off('object:modified', handleObjectModified);
            canvas.off('object:added', handleObjectAdded);
        };
    }, [isCanvasReady, constrainObject]);

    // Update properties from selected object
    const updatePropertiesFromObject = useCallback((obj: fabric.Object) => {
        if (obj.type === 'i-text' || obj.type === 'textbox' || obj.type === 'text') {
            const textObj = obj as fabric.IText;
            setTextContent(textObj.text || '');
            setFontFamily(textObj.fontFamily || 'Arial');
            setFontSize(textObj.fontSize || 32);
            setTextAlign((textObj.textAlign as 'left' | 'center' | 'right') || 'left');
            setIsBold(textObj.fontWeight === 'bold');
            setIsItalic(textObj.fontStyle === 'italic');
            setIsUnderline(!!textObj.underline);
            const fillColor = typeof textObj.fill === 'string' ? textObj.fill : '#000000';
            setCurrentColor(fillColor);
        } else if (obj.type === 'image') {
            setImageOpacity((obj.opacity || 1) * 100);
        }
    }, []);

    // Handle tool changes
    useEffect(() => {
        if (!fabricCanvasRef.current || !isCanvasReady) return;

        const canvas = fabricCanvasRef.current;

        if (activeTool === 'draw') {
            canvas.isDrawingMode = true;
            canvas.selection = false;
            canvas.discardActiveObject();
            setSelectedElement(null);
            setShowPropertyPanel(false);
            
            if (canvas.freeDrawingBrush) {
                canvas.freeDrawingBrush.width = brushSize;
                canvas.freeDrawingBrush.color = currentColor;
                canvas.freeDrawingBrush.limitedToCanvasSize = false;
            }
        } else {
            canvas.isDrawingMode = false;
            canvas.selection = true;
        }
    }, [activeTool, brushSize, currentColor, isCanvasReady]);

    // Add text
    const handleAddText = useCallback(() => {
        if (!fabricCanvasRef.current || !isCanvasReady) return;

        const canvas = fabricCanvasRef.current;
        const text = new fabric.IText(textContent, {
            left: (canvas.width || 400) / 2,
            top: (canvas.height || 500) / 2,
            fontFamily: fontFamily,
            fontSize: fontSize,
            fill: currentColor,
            originX: 'center',
            originY: 'center',
        });

        canvas.add(text);
        canvas.setActiveObject(text);
        setSelectedElement(text);
        setShowPropertyPanel(true);
        saveHistory();
        handleDesignChange();
    }, [textContent, fontFamily, fontSize, currentColor, handleDesignChange, isCanvasReady, saveHistory]);

    // Handle image upload
    const handleImageUpload = useCallback((file: File) => {
        if (!fabricCanvasRef.current || !isCanvasReady) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const imgUrl = e.target?.result as string;
            if (!imgUrl) return;
            
            fabric.Image.fromURL(imgUrl, { crossOrigin: 'anonymous' })
                .then((img: fabric.Image) => {
                    if (!fabricCanvasRef.current) return;
                    
                    const canvas = fabricCanvasRef.current;
                    const maxWidth = (canvas.width || 400) * 0.6;
                    const maxHeight = (canvas.height || 500) * 0.6;
                    
                    const scale = Math.min(
                        maxWidth / (img.width || 1),
                        maxHeight / (img.height || 1),
                        1
                    );

                    img.set({
                        left: (canvas.width || 400) / 2,
                        top: (canvas.height || 500) / 2,
                        originX: 'center',
                        originY: 'center',
                        scaleX: scale,
                        scaleY: scale,
                        opacity: imageOpacity / 100,
                    });

                    canvas.add(img);
                    canvas.setActiveObject(img);
                    setSelectedElement(img);
                    setShowPropertyPanel(true);
                    saveHistory();
                    handleDesignChange();
                })
                .catch((error: any) => {
                    console.error('Failed to load image:', error);
                    alert('Failed to load image. Please try another file.');
                });
        };
        reader.onerror = () => {
            console.error('Failed to read image file');
            alert('Failed to read image file');
        };
        reader.readAsDataURL(file);
    }, [imageOpacity, handleDesignChange, isCanvasReady, saveHistory]);

    // Handle file input
    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [handleImageUpload]);

    // Handle drag and drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
        }
    }, [handleImageUpload]);

    // Delete selected
    const handleDelete = useCallback(() => {
        if (!fabricCanvasRef.current || !selectedElement) return;
        fabricCanvasRef.current.remove(selectedElement);
        setSelectedElement(null);
        setShowPropertyPanel(false);
        saveHistory();
        handleDesignChange();
    }, [selectedElement, handleDesignChange, saveHistory]);

    // Layer controls
    const bringForward = useCallback(() => {
        if (!fabricCanvasRef.current || !selectedElement) return;
        fabricCanvasRef.current.bringObjectForward(selectedElement);
        fabricCanvasRef.current.renderAll();
        handleDesignChange();
    }, [selectedElement, handleDesignChange]);

    const sendBackward = useCallback(() => {
        if (!fabricCanvasRef.current || !selectedElement) return;
        
        if ((selectedElement as any).isProductBackground) return;
        
        const background = fabricCanvasRef.current.getObjects().find(obj => (obj as any).isProductBackground);
        if (!background) return;
        
        const backgroundIndex = fabricCanvasRef.current.getObjects().indexOf(background);
        const selectedIndex = fabricCanvasRef.current.getObjects().indexOf(selectedElement);
        
        if (selectedIndex > backgroundIndex + 1) {
            fabricCanvasRef.current.sendObjectBackwards(selectedElement);
            fabricCanvasRef.current.renderAll();
            handleDesignChange();
        }
    }, [selectedElement, handleDesignChange]);

    // Duplicate object
    const duplicateObject = useCallback(() => {
        if (!fabricCanvasRef.current || !selectedElement) return;
        
        selectedElement.clone().then((cloned: fabric.Object) => {
            if (!fabricCanvasRef.current) return;
            
            cloned.set({
                left: (cloned.left || 0) + 20,
                top: (cloned.top || 0) + 20,
            });
            
            fabricCanvasRef.current.add(cloned);
            fabricCanvasRef.current.setActiveObject(cloned);
            setSelectedElement(cloned);
            saveHistory();
            handleDesignChange();
        });
    }, [selectedElement, handleDesignChange, saveHistory]);

    // Save design
    const handleSave = useCallback(() => {
        if (!fabricCanvasRef.current || !onSave || !isCanvasReady) return;
        
        try {
            const currentDesign = saveCurrentDesign();
            if (!currentDesign) return;
            
            // Update state with current design
            if (currentView === 'front') {
                setFrontDesign(currentDesign);
            } else {
                setBackDesign(currentDesign);
            }
            
            const combinedDesign = JSON.stringify({
                front: currentView === 'front' ? currentDesign : frontDesign,
                back: currentView === 'back' ? currentDesign : backDesign,
            });
            
            onSave(combinedDesign);
            alert('Design saved successfully!');
        } catch (error) {
            console.error('Error saving design:', error);
            alert('Failed to save design');
        }
    }, [onSave, currentView, frontDesign, backDesign, isCanvasReady, saveCurrentDesign]);

    // Handle color change
    const handleColorChange = useCallback((color: ColorResult) => {
        setCurrentColor(color.hex);
        
        if (selectedElement && (selectedElement.type === 'i-text' || selectedElement.type === 'textbox' || selectedElement.type === 'text')) {
            (selectedElement as fabric.IText).set('fill', color.hex);
            fabricCanvasRef.current?.renderAll();
            handleDesignChange();
        }
        
        if (activeTool === 'draw' && fabricCanvasRef.current?.freeDrawingBrush) {
            fabricCanvasRef.current.freeDrawingBrush.color = color.hex;
        }
    }, [selectedElement, handleDesignChange, activeTool]);

    // Update text properties
    const updateTextProperty = useCallback((property: string, value: any) => {
        if (!selectedElement || !fabricCanvasRef.current) return;
        if (selectedElement.type !== 'i-text' && selectedElement.type !== 'textbox' && selectedElement.type !== 'text') return;
        
        const textObj = selectedElement as fabric.IText;
        textObj.set(property as any, value);
        fabricCanvasRef.current.renderAll();
        handleDesignChange();
    }, [selectedElement, handleDesignChange]);

    // Load initial design
    useEffect(() => {
        if (!fabricCanvasRef.current || !isCanvasReady) return;
        if (!initialDesign) return;

        const loadInitialDesign = async () => {
            try {
                const parsed = JSON.parse(initialDesign);
                if (parsed.front || parsed.back) {
                    const frontData = parsed.front || null;
                    const backData = parsed.back || null;
                    
                    setFrontDesign(frontData);
                    setBackDesign(backData);
                    
                    const designToLoad = currentView === 'front' ? frontData : backData;
                    await loadDesignIntoCanvas(
                        fabricCanvasRef.current!,
                        designToLoad,
                        updateProductBackground
                    );
                    
                    setTimeout(() => {
                        if (fabricPreviewCanvasRef.current) {
                            updatePreviewCanvas();
                        }
                    }, 100);
                } else {
                    // Legacy format - treat as front design
                    setFrontDesign(initialDesign);
                    if (currentView === 'front') {
                        await loadDesignIntoCanvas(
                            fabricCanvasRef.current!,
                            initialDesign,
                            updateProductBackground
                        );
                        setTimeout(() => {
                            if (fabricPreviewCanvasRef.current) {
                                updatePreviewCanvas();
                            }
                        }, 100);
                    }
                }
            } catch (e) {
                console.error('Failed to parse initial design:', e);
                updateProductBackground();
                if (fabricCanvasRef.current) {
                    fabricCanvasRef.current.renderAll();
                }
            }
        };

        loadInitialDesign();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCanvasReady]);

    // Update preview when designs change
    useEffect(() => {
        if (isCanvasReady && fabricPreviewCanvasRef.current && productImageRef.current) {
            const timer = setTimeout(() => {
                updatePreviewCanvas();
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [isCanvasReady, frontDesign, backDesign, currentView, updatePreviewCanvas]);

    // Handle fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!(
                document.fullscreenElement ||
                (document as any).webkitFullscreenElement ||
                (document as any).msFullscreenElement
            );
            setIsFullscreen(isCurrentlyFullscreen);
            
            if (fabricCanvasRef.current && canvasRef.current) {
                setTimeout(() => {
                    if (!fabricCanvasRef.current || !canvasRef.current) return;
                    
                    const container = canvasRef.current.parentElement;
                    if (!container) return;
                    
                    const containerWidth = container.clientWidth;
                    const containerHeight = container.clientHeight;
                    const aspectRatio = 4 / 5;
                    
                    let newWidth = Math.min(containerWidth * 0.9, 600);
                    let newHeight = newWidth / aspectRatio;
                    
                    if (newHeight > containerHeight * 0.9) {
                        newHeight = containerHeight * 0.9;
                        newWidth = newHeight * aspectRatio;
                    }
                    
                    fabricCanvasRef.current.setDimensions({
                        width: Math.max(300, newWidth),
                        height: Math.max(375, newHeight),
                    });
                    
                    updateProductBackground();
                    fabricCanvasRef.current.renderAll();
                    updatePreviewCanvas();
                }, 200);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        };
    }, [updateProductBackground, updatePreviewCanvas]);

    // Close color picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (showColorPicker && !target.closest(`.${styles.colorPickerWrapper}`) && !target.closest('.sketch-picker')) {
                setShowColorPicker(false);
            }
        };

        if (showColorPicker) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showColorPicker]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
                return;
            }
            
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedElement) {
                    e.preventDefault();
                    handleDelete();
                }
            }
            
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            }
            
            if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
                e.preventDefault();
                redo();
            }
            
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                duplicateObject();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedElement, handleDelete, undo, redo, duplicateObject]);

    return (
        <div 
            ref={containerRef}
            className={`${styles.designEditor} ${isFullscreen ? styles.fullscreen : ''} ${isMobileDevice ? styles.mobile : ''}`}
        >
            {/* Loading overlay */}
            {isLoading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner}></div>
                    <p>Initializing editor...</p>
                </div>
            )}

            {/* Mobile Menu Toggle */}
            {isMobileDevice && (
                <button
                    type="button"
                    className={styles.mobileMenuToggle}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
            )}

            {/* Header with View Switcher and Fullscreen */}
            <div className={styles.editorHeader}>
                <div className={styles.viewSwitcher}>
                    <button
                        type="button"
                        className={`${styles.viewButton} ${currentView === 'front' ? styles.active : ''} ${isSwitchingView ? styles.switching : ''}`}
                        onClick={(e) => switchView('front', e)}
                        disabled={!isCanvasReady || isSwitchingView}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <line x1="12" y1="3" x2="12" y2="21" />
                        </svg>
                        <span>Front</span>
                    </button>
                    <button
                        type="button"
                        className={`${styles.viewButton} ${currentView === 'back' ? styles.active : ''} ${isSwitchingView ? styles.switching : ''}`}
                        onClick={(e) => switchView('back', e)}
                        disabled={!isCanvasReady || isSwitchingView}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <line x1="12" y1="3" x2="12" y2="21" />
                        </svg>
                        <span>Back</span>
                    </button>
                </div>
                {!isMobileDevice && (
                    <button
                        type="button"
                        className={styles.fullscreenButton}
                        onClick={() => {
                            if (!isFullscreen) {
                                const container = document.querySelector(`.${styles.designEditor}`) as HTMLElement;
                                if (container) {
                                    if (container.requestFullscreen) {
                                        container.requestFullscreen();
                                    } else if ((container as any).webkitRequestFullscreen) {
                                        (container as any).webkitRequestFullscreen();
                                    } else if ((container as any).msRequestFullscreen) {
                                        (container as any).msRequestFullscreen();
                                    }
                                }
                            } else {
                                if (document.exitFullscreen) {
                                    document.exitFullscreen();
                                } else if ((document as any).webkitExitFullscreen) {
                                    (document as any).webkitExitFullscreen();
                                } else if ((document as any).msExitFullscreen) {
                                    (document as any).msExitFullscreen();
                                }
                            }
                        }}
                        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                        {isFullscreen ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                            </svg>
                        )}
                    </button>
                )}
            </div>

            {/* Toolbar - Mobile optimized */}
            <div className={`${styles.toolbar} ${isMobileDevice && mobileMenuOpen ? styles.mobileOpen : ''}`}>
                <div className={styles.toolbarGroup}>
                    <button
                        type="button"
                        className={`${styles.toolButton} ${activeTool === 'select' ? styles.active : ''}`}
                        onClick={() => setActiveTool('select')}
                        aria-label="Select tool"
                        disabled={!isCanvasReady}
                        title="Select"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                        </svg>
                    </button>
                    
                    <button
                        type="button"
                        className={`${styles.toolButton} ${activeTool === 'text' ? styles.active : ''}`}
                        onClick={() => {
                            setActiveTool('text');
                            handleAddText();
                        }}
                        aria-label="Add text"
                        disabled={!isCanvasReady}
                        title="Text"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="4 7 4 4 20 4 20 7" />
                            <line x1="9" y1="20" x2="15" y2="20" />
                            <line x1="12" y1="4" x2="12" y2="20" />
                        </svg>
                    </button>
                    
                    <button
                        type="button"
                        className={`${styles.toolButton} ${activeTool === 'image' ? styles.active : ''}`}
                        onClick={() => {
                            setActiveTool('image');
                            fileInputRef.current?.click();
                        }}
                        aria-label="Add image"
                        disabled={!isCanvasReady}
                        title="Image"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                    </button>
                    
                    <button
                        type="button"
                        className={`${styles.toolButton} ${activeTool === 'draw' ? styles.active : ''}`}
                        onClick={() => setActiveTool('draw')}
                        aria-label="Draw tool"
                        disabled={!isCanvasReady}
                        title="Draw"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 19l7-7 3 3-7 7-3-3z" />
                            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                            <circle cx="11" cy="11" r="2" />
                        </svg>
                    </button>
                </div>

                <div className={styles.toolbarGroup}>
                    <button
                        type="button"
                        className={styles.toolButton}
                        onClick={undo}
                        disabled={!isCanvasReady || !canUndo}
                        aria-label="Undo"
                        title="Undo"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 7v6h6" />
                            <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
                        </svg>
                    </button>
                    
                    <button
                        type="button"
                        className={styles.toolButton}
                        onClick={redo}
                        disabled={!isCanvasReady || !canRedo}
                        aria-label="Redo"
                        title="Redo"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 7v6h-6" />
                            <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" />
                        </svg>
                    </button>
                </div>

                {selectedElement && (
                    <div className={styles.toolbarGroup}>
                        <button
                            type="button"
                            className={styles.toolButton}
                            onClick={duplicateObject}
                            aria-label="Duplicate"
                            title="Duplicate"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                            </svg>
                        </button>
                        
                        <button
                            type="button"
                            className={styles.toolButton}
                            onClick={bringForward}
                            aria-label="Bring forward"
                            title="Bring Forward"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8L22 12L18 16" />
                                <path d="M2 12H22" />
                            </svg>
                        </button>
                        
                        <button
                            type="button"
                            className={styles.toolButton}
                            onClick={sendBackward}
                            aria-label="Send backward"
                            title="Send Backward"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 8L2 12L6 16" />
                                <path d="M22 12H2" />
                            </svg>
                        </button>
                        
                        <button
                            type="button"
                            className={styles.toolButton}
                            onClick={handleDelete}
                            aria-label="Delete"
                            title="Delete"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Canvas Container */}
            <div 
                className={styles.canvasContainer}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div className={styles.productPreview}>
                    <div className={styles.canvasWrapper}>
                        <canvas ref={canvasRef} className={styles.canvas} />
                    </div>
                    {/* Preview of the other side - hidden on mobile */}
                    {!isMobileDevice && (
                        <div className={styles.previewWrapper}>
                            <div className={styles.previewLabel}>
                                {currentView === 'front' ? 'Back Preview' : 'Front Preview'}
                            </div>
                            <canvas ref={previewCanvasRef} className={styles.previewCanvas} />
                        </div>
                    )}
                </div>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                style={{ display: 'none' }}
            />

            {/* Property Panel - Mobile bottom sheet, Desktop sidebar */}
            {showPropertyPanel && selectedElement && (
                <div className={styles.propertyPanel}>
                    <div className={styles.panelHeader}>
                        <h3>
                            {selectedElement.type === 'i-text' || selectedElement.type === 'textbox' || selectedElement.type === 'text' 
                                ? 'Text Properties' 
                                : selectedElement.type === 'image' 
                                ? 'Image Properties' 
                                : 'Object Properties'}
                        </h3>
                        <button
                            type="button"
                            className={styles.closeButton}
                            onClick={() => {
                                setShowPropertyPanel(false);
                                fabricCanvasRef.current?.discardActiveObject();
                                fabricCanvasRef.current?.renderAll();
                            }}
                            aria-label="Close panel"
                        >
                            ×
                        </button>
                    </div>

                    <div className={styles.propertyContent}>
                        {/* Text Properties */}
                        {(selectedElement.type === 'i-text' || selectedElement.type === 'textbox' || selectedElement.type === 'text') && (
                            <>
                                <div className={styles.propertyGroup}>
                                    <label>Text Content</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={textContent}
                                        onChange={(e) => {
                                            setTextContent(e.target.value);
                                            updateTextProperty('text', e.target.value);
                                        }}
                                        placeholder="Enter text"
                                    />
                                </div>

                                <div className={styles.propertyGroup}>
                                    <label>Font Family</label>
                                    <select
                                        className={styles.select}
                                        value={fontFamily}
                                        onChange={(e) => {
                                            setFontFamily(e.target.value);
                                            updateTextProperty('fontFamily', e.target.value);
                                        }}
                                    >
                                        {FONTS.map(font => (
                                            <option key={font} value={font}>{font}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.propertyGroup}>
                                    <label>Font Size: {fontSize}px</label>
                                    <input
                                        type="range"
                                        className={styles.slider}
                                        min="12"
                                        max="120"
                                        value={fontSize}
                                        onChange={(e) => {
                                            const size = parseInt(e.target.value);
                                            setFontSize(size);
                                            updateTextProperty('fontSize', size);
                                        }}
                                    />
                                </div>

                                <div className={styles.propertyGroup}>
                                    <label>Text Align</label>
                                    <div className={styles.buttonRow}>
                                        <button
                                            type="button"
                                            className={`${styles.iconButton} ${textAlign === 'left' ? styles.active : ''}`}
                                            onClick={() => {
                                                setTextAlign('left');
                                                updateTextProperty('textAlign', 'left');
                                            }}
                                            title="Align Left"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="17" y1="10" x2="3" y2="10" />
                                                <line x1="21" y1="6" x2="3" y2="6" />
                                                <line x1="21" y1="14" x2="3" y2="14" />
                                                <line x1="17" y1="18" x2="3" y2="18" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.iconButton} ${textAlign === 'center' ? styles.active : ''}`}
                                            onClick={() => {
                                                setTextAlign('center');
                                                updateTextProperty('textAlign', 'center');
                                            }}
                                            title="Align Center"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="10" x2="6" y2="10" />
                                                <line x1="21" y1="6" x2="3" y2="6" />
                                                <line x1="21" y1="14" x2="3" y2="14" />
                                                <line x1="18" y1="18" x2="6" y2="18" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.iconButton} ${textAlign === 'right' ? styles.active : ''}`}
                                            onClick={() => {
                                                setTextAlign('right');
                                                updateTextProperty('textAlign', 'right');
                                            }}
                                            title="Align Right"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="21" y1="10" x2="7" y2="10" />
                                                <line x1="21" y1="6" x2="3" y2="6" />
                                                <line x1="21" y1="14" x2="3" y2="14" />
                                                <line x1="21" y1="18" x2="7" y2="18" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.propertyGroup}>
                                    <label>Text Style</label>
                                    <div className={styles.buttonRow}>
                                        <button
                                            type="button"
                                            className={`${styles.iconButton} ${isBold ? styles.active : ''}`}
                                            onClick={() => {
                                                const newBold = !isBold;
                                                setIsBold(newBold);
                                                updateTextProperty('fontWeight', newBold ? 'bold' : 'normal');
                                            }}
                                            title="Bold"
                                        >
                                            <strong>B</strong>
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.iconButton} ${isItalic ? styles.active : ''}`}
                                            onClick={() => {
                                                const newItalic = !isItalic;
                                                setIsItalic(newItalic);
                                                updateTextProperty('fontStyle', newItalic ? 'italic' : 'normal');
                                            }}
                                            title="Italic"
                                        >
                                            <em>I</em>
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.iconButton} ${isUnderline ? styles.active : ''}`}
                                            onClick={() => {
                                                const newUnderline = !isUnderline;
                                                setIsUnderline(newUnderline);
                                                updateTextProperty('underline', newUnderline);
                                            }}
                                            title="Underline"
                                        >
                                            <u>U</u>
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.propertyGroup}>
                                    <label>Color</label>
                                    <div className={styles.colorPickerWrapper}>
                                        <button
                                            type="button"
                                            className={styles.colorButton}
                                            style={{ backgroundColor: currentColor }}
                                            onClick={() => setShowColorPicker(!showColorPicker)}
                                        />
                                        {showColorPicker && (
                                            <>
                                                <div
                                                    className={styles.colorPickerCover}
                                                    onClick={() => setShowColorPicker(false)}
                                                />
                                                <div className={styles.colorPickerPopover}>
                                                    <SketchPicker
                                                        color={currentColor}
                                                        onChange={handleColorChange}
                                                        presetColors={PRESET_COLORS}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Image Properties */}
                        {selectedElement.type === 'image' && (
                            <div className={styles.propertyGroup}>
                                <label>Opacity: {imageOpacity}%</label>
                                <input
                                    type="range"
                                    className={styles.slider}
                                    min="0"
                                    max="100"
                                    value={imageOpacity}
                                    onChange={(e) => {
                                        const opacity = parseInt(e.target.value);
                                        setImageOpacity(opacity);
                                        if (selectedElement) {
                                            selectedElement.set('opacity', opacity / 100);
                                            fabricCanvasRef.current?.renderAll();
                                            handleDesignChange();
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Draw Tool Properties */}
            {activeTool === 'draw' && !showPropertyPanel && (
                <div className={styles.propertyPanel}>
                    <div className={styles.panelHeader}>
                        <h3>Draw Settings</h3>
                    </div>
                    <div className={styles.propertyContent}>
                        <div className={styles.propertyGroup}>
                            <label>Brush Size: {brushSize}px</label>
                            <input
                                type="range"
                                className={styles.slider}
                                min="2"
                                max="50"
                                value={brushSize}
                                onChange={(e) => {
                                    const size = parseInt(e.target.value);
                                    setBrushSize(size);
                                    if (fabricCanvasRef.current?.freeDrawingBrush) {
                                        fabricCanvasRef.current.freeDrawingBrush.width = size;
                                    }
                                }}
                            />
                        </div>
                        <div className={styles.propertyGroup}>
                            <label>Color</label>
                            <div className={styles.colorPickerWrapper}>
                                <button
                                    type="button"
                                    className={styles.colorButton}
                                    style={{ backgroundColor: currentColor }}
                                    onClick={() => setShowColorPicker(!showColorPicker)}
                                />
                                {showColorPicker && (
                                    <>
                                        <div
                                            className={styles.colorPickerCover}
                                            onClick={() => setShowColorPicker(false)}
                                        />
                                        <div className={styles.colorPickerPopover}>
                                            <SketchPicker
                                                color={currentColor}
                                                onChange={(color: ColorResult) => {
                                                    setCurrentColor(color.hex);
                                                    if (fabricCanvasRef.current?.freeDrawingBrush) {
                                                        fabricCanvasRef.current.freeDrawingBrush.color = color.hex;
                                                    }
                                                }}
                                                presetColors={PRESET_COLORS}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Button */}
            <button
                type="button"
                className={styles.saveButton}
                onClick={handleSave}
                disabled={!isCanvasReady}
            >
                💾 Save Design
            </button>
        </div>
    );
}
