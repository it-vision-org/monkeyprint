'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as fabric from 'fabric';
import styles from './DesignEditorNew.module.css';

// Detect iOS device
const isIOS = () => {
    if (typeof navigator === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

type Side = 'front' | 'back';
type Tool = 'select' | 'text' | 'image' | 'draw';

type FontConfig = {
    name: string;
    file: string | null;
    system: boolean;
};

type DesignEditorProps = {
    productType: string;
    productColor: string;
    initialDesign?: string | null;
    onDesignChange?: (designData: string) => void;
    printAreaFront?: { x: number; y: number; width: number; height: number } | null;
    printAreaBack?: { x: number; y: number; width: number; height: number } | null;
    // onSave prop removed - auto-save is now automatic
};

type HistoryState = string; // Serialized design for one side

// Simplified color palette - essential colors only
const COLOR_PALETTE = [
    // Black, White, Grays
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    // Reds & Pinks
    '#FF0000', '#FF5252', '#FF8A80', '#E91E63', '#F48FB1', '#FFC0CB',
    // Oranges & Yellows
    '#FF5722', '#FF9800', '#FFC107', '#FFEB3B', '#FFF176',
    // Greens
    '#4CAF50', '#8BC34A', '#CDDC39', '#00E676', '#1DE9B6',
    // Blues & Cyans
    '#2196F3', '#03A9F4', '#00BCD4', '#3F51B5', '#0000FF', '#00FFFF',
    // Purples
    '#9C27B0', '#673AB7', '#E040FB', '#EA80FC',
    // Browns
    '#795548', '#8D6E63', '#A52A2A', '#D7CCC8',
];
const MOVE_STEP = 5;
const MOVE_STEP_SHIFT = 20;
const MAX_HISTORY = 50;
const PRINT_AREA_RATIO = 0.8; // 80% of the t-shirt size
// TODO: This should be configurable from the admin dashboard in the future

// Helper: Get inverse/contrasting color
const getContrastColor = (hexColor: string): string => {
    if (!hexColor) return '#000000';
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Color Picker Component - Simple inline palette (no custom colors)
type ColorPickerProps = {
    currentColor: string;
    onColorChange: (color: string) => void;
};

const ColorPicker = memo(function ColorPicker({ currentColor, onColorChange }: ColorPickerProps) {
    return (
        <div className={styles.colorPickerComponent}>
            {/* Color palette grid */}
            <div className={styles.colorGrid}>
                {COLOR_PALETTE.map((color) => (
                    <button
                        key={color}
                        className={`${styles.colorSwatch} ${currentColor.toLowerCase() === color.toLowerCase() ? styles.active : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => onColorChange(color)}
                        title={color}
                        type="button"
                        aria-label={`Select color ${color}`}
                    />
                ))}
            </div>

            {/* Current color preview */}
            <div className={styles.colorPreview}>
                <div
                    className={styles.colorPreviewSwatch}
                    style={{ backgroundColor: currentColor }}
                />
                <span className={styles.colorPreviewValue}>{currentColor.toUpperCase()}</span>
            </div>
        </div>
    );
});

const DesignEditor = memo(function DesignEditor({ productType, productColor, initialDesign, onDesignChange, printAreaFront, printAreaBack }: DesignEditorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const previewRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mainCanvas = useRef<fabric.Canvas | null>(null);
    const previewCanvas = useRef<fabric.StaticCanvas | null>(null);
    const productImgs = useRef<{ front: HTMLImageElement | null; back: HTMLImageElement | null }>({ front: null, back: null });
    const designsRef = useRef<Record<Side, string | null>>({ front: null, back: null });
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isInitializing = useRef(true);
    const currentSideRef = useRef<Side>('front');
    const clipboardRef = useRef<fabric.Object[] | null>(null);

    // Undo/Redo history (per side)
    const historyRef = useRef<Record<Side, HistoryState[]>>({ front: [], back: [] });
    const historyIndexRef = useRef<Record<Side, number>>({ front: -1, back: -1 });
    const isUndoingRef = useRef(false);
    const printAreaGuideRef = useRef<fabric.Rect | null>(null);
    const clipPathRef = useRef<fabric.Rect | null>(null);

    // Dynamic canvas dimensions
    const [canvasSize, setCanvasSize] = useState({ w: 400, h: 500 });
    const lastSizeRef = useRef({ w: 400, h: 500 });

    const [isLoading, setIsLoading] = useState(true);
    const [ready, setReady] = useState(false);
    const [currentSide, setCurrentSide] = useState<Side>('front');
    const [activeTool, setActiveTool] = useState<Tool>('select');
    const [selected, setSelected] = useState<fabric.Object | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [fonts, setFonts] = useState<FontConfig[]>([]);
    const [fontDropdownOpen, setFontDropdownOpen] = useState(false);

    // Text props
    const [textContent, setTextContent] = useState('Your text');
    const [fontFamily, setFontFamily] = useState('Arial');
    const [fontSize, setFontSize] = useState(32);
    const [currentColor, setCurrentColor] = useState(() => getContrastColor(productColor));
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);

    // Draw props
    const [brushSize, setBrushSize] = useState(10);

    // Mobile & responsive
    const [isMobile, setIsMobile] = useState(false);
    const [showPanel, setShowPanel] = useState(false);

    // Image & Object props
    const [imageOpacity, setImageOpacity] = useState(1);
    const [isRemovingBg, setIsRemovingBg] = useState(false);
    const [hasRemovedBg, setHasRemovedBg] = useState<Record<string, boolean>>({}); // Track by object id or ref
    const [originalImages, setOriginalImages] = useState<Record<string, string>>({}); // Store original image data URLs by object id
    const [bgRemovalTechnique, setBgRemovalTechnique] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
    const [showTechniqueSelector, setShowTechniqueSelector] = useState(false);

    // Image options modal
    const [showImageOptions, setShowImageOptions] = useState(false);
    const [showAIPrompt, setShowAIPrompt] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]); // Current batch of generated images
    const [aiImageHistory, setAiImageHistory] = useState<string[]>([]); // History of all generated images
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    // Undo/Redo state for UI
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    // Keep currentSideRef in sync
    useEffect(() => {
        currentSideRef.current = currentSide;
    }, [currentSide]);

    // Update default color when product color changes
    useEffect(() => {
        const contrastColor = getContrastColor(productColor);
        setCurrentColor(contrastColor);
        if (mainCanvas.current?.freeDrawingBrush) {
            mainCanvas.current.freeDrawingBrush.color = contrastColor;
        }
    }, [productColor]);

    // Load fonts
    useEffect(() => {
        fetch('/fonts/fonts.json')
            .then(r => r.json())
            .then((data: { fonts: FontConfig[] }) => {
                const fontList = data.fonts || [{ name: 'Arial', file: null, system: true }];
                setFonts(fontList);
                fontList.forEach(f => {
                    if (f.file) {
                        const font = new FontFace(f.name, `url(/fonts/${f.file})`);
                        font.load().then(loaded => document.fonts.add(loaded)).catch(() => { });
                    }
                });
            })
            .catch(() => setFonts([{ name: 'Arial', file: null, system: true }]));
    }, []);

    // Detect mobile and calculate dynamic canvas size
    const calculateSize = useCallback(() => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);

        // Check if in native fullscreen mode
        const isNativeFullscreen = !!(
            document.fullscreenElement ||
            (document as any).webkitFullscreenElement ||
            (document as any).msFullscreenElement
        );

        // Calculate available space for canvas
        if (mobile) {
            // Mobile: use a fixed aspect ratio based on width to prevent layout thrashing on scroll
            // because window.innerHeight changes constantly on mobile browsers when scrolling
            const availableWidth = isNativeFullscreen
                ? window.innerWidth - 32  // More space in fullscreen
                : window.innerWidth - 40;

            // In fullscreen mode, use more of the available height
            const headerHeight = isNativeFullscreen ? 56 : 120; // Smaller header in fullscreen
            const toolbarHeight = isNativeFullscreen ? 56 : 70;
            const availableHeight = window.innerHeight - headerHeight - toolbarHeight - 32;

            const w = Math.min(availableWidth, isNativeFullscreen ? Math.min(520, availableWidth) : 380);
            // Calculate height based on available space, but maintain reasonable aspect ratio
            const h = isNativeFullscreen
                ? Math.min(Math.max(w * 1.2, availableHeight * 0.85), availableHeight, window.innerHeight * 0.8)
                : w * 1.25;

            setCanvasSize(prev => {
                const newW = Math.floor(w);
                const newH = Math.floor(h);
                if (prev.w === newW && prev.h === newH) return prev;
                return { w: newW, h: newH };
            });
        } else {
            // Desktop: check if in fullscreen for larger canvas
            if (isNativeFullscreen) {
                // In fullscreen, calculate based on available space
                const availableWidth = window.innerWidth - 200; // Account for toolbar
                const availableHeight = window.innerHeight - 100; // Account for header
                const w = Math.min(500, availableWidth);
                const h = Math.min(600, availableHeight, w * 1.25);
                setCanvasSize(prev => {
                    const newW = Math.floor(w);
                    const newH = Math.floor(h);
                    if (prev.w === newW && prev.h === newH) return prev;
                    return { w: newW, h: newH };
                });
            } else {
                // Normal desktop size
                setCanvasSize(prev => {
                    if (prev.w === 400 && prev.h === 500) return prev;
                    return { w: 400, h: 500 };
                });
            }
        }
    }, []);

    useEffect(() => {
        calculateSize();
        window.addEventListener('resize', calculateSize);
        return () => window.removeEventListener('resize', calculateSize);
    }, [calculateSize]);

    // Recalculate size when fullscreen state changes
    useEffect(() => {
        // Small delay to allow browser to complete fullscreen transition
        const timer = setTimeout(() => {
            calculateSize();
        }, 100);
        return () => clearTimeout(timer);
    }, [isFullscreen, calculateSize]);

    // Lock body scroll when in CSS fullscreen mode (desktop only - iOS handles this differently)
    useEffect(() => {
        if (isFullscreen && !isIOS()) {
            // Desktop: prevent body scroll
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isFullscreen]);

    // Update background when color changes
    useEffect(() => {
        if (mainCanvas.current && productImgs.current.front) {
            setBackground(mainCanvas.current, currentSideRef.current, currentSideRef.current === 'front' ? printAreaFront : printAreaBack);
        }
        if (previewCanvas.current && productImgs.current.front) {
            setBackground(previewCanvas.current, currentSideRef.current === 'front' ? 'back' : 'front', currentSideRef.current === 'front' ? printAreaBack : printAreaFront);
        }
    }, [productColor, printAreaFront, printAreaBack]);

    const setBackground = useCallback(async (canvas: fabric.StaticCanvas, side: Side, areaToUse?: { x: number; y: number; width: number; height: number } | null) => {
        const imgElement = side === 'front' ? productImgs.current.front : productImgs.current.back;
        if (!imgElement) {
            canvas.renderAll();
            return;
        }

        try {
            const bgImg = new fabric.FabricImage(imgElement, {
                originX: 'center',
                originY: 'center',
            });

            const scale = Math.min(
                (canvas.getWidth() * 0.88) / (bgImg.width || 1),
                (canvas.getHeight() * 0.88) / (bgImg.height || 1)
            );

            bgImg.set({
                left: canvas.getWidth() / 2,
                top: canvas.getHeight() / 2,
                scaleX: scale,
                scaleY: scale,
                selectable: false,
                evented: false,
            });

            if (productColor && productColor !== '#FFFFFF') {
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

            canvas.backgroundImage = bgImg;

            // Use configured print area if available, otherwise fall back to ratio
            let printW: number;
            let printH: number;
            let printX: number;
            let printY: number;

            if (areaToUse && areaToUse.width && areaToUse.height) {
                // Use configured print area coordinates
                // The coordinates are relative to the canvas used in admin (400x500)
                // We need to scale them to match the current canvas size
                const adminCanvasWidth = 400;
                const adminCanvasHeight = 500;
                const scaleX = canvas.getWidth() / adminCanvasWidth;
                const scaleY = canvas.getHeight() / adminCanvasHeight;

                // Round coordinates for pixel-perfect alignment
                printX = Math.round(areaToUse.x * scaleX);
                printY = Math.round(areaToUse.y * scaleY);
                printW = Math.round(areaToUse.width * scaleX);
                printH = Math.round(areaToUse.height * scaleY);
            } else {
                // Fall back to ratio-based calculation
                printW = (bgImg.width! * scale) * PRINT_AREA_RATIO;
                printH = (bgImg.height! * scale) * PRINT_AREA_RATIO;
                printX = (canvas.getWidth() - printW) / 2;
                printY = (canvas.getHeight() - printH) / 2;
            }

            const clipRect = new fabric.Rect({
                left: printX + printW / 2,
                top: printY + printH / 2,
                width: printW,
                height: printH,
                originX: 'center',
                originY: 'center',
                absolutePositioned: true
            });

            // Add Printable Area Guide (Visible only in editor, not in export)
            if (canvas instanceof fabric.Canvas) {
                if (printAreaGuideRef.current) {
                    canvas.remove(printAreaGuideRef.current);
                }

                const guide = new fabric.Rect({
                    left: printX + printW / 2,
                    top: printY + printH / 2,
                    width: printW,
                    height: printH,
                    fill: 'transparent',
                    stroke: 'rgba(20, 184, 166, 0.3)',
                    strokeDashArray: [5, 5],
                    strokeWidth: 2,
                    selectable: false,
                    evented: false,
                    originX: 'center',
                    originY: 'center',
                    // @ts-ignore
                    isGuide: true
                });

                printAreaGuideRef.current = guide;
                canvas.add(guide);
                canvas.sendObjectToBack(guide);

                // Update global ref for new objects being added to main canvas
                clipPathRef.current = clipRect;
            }

            // Apply clipping to all existing objects on this specific canvas
            canvas.getObjects().forEach(obj => {
                if (!(obj as any).isGuide && obj !== canvas.backgroundImage) {
                    obj.set({ clipPath: clipRect });
                }
            });

            canvas.renderAll();
            return clipRect;
        } catch (e) {
            console.error('Error setting background:', e);
            canvas.renderAll();
            return null;
        }
    }, [productColor, printAreaFront, printAreaBack]);

    // Load product images - use dynamic R2 paths from sessionStorage, no fallbacks
    const loadProductImages = useCallback(() => {
        // Get images from sessionStorage (these should be set from the database when product type is selected)
        const frontImage = sessionStorage.getItem("productTypeImage");
        const backImage = sessionStorage.getItem("productTypeBackImage");

        // Use only R2 images from sessionStorage, no fallbacks
        const frontImageSrc = frontImage;
        const backImageSrc = backImage || frontImage; // Use front image as back if back doesn't exist

        const loadImg = (src: string | null): Promise<HTMLImageElement | null> => new Promise(res => {
            if (!src) {
                res(null);
                return;
            }
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => res(img);
            img.onerror = () => {
                res(null);
            };

            // If the image is from R2 (external domain), proxy it through our API to avoid CORS issues
            // Check if it's an external URL (starts with http:// or https://) and not from localhost
            const isExternalUrl = src.startsWith('http://') || src.startsWith('https://');
            const isLocalhost = src.includes('localhost') || src.startsWith('/');

            if (isExternalUrl && !isLocalhost) {
                // Proxy through our API endpoint
                const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(src)}`;
                img.src = proxyUrl;
            } else {
                // Use the original URL for local images
                img.src = src;
            }
        });

        Promise.all([loadImg(frontImageSrc), loadImg(backImageSrc)]).then(([front, back]) => {
            productImgs.current = { front, back: back || front };
            if (mainCanvas.current) {
                const printArea = currentSideRef.current === 'front' ? printAreaFront : printAreaBack;
                setBackground(mainCanvas.current, currentSideRef.current, printArea);
            }
            if (previewCanvas.current) {
                const printArea = currentSideRef.current === 'front' ? printAreaBack : printAreaFront;
                setBackground(previewCanvas.current, currentSideRef.current === 'front' ? 'back' : 'front', printArea);
            }
        });
    }, [setBackground, printAreaFront, printAreaBack]);

    useEffect(() => {
        loadProductImages();

        // Listen for storage changes to reload images when product type changes
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'productTypeImage' || e.key === 'productTypeBackImage') {
                loadProductImages();
            }
        };

        // Also listen for custom storage events (for same-tab updates)
        const handleCustomStorage = () => {
            loadProductImages();
        };

        window.addEventListener('storage', handleStorageChange);
        // Listen for custom event that we can trigger from the same tab
        window.addEventListener('productImagesUpdated', handleCustomStorage);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('productImagesUpdated', handleCustomStorage);
        };
    }, [loadProductImages]);

    // Resize canvas when size changes
    useEffect(() => {
        if (mainCanvas.current && ready) {
            const oldW = lastSizeRef.current.w;
            const oldH = lastSizeRef.current.h;
            const newW = canvasSize.w;
            const newH = canvasSize.h;

            if (oldW !== newW || oldH !== newH) {
                const sx = newW / oldW;
                const sy = newH / oldH;

                mainCanvas.current.getObjects().forEach(obj => {
                    obj.set({
                        left: (obj.left || 0) * sx,
                        top: (obj.top || 0) * sy,
                        scaleX: (obj.scaleX || 1) * sx,
                        scaleY: (obj.scaleY || 1) * sy
                    });
                    obj.setCoords();
                });

                mainCanvas.current.setDimensions({ width: newW, height: newH });
                const printArea = currentSideRef.current === 'front' ? printAreaFront : printAreaBack;
                setBackground(mainCanvas.current, currentSideRef.current, printArea);
                lastSizeRef.current = { w: newW, h: newH };
                mainCanvas.current.renderAll();
            }
        }
    }, [canvasSize, ready, setBackground]);

    const serialize = (canvas: fabric.StaticCanvas) => {
        const objects = canvas.getObjects().filter(o => !(o as any).isGuide);
        return JSON.stringify({
            w: canvas.getWidth(),
            h: canvas.getHeight(),
            objects: objects.map(o => o.toObject())
        });
    };

    // History management - accepts pre-serialized state to avoid redundant canvas serialization
    const pushToHistory = useCallback((preSerializedState?: string) => {
        if (isUndoingRef.current || !mainCanvas.current || isInitializing.current) return;

        const side = currentSideRef.current;
        const serialized = preSerializedState || serialize(mainCanvas.current);

        historyRef.current[side] = historyRef.current[side].slice(0, historyIndexRef.current[side] + 1);
        historyRef.current[side].push(serialized);

        if (historyRef.current[side].length > MAX_HISTORY) {
            historyRef.current[side].shift();
        } else {
            historyIndexRef.current[side]++;
        }

        setCanUndo(historyIndexRef.current[side] > 0);
        setCanRedo(false);
    }, []);

    const undo = useCallback(async () => {
        const side = currentSideRef.current;
        if (historyIndexRef.current[side] <= 0 || !mainCanvas.current) return;

        isUndoingRef.current = true;
        historyIndexRef.current[side]--;

        const state = historyRef.current[side][historyIndexRef.current[side]];
        designsRef.current[side] = state;

        await loadDesign(mainCanvas.current, state, side);

        setCanUndo(historyIndexRef.current[side] > 0);
        setCanRedo(historyIndexRef.current[side] < historyRef.current[side].length - 1);
        isUndoingRef.current = false;
    }, []);

    const redo = useCallback(async () => {
        const side = currentSideRef.current;
        if (historyIndexRef.current[side] >= historyRef.current[side].length - 1 || !mainCanvas.current) return;

        isUndoingRef.current = true;
        historyIndexRef.current[side]++;

        const state = historyRef.current[side][historyIndexRef.current[side]];
        designsRef.current[side] = state;

        await loadDesign(mainCanvas.current, state, side);

        setCanUndo(historyIndexRef.current[side] > 0);
        setCanRedo(historyIndexRef.current[side] < historyRef.current[side].length - 1);
        isUndoingRef.current = false;
    }, []);

    // Force save function - saves immediately without debounce
    const forceSaveDesign = useCallback(() => {
        if (!mainCanvas.current || isInitializing.current) return;

        designsRef.current[currentSideRef.current] = serialize(mainCanvas.current);
        const designData = JSON.stringify(designsRef.current);

        // Update parent state
        onDesignChange?.(designData);

        // Auto-save to sessionStorage
        if (typeof window !== 'undefined') {
            sessionStorage.setItem("designEditorData", designData);
        }
    }, [onDesignChange]);

    // Auto-save function - saves to both parent state and sessionStorage (debounced)
    const saveCurrentDesign = useCallback(() => {
        if (!mainCanvas.current || isInitializing.current) return;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            if (mainCanvas.current) {
                const serialized = serialize(mainCanvas.current);
                designsRef.current[currentSideRef.current] = serialized;
                const designData = JSON.stringify(designsRef.current);

                onDesignChange?.(designData);

                if (typeof window !== 'undefined') {
                    sessionStorage.setItem("designEditorData", designData);
                }

                pushToHistory(serialized);
            }
        }, 300);
    }, [onDesignChange, pushToHistory]);

    const loadDesign = useCallback(async (canvas: fabric.StaticCanvas, design: string | null, side: Side) => {
        canvas.getObjects().forEach(o => canvas.remove(o));
        const printArea = side === 'front' ? printAreaFront : printAreaBack;
        const clipRect = await setBackground(canvas, side, printArea);
        if (!design) return canvas.renderAll();

        try {
            const { objects, w, h } = JSON.parse(design);
            const sx = canvas.getWidth() / w, sy = canvas.getHeight() / h;

            fabric.util.enlivenObjects(objects).then((objs: any[]) => {
                objs.forEach(o => {
                    o.set({
                        left: (o.left || 0) * sx,
                        top: (o.top || 0) * sy,
                        scaleX: (o.scaleX || 1) * sx,
                        scaleY: (o.scaleY || 1) * sy,
                        clipPath: clipRect || undefined
                    });
                    canvas.add(o);
                });
                canvas.renderAll();
            });
        } catch { canvas.renderAll(); }
    }, [setBackground]);

    const deleteSelected = useCallback(() => {
        if (!mainCanvas.current) return;
        const activeObjects = mainCanvas.current.getActiveObjects();
        if (activeObjects.length === 0) return;
        activeObjects.forEach(obj => { mainCanvas.current!.remove(obj); });
        mainCanvas.current.discardActiveObject();
        mainCanvas.current.renderAll();
        setSelected(null);
        setShowPanel(false);
        saveCurrentDesign();
    }, [saveCurrentDesign]);

    const duplicateSelected = useCallback(async () => {
        if (!mainCanvas.current) return;
        const activeObjects = mainCanvas.current.getActiveObjects();
        if (activeObjects.length === 0) return;

        const clonedObjects: fabric.Object[] = [];
        for (const obj of activeObjects) {
            const cloned = await obj.clone();
            cloned.set({ left: (cloned.left || 0) + 20, top: (cloned.top || 0) + 20 });
            mainCanvas.current!.add(cloned);
            clonedObjects.push(cloned);
        }

        if (clonedObjects.length === 1) {
            mainCanvas.current.setActiveObject(clonedObjects[0]);
            setSelected(clonedObjects[0]);
        } else if (clonedObjects.length > 1) {
            const selection = new fabric.ActiveSelection(clonedObjects, { canvas: mainCanvas.current });
            mainCanvas.current.setActiveObject(selection);
        }

        mainCanvas.current.renderAll();
        saveCurrentDesign();
    }, [saveCurrentDesign]);

    const copySelected = useCallback(async () => {
        if (!mainCanvas.current) return;
        const activeObjects = mainCanvas.current.getActiveObjects();
        if (activeObjects.length === 0) return;

        const clones: fabric.Object[] = [];
        for (const obj of activeObjects) {
            const cloned = await obj.clone();
            clones.push(cloned);
        }
        clipboardRef.current = clones;
    }, []);

    const pasteClipboard = useCallback(async () => {
        if (!mainCanvas.current || !clipboardRef.current || clipboardRef.current.length === 0) return;

        const pastedObjects: fabric.Object[] = [];
        for (const obj of clipboardRef.current) {
            const cloned = await obj.clone();
            cloned.set({ left: (cloned.left || 0) + 20, top: (cloned.top || 0) + 20 });
            mainCanvas.current!.add(cloned);
            pastedObjects.push(cloned);
        }

        clipboardRef.current = await Promise.all(
            clipboardRef.current.map(async obj => {
                const c = await obj.clone();
                c.set({ left: (c.left || 0) + 20, top: (c.top || 0) + 20 });
                return c;
            })
        );

        if (pastedObjects.length === 1) {
            mainCanvas.current.setActiveObject(pastedObjects[0]);
        } else if (pastedObjects.length > 1) {
            const selection = new fabric.ActiveSelection(pastedObjects, { canvas: mainCanvas.current });
            mainCanvas.current.setActiveObject(selection);
        }

        mainCanvas.current.renderAll();
        saveCurrentDesign();
    }, [saveCurrentDesign]);

    const moveSelected = useCallback((dx: number, dy: number) => {
        if (!mainCanvas.current) return;
        const activeObjects = mainCanvas.current.getActiveObjects();
        if (activeObjects.length === 0) return;

        activeObjects.forEach(obj => {
            obj.set({ left: (obj.left || 0) + dx, top: (obj.top || 0) + dy });
            obj.setCoords();
        });

        mainCanvas.current.renderAll();
        saveCurrentDesign();
    }, [saveCurrentDesign]);

    const bringForward = useCallback(() => {
        if (!mainCanvas.current) return;
        const active = mainCanvas.current.getActiveObject();
        if (active) {
            mainCanvas.current.bringObjectForward(active);
            mainCanvas.current.renderAll();
            saveCurrentDesign();
        }
    }, [saveCurrentDesign]);

    const sendBackward = useCallback(() => {
        if (!mainCanvas.current) return;
        const active = mainCanvas.current.getActiveObject();
        if (active) {
            mainCanvas.current.sendObjectBackwards(active);
            mainCanvas.current.renderAll();
            saveCurrentDesign();
        }
    }, [saveCurrentDesign]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (mainCanvas.current && (mainCanvas.current.getActiveObject() as any)?.isEditing) return;

            const step = e.shiftKey ? MOVE_STEP_SHIFT : MOVE_STEP;

            switch (e.key) {
                case 'Delete':
                case 'Backspace':
                    e.preventDefault();
                    deleteSelected();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    moveSelected(0, -step);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    moveSelected(0, step);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    moveSelected(-step, 0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    moveSelected(step, 0);
                    break;
                case 'c':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        copySelected();
                    }
                    break;
                case 'v':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        pasteClipboard();
                    }
                    break;
                case 'd':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        duplicateSelected();
                    }
                    break;
                case 'a':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        if (mainCanvas.current) {
                            const objects = mainCanvas.current.getObjects();
                            if (objects.length > 0) {
                                const selection = new fabric.ActiveSelection(objects, { canvas: mainCanvas.current });
                                mainCanvas.current.setActiveObject(selection);
                                mainCanvas.current.renderAll();
                            }
                        }
                    }
                    break;
                case 'z':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        if (e.shiftKey) {
                            redo();
                        } else {
                            undo();
                        }
                    }
                    break;
                case 'y':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        redo();
                    }
                    break;
                case 'Escape':
                    if (isFullscreen) {
                        setIsFullscreen(false);
                    } else {
                        if (mainCanvas.current) {
                            mainCanvas.current.discardActiveObject();
                            mainCanvas.current.renderAll();
                        }
                        setShowPanel(false);
                        setFontDropdownOpen(false);
                    }
                    break;
                case ']':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        bringForward();
                    }
                    break;
                case '[':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        sendBackward();
                    }
                    break;
                // Removed Ctrl+S save shortcut - auto-save is now automatic
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [deleteSelected, duplicateSelected, copySelected, pasteClipboard, moveSelected, bringForward, sendBackward, undo, redo, isFullscreen]);

    // Init canvas
    useEffect(() => {
        if (!canvasRef.current) return;
        setIsLoading(true);
        isInitializing.current = true;

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: canvasSize.w,
            height: canvasSize.h,
            backgroundColor: 'transparent',
            preserveObjectStacking: true
        });
        mainCanvas.current = canvas;

        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = brushSize;
        canvas.freeDrawingBrush.color = getContrastColor(productColor);

        canvas.on('selection:created', (e: any) => {
            const obj = e.selected?.[0];
            setSelected(obj);
            setShowPanel(true);
            if (obj && (obj.type === 'image' || obj instanceof fabric.FabricImage)) {
                setImageOpacity(obj.opacity || 1);
            }
        });
        canvas.on('selection:updated', (e: any) => {
            const obj = e.selected?.[0];
            setSelected(obj);
            setShowPanel(true);
            if (obj && (obj.type === 'image' || obj instanceof fabric.FabricImage)) {
                setImageOpacity(obj.opacity || 1);
            }
        });
        canvas.on('selection:cleared', () => { setSelected(null); setShowPanel(false); setIsRemovingBg(false); });

        canvas.on('object:modified', saveCurrentDesign);
        canvas.on('path:created', (e: any) => {
            if (clipPathRef.current) {
                e.path.set({ clipPath: clipPathRef.current });
            }
            saveCurrentDesign();
        });

        const initCanvas = async () => {
            let attempts = 0;
            while (!productImgs.current.front && attempts < 20) {
                await new Promise(r => setTimeout(r, 100));
                attempts++;
            }

            await setBackground(canvas, 'front', printAreaFront);

            if (initialDesign) {
                try {
                    const d = JSON.parse(initialDesign);
                    designsRef.current = { front: d.front || null, back: d.back || null };
                    await loadDesign(canvas, d.front, 'front');
                } catch { }
            }

            // Initialize history with current state (per side)
            historyRef.current.front = [designsRef.current.front || serialize(canvas)];
            historyRef.current.back = [designsRef.current.back || ''];
            historyIndexRef.current.front = 0;
            historyIndexRef.current.back = designsRef.current.back ? 0 : -1;

            // Save initial state to sessionStorage (even if empty)
            designsRef.current.front = serialize(canvas);
            const initialDesignData = JSON.stringify(designsRef.current);
            if (typeof window !== 'undefined') {
                sessionStorage.setItem("designEditorData", initialDesignData);
            }
            onDesignChange?.(initialDesignData);

            setReady(true);
            setIsLoading(false);
            isInitializing.current = false;
        };

        initCanvas();

        return () => {
            // Save design before unmounting (force save, no debounce)
            if (mainCanvas.current && !isInitializing.current) {
                // Clear any pending debounced saves
                if (saveTimeoutRef.current) {
                    clearTimeout(saveTimeoutRef.current);
                }

                // Force immediate save
                designsRef.current[currentSideRef.current] = serialize(mainCanvas.current);
                const designData = JSON.stringify(designsRef.current);

                if (typeof window !== 'undefined') {
                    sessionStorage.setItem("designEditorData", designData);
                }
                onDesignChange?.(designData);
            }

            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            try { canvas.dispose(); } catch { }
            mainCanvas.current = null;
        };
    }, []);

    // Init preview canvas
    useEffect(() => {
        if (!previewRef.current || previewCanvas.current) return;

        const preview = new fabric.StaticCanvas(previewRef.current, {
            width: 120,
            height: 150,
            backgroundColor: 'transparent',
        });
        previewCanvas.current = preview;

        const initPreview = async () => {
            let attempts = 0;
            while (!productImgs.current.front && attempts < 20) {
                await new Promise(r => setTimeout(r, 100));
                attempts++;
            }
            await setBackground(preview, 'back', printAreaBack);
        };

        initPreview();

        return () => { try { preview.dispose(); } catch { } previewCanvas.current = null; };
    }, [setBackground]);

    // Update preview when side changes
    useEffect(() => {
        if (!previewCanvas.current || !ready) return;
        const oppositeSide = currentSide === 'front' ? 'back' : 'front';
        loadDesign(previewCanvas.current, designsRef.current[oppositeSide], oppositeSide);
    }, [currentSide, ready, loadDesign]);

    // Tool mode
    useEffect(() => {
        if (!mainCanvas.current) return;
        mainCanvas.current.isDrawingMode = activeTool === 'draw';
        if (activeTool === 'draw' && mainCanvas.current.freeDrawingBrush) {
            mainCanvas.current.freeDrawingBrush.width = brushSize;
            mainCanvas.current.freeDrawingBrush.color = currentColor;
        }
    }, [activeTool, brushSize, currentColor]);

    const switchSide = async (side: Side) => {
        if (side === currentSideRef.current || !mainCanvas.current) return;

        // Save current side before switching (immediate, no debounce)
        designsRef.current[currentSideRef.current] = serialize(mainCanvas.current);
        const designData = JSON.stringify(designsRef.current);

        // Auto-save to sessionStorage when switching sides
        if (typeof window !== 'undefined') {
            sessionStorage.setItem("designEditorData", designData);
        }
        onDesignChange?.(designData);

        setCurrentSide(side);
        currentSideRef.current = side;
        await loadDesign(mainCanvas.current, designsRef.current[side], side);

        // Update Undo/Redo availability for the new side
        setCanUndo(historyIndexRef.current[side] > 0);
        setCanRedo(historyIndexRef.current[side] < historyRef.current[side].length - 1);
    };

    const addText = () => {
        if (!mainCanvas.current) return;

        // Calculate fitting font size based on printable area
        const bgImg = mainCanvas.current.backgroundImage as fabric.FabricImage;
        let scale = 1;
        if (bgImg) {
            scale = bgImg.scaleX || 1;
        }

        const printW = (bgImg?.width || canvasSize.w) * scale * PRINT_AREA_RATIO;

        const text = new fabric.IText(textContent, {
            left: canvasSize.w / 2,
            top: canvasSize.h / 2,
            fontFamily,
            fontSize: isMobile ? Math.min(fontSize, 24) : fontSize,
            fill: currentColor,
            originX: 'center',
            originY: 'center',
            fontWeight: isBold ? 'bold' : 'normal',
            fontStyle: isItalic ? 'italic' : 'normal',
            clipPath: clipPathRef.current || undefined
        });

        // Ensure text isn't wider than print area
        if (text.width! > printW) {
            text.scaleToWidth(printW * 0.9);
        }

        mainCanvas.current.add(text);
        mainCanvas.current.setActiveObject(text);
        mainCanvas.current.renderAll();
        setSelected(text);
        setShowPanel(true);
        saveCurrentDesign();
    };

    const addImage = (file: File) => {
        if (!mainCanvas.current) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const url = e.target?.result as string;
            fabric.FabricImage.fromURL(url).then((img: fabric.FabricImage) => {
                const bgImg = mainCanvas.current?.backgroundImage as fabric.FabricImage;
                let s = 1;
                if (bgImg) {
                    s = bgImg.scaleX || 1;
                }

                const printW = (bgImg?.width || canvasSize.w) * s * PRINT_AREA_RATIO;
                const printH = (bgImg?.height || canvasSize.h) * s * PRINT_AREA_RATIO;

                const scale = Math.min((printW * 0.8) / (img.width || 1), (printH * 0.8) / (img.height || 1), 1);

                img.set({
                    left: canvasSize.w / 2,
                    top: canvasSize.h / 2,
                    originX: 'center',
                    originY: 'center',
                    scaleX: scale,
                    scaleY: scale,
                    clipPath: clipPathRef.current || undefined
                });

                mainCanvas.current!.add(img);
                mainCanvas.current!.setActiveObject(img);
                mainCanvas.current!.renderAll();
                setSelected(img);
                setShowPanel(true);
                saveCurrentDesign();
            });
        };
        reader.readAsDataURL(file);
    };

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        Array.from(files).forEach(f => { if (f.type.startsWith('image/')) addImage(f); });
        setShowImageOptions(false);
        setIsDraggingOver(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
        handleFiles(e.dataTransfer.files);
    };


    const handleGenerateAI = async () => {
        if (!aiPrompt.trim()) {
            alert('Please enter a prompt');
            return;
        }

        setIsGeneratingAI(true);
        try {
            // Call API to generate images with AI
            const response = await fetch('/api/generate-ai-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: aiPrompt }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate images');
            }

            const data = await response.json();
            if (data.images && data.images.length > 0) {
                setGeneratedImages(data.images);
                // Add new images to history (avoid duplicates)
                setAiImageHistory(prev => {
                    const newHistory = [...prev];
                    data.images.forEach((img: string) => {
                        if (!newHistory.includes(img)) {
                            newHistory.push(img);
                        }
                    });
                    return newHistory;
                });
            } else {
                throw new Error('No images generated');
            }
        } catch (error) {
            console.error('Error generating AI images:', error);
            alert('Failed to generate images. Please try again.');
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const selectGeneratedImage = (imageUrl: string) => {
        // Convert data URL to blob/file and add to canvas
        fetch(imageUrl)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], 'ai-generated.png', { type: 'image/png' });
                addImage(file);
                setShowImageOptions(false);
                setShowAIPrompt(false);
                // Don't clear generatedImages or history - keep them for next time
                setAiPrompt('');
            })
            .catch(err => {
                console.error('Error loading generated image:', err);
                alert('Failed to load generated image');
            });
    };

    const updateTextProp = (prop: string, val: any) => {
        if (!mainCanvas.current || !selected) return;
        (selected as any).set(prop, val);
        mainCanvas.current.renderAll();
        saveCurrentDesign();
    };

    // Fullscreen toggle - uses native API on desktop, CSS fullscreen on iOS
    const toggleFullscreen = useCallback(async () => {
        if (!containerRef.current) return;

        // iOS doesn't support fullscreen API for non-video elements, use CSS fallback
        if (isIOS()) {
            setIsFullscreen(prev => !prev);
            return;
        }

        try {
            if (!isFullscreen) {
                // Enter fullscreen
                if (containerRef.current.requestFullscreen) {
                    await containerRef.current.requestFullscreen();
                } else if ((containerRef.current as any).webkitRequestFullscreen) {
                    await (containerRef.current as any).webkitRequestFullscreen();
                } else if ((containerRef.current as any).msRequestFullscreen) {
                    await (containerRef.current as any).msRequestFullscreen();
                }
            } else {
                // Exit fullscreen
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if ((document as any).webkitExitFullscreen) {
                    await (document as any).webkitExitFullscreen();
                } else if ((document as any).msExitFullscreen) {
                    await (document as any).msExitFullscreen();
                }
            }
        } catch (error) {
            console.error('Fullscreen error:', error);
            // Fallback to CSS fullscreen if native API fails
            setIsFullscreen(prev => !prev);
        }
    }, [isFullscreen]);

    // Listen for fullscreen change events (user presses ESC, etc.)
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!(
                document.fullscreenElement ||
                (document as any).webkitFullscreenElement ||
                (document as any).msFullscreenElement
            );
            setIsFullscreen(isCurrentlyFullscreen);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Removed handleSave - auto-save is now handled automatically

    const selectFont = (fontName: string) => {
        setFontFamily(fontName);
        updateTextProp('fontFamily', fontName);
        setFontDropdownOpen(false);
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (fontDropdownOpen && !(e.target as HTMLElement).closest(`.${styles.fontDropdown}`)) {
                setFontDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [fontDropdownOpen]);

    return (
        <div ref={containerRef} className={`${styles.editor} ${isFullscreen ? styles.fullscreen : ''} ${isMobile ? styles.mobile : ''}`} tabIndex={0}>
            {isLoading && <div className={styles.loading}><div className={styles.spinner} /><p>Loading editor...</p></div>}

            {/* Header */}
            <div className={styles.header}>
                <div className={styles.sideTabs}>
                    <button className={`${styles.sideTab} ${currentSide === 'front' ? styles.active : ''}`} onClick={() => switchSide('front')}>
                        <span>👕</span> Front
                    </button>
                    <button className={`${styles.sideTab} ${currentSide === 'back' ? styles.active : ''}`} onClick={() => switchSide('back')}>
                        <span>🔄</span> Back
                    </button>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.undoBtn} onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" /></svg>
                    </button>
                    <button className={styles.undoBtn} onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3L21 13" /></svg>
                    </button>
                    <button className={styles.fullscreenBtn} onClick={toggleFullscreen} title="Fullscreen">
                        {isFullscreen ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" /></svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.content}>
                {/* Toolbar */}
                <div className={styles.toolbar}>
                    <div className={styles.toolGroup}>
                        <button className={`${styles.tool} ${activeTool === 'select' ? styles.active : ''}`} onClick={() => setActiveTool('select')} title="Select">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" /></svg>
                        </button>
                        <button className={`${styles.tool} ${activeTool === 'text' ? styles.active : ''}`} onClick={() => { setActiveTool('text'); addText(); }} title="Add Text">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></svg>
                        </button>
                        <button className={`${styles.tool} ${activeTool === 'image' ? styles.active : ''}`} onClick={() => { setActiveTool('image'); setShowImageOptions(true); }} title="Add Images">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                        </button>
                        <button className={`${styles.tool} ${activeTool === 'draw' ? styles.active : ''}`} onClick={() => setActiveTool('draw')} title="Draw">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /></svg>
                        </button>
                    </div>

                    {selected && (
                        <div className={styles.toolGroup}>
                            <button className={styles.tool} onClick={duplicateSelected} title="Duplicate (Ctrl+D)">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                            </button>
                            <button className={`${styles.tool} ${styles.delete}`} onClick={deleteSelected} title="Delete">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Canvas Area */}
                <div className={styles.canvasArea} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}>
                    <div className={styles.canvasWrap}>
                        <canvas ref={canvasRef} />
                    </div>

                    <div className={styles.preview}>
                        <span className={styles.previewLabel}>{currentSide === 'front' ? 'Back' : 'Front'}</span>
                        <canvas ref={previewRef} />
                    </div>
                </div>
            </div>

            {/* Property Panel */}
            {(showPanel || activeTool === 'draw') && (
                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h3>{activeTool === 'draw' ? 'Draw Settings' : selected?.type === 'i-text' ? 'Text Properties' : 'Properties'}</h3>
                        <button onClick={() => {
                            setShowPanel(false);
                            // If in draw mode, also switch back to select tool to close the panel
                            if (activeTool === 'draw') {
                                setActiveTool('select');
                            }
                        }}>×</button>
                    </div>
                    <div className={styles.panelBody}>
                        {activeTool === 'draw' && (
                            <>
                                <label>Brush Size: {brushSize}px</label>
                                <input type="range" min="2" max="50" value={brushSize} onChange={e => setBrushSize(+e.target.value)} />
                                <label>Brush Color</label>
                                <ColorPicker
                                    currentColor={currentColor}
                                    onColorChange={(color) => {
                                        setCurrentColor(color);
                                        if (mainCanvas.current?.freeDrawingBrush) {
                                            mainCanvas.current.freeDrawingBrush.color = color;
                                        }
                                    }}
                                />
                            </>
                        )}

                        {selected?.type === 'i-text' && (
                            <>
                                <label>Your Text</label>
                                <textarea
                                    className={styles.textArea}
                                    value={textContent}
                                    onChange={e => { setTextContent(e.target.value); updateTextProp('text', e.target.value); }}
                                    placeholder="Enter your text here..."
                                    rows={3}
                                />

                                <label>Font Family</label>
                                <div className={styles.fontDropdown}>
                                    <button
                                        className={styles.fontDropdownTrigger}
                                        style={{ fontFamily }}
                                        onClick={(e) => { e.stopPropagation(); setFontDropdownOpen(!fontDropdownOpen); }}
                                    >
                                        <span style={{ fontFamily }}>{fontFamily}</span>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </button>
                                    {fontDropdownOpen && (
                                        <div className={styles.fontDropdownMenu}>
                                            {fonts.map(f => (
                                                <button
                                                    key={f.name}
                                                    className={`${styles.fontDropdownItem} ${f.name === fontFamily ? styles.selected : ''}`}
                                                    style={{ fontFamily: f.name }}
                                                    onClick={(e) => { e.stopPropagation(); selectFont(f.name); }}
                                                >
                                                    <span className={styles.fontName}>{f.name}</span>
                                                    <span className={styles.fontSample} style={{ fontFamily: f.name }}>Aa Bb Cc 123</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <label>Size: {fontSize}px</label>
                                <input type="range" min="12" max="120" value={fontSize} onChange={e => { setFontSize(+e.target.value); updateTextProp('fontSize', +e.target.value); }} />

                                <div className={styles.styleRow}>
                                    <button className={isBold ? styles.active : ''} onClick={() => { setIsBold(!isBold); updateTextProp('fontWeight', !isBold ? 'bold' : 'normal'); }}><b>B</b></button>
                                    <button className={isItalic ? styles.active : ''} onClick={() => { setIsItalic(!isItalic); updateTextProp('fontStyle', !isItalic ? 'italic' : 'normal'); }}><i>I</i></button>
                                </div>

                                <label>Text Color</label>
                                <ColorPicker
                                    currentColor={currentColor}
                                    onColorChange={(color) => {
                                        setCurrentColor(color);
                                        if (selected?.type === 'i-text') {
                                            updateTextProp('fill', color);
                                        }
                                    }}
                                />
                            </>
                        )}

                        {(selected?.type === 'image' || (selected && selected instanceof fabric.FabricImage)) && (
                            <div className={styles.imageProps}>
                                <label>Opacity: {Math.round(imageOpacity * 100)}%</label>
                                <input
                                    type="range"
                                    min="0" max="1" step="0.01"
                                    value={imageOpacity}
                                    onChange={e => {
                                        const val = +e.target.value;
                                        setImageOpacity(val);
                                        updateTextProp('opacity', val);
                                    }}
                                />

                                {!((selected as any).id && hasRemovedBg[(selected as any).id]) && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                                        {!showTechniqueSelector ? (
                                            <button
                                                className={`${styles.removeBgBtn} ${isRemovingBg ? styles.loading : ''}`}
                                                onClick={() => {
                                                    if (isRemovingBg) return;
                                                    setShowTechniqueSelector(true);
                                                }}
                                                disabled={isRemovingBg}
                                            >
                                                {isRemovingBg ? (
                                                    <>
                                                        <span className={styles.miniSpinner}></span>
                                                        Removing...
                                                    </>
                                                ) : (
                                                    <>✨ Remove Background</>
                                                )}
                                            </button>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
                                                    Choose removal technique:
                                                </div>
                                                <button
                                                    className={styles.techniqueBtn}
                                                    style={{
                                                        background: bgRemovalTechnique === 'conservative'
                                                            ? 'linear-gradient(135deg, #10b981, #059669)'
                                                            : 'rgba(0,0,0,0.05)',
                                                        color: bgRemovalTechnique === 'conservative' ? 'white' : '#475569',
                                                        border: `2px solid ${bgRemovalTechnique === 'conservative' ? '#10b981' : 'rgba(0,0,0,0.08)'}`,
                                                    }}
                                                    onClick={() => setBgRemovalTechnique('conservative')}
                                                >
                                                    🛡️ Conservative (Preserves more)
                                                </button>
                                                <button
                                                    className={styles.techniqueBtn}
                                                    style={{
                                                        background: bgRemovalTechnique === 'moderate'
                                                            ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                                                            : 'rgba(0,0,0,0.05)',
                                                        color: bgRemovalTechnique === 'moderate' ? 'white' : '#475569',
                                                        border: `2px solid ${bgRemovalTechnique === 'moderate' ? '#6366f1' : 'rgba(0,0,0,0.08)'}`,
                                                    }}
                                                    onClick={() => setBgRemovalTechnique('moderate')}
                                                >
                                                    ⚖️ Moderate (Balanced)
                                                </button>
                                                <button
                                                    className={styles.techniqueBtn}
                                                    style={{
                                                        background: bgRemovalTechnique === 'aggressive'
                                                            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                                                            : 'rgba(0,0,0,0.05)',
                                                        color: bgRemovalTechnique === 'aggressive' ? 'white' : '#475569',
                                                        border: `2px solid ${bgRemovalTechnique === 'aggressive' ? '#ef4444' : 'rgba(0,0,0,0.08)'}`,
                                                    }}
                                                    onClick={() => setBgRemovalTechnique('aggressive')}
                                                >
                                                    🔥 Aggressive (Removes more)
                                                </button>
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                                    <button
                                                        className={styles.techniqueBtn}
                                                        style={{
                                                            flex: 1,
                                                            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                                            color: 'white',
                                                            border: 'none',
                                                        }}
                                                        onClick={async () => {
                                                            if (isRemovingBg || !selected || !mainCanvas.current) return;

                                                            // Check if selected object is an image
                                                            if (!(selected instanceof fabric.FabricImage)) {
                                                                alert('Please select an image to remove background');
                                                                return;
                                                            }

                                                            setIsRemovingBg(true);
                                                            setShowTechniqueSelector(false);

                                                            try {
                                                                // Get the image's data URL
                                                                const img = selected as fabric.FabricImage;
                                                                const imgElement = img.getElement() as HTMLImageElement;

                                                                // Get the original image source URL
                                                                let imageSrc = imgElement.src;

                                                                // If it's a blob URL, we need to convert it to data URL
                                                                let imageDataUrl: string;

                                                                if (imageSrc.startsWith('data:')) {
                                                                    // Already a data URL
                                                                    imageDataUrl = imageSrc;
                                                                } else if (imageSrc.startsWith('blob:')) {
                                                                    // Convert blob URL to data URL
                                                                    const response = await fetch(imageSrc);
                                                                    const blob = await response.blob();
                                                                    imageDataUrl = await new Promise((resolve, reject) => {
                                                                        const reader = new FileReader();
                                                                        reader.onloadend = () => resolve(reader.result as string);
                                                                        reader.onerror = reject;
                                                                        reader.readAsDataURL(blob);
                                                                    });
                                                                } else {
                                                                    // For other URLs, fetch and convert
                                                                    const response = await fetch(imageSrc);
                                                                    const blob = await response.blob();
                                                                    imageDataUrl = await new Promise((resolve, reject) => {
                                                                        const reader = new FileReader();
                                                                        reader.onloadend = () => resolve(reader.result as string);
                                                                        reader.onerror = reject;
                                                                        reader.readAsDataURL(blob);
                                                                    });
                                                                }

                                                                // If we still don't have a data URL, create one from the image element
                                                                if (!imageDataUrl || !imageDataUrl.startsWith('data:')) {
                                                                    const tempCanvas = document.createElement('canvas');
                                                                    const naturalWidth = imgElement.naturalWidth || img.width || 800;
                                                                    const naturalHeight = imgElement.naturalHeight || img.height || 800;

                                                                    tempCanvas.width = naturalWidth;
                                                                    tempCanvas.height = naturalHeight;
                                                                    const tempCtx = tempCanvas.getContext('2d');

                                                                    if (!tempCtx) {
                                                                        throw new Error('Could not get canvas context');
                                                                    }

                                                                    // Wait for image to load if needed
                                                                    await new Promise((resolve) => {
                                                                        if (imgElement.complete) {
                                                                            resolve(null);
                                                                        } else {
                                                                            imgElement.onload = () => resolve(null);
                                                                            imgElement.onerror = () => resolve(null);
                                                                        }
                                                                    });

                                                                    // Draw the image to the canvas at full resolution
                                                                    tempCtx.drawImage(imgElement, 0, 0, naturalWidth, naturalHeight);

                                                                    // Get the data URL
                                                                    imageDataUrl = tempCanvas.toDataURL('image/png');
                                                                }

                                                                // Store the original image before processing (for undo)
                                                                const currentId = (img as any).id || Math.random().toString();
                                                                if (!originalImages[currentId]) {
                                                                    setOriginalImages(prev => ({ ...prev, [currentId]: imageDataUrl }));
                                                                }

                                                                // Call the API to remove background with selected technique
                                                                const response = await fetch('/api/remove-background', {
                                                                    method: 'POST',
                                                                    headers: {
                                                                        'Content-Type': 'application/json',
                                                                    },
                                                                    body: JSON.stringify({
                                                                        imageDataUrl,
                                                                        technique: bgRemovalTechnique
                                                                    }),
                                                                });

                                                                if (!response.ok) {
                                                                    const error = await response.json();
                                                                    throw new Error(error.error || 'Failed to remove background');
                                                                }

                                                                const data = await response.json();

                                                                if (!data.success || !data.imageDataUrl) {
                                                                    throw new Error('Invalid response from server');
                                                                }

                                                                // Replace the image with the processed version
                                                                const processedDataUrl = data.imageDataUrl;

                                                                // Create new image from processed data URL
                                                                fabric.FabricImage.fromURL(processedDataUrl).then((newImg: fabric.FabricImage) => {
                                                                    if (!mainCanvas.current) return;

                                                                    // Preserve the position, scale, and other properties
                                                                    newImg.set({
                                                                        left: img.left,
                                                                        top: img.top,
                                                                        scaleX: img.scaleX,
                                                                        scaleY: img.scaleY,
                                                                        angle: img.angle,
                                                                        originX: img.originX,
                                                                        originY: img.originY,
                                                                        opacity: img.opacity,
                                                                        clipPath: img.clipPath,
                                                                    });

                                                                    // Remove old image and add new one
                                                                    mainCanvas.current.remove(img);
                                                                    mainCanvas.current.add(newImg);
                                                                    mainCanvas.current.setActiveObject(newImg);
                                                                    mainCanvas.current.renderAll();

                                                                    // Mark as processed and preserve original image reference
                                                                    const id = (newImg as any).id || currentId;
                                                                    (newImg as any).id = id;
                                                                    setHasRemovedBg(prev => ({ ...prev, [id]: true }));
                                                                    // Keep the original image stored (don't overwrite if it exists)
                                                                    if (!originalImages[id]) {
                                                                        setOriginalImages(prev => ({ ...prev, [id]: imageDataUrl }));
                                                                    }
                                                                    setSelected(newImg);

                                                                    saveCurrentDesign();
                                                                    setIsRemovingBg(false);
                                                                }).catch((err) => {
                                                                    console.error('Error loading processed image:', err);
                                                                    alert('Failed to load processed image');
                                                                    setIsRemovingBg(false);
                                                                });

                                                            } catch (error: any) {
                                                                console.error('Error removing background:', error);
                                                                alert(error.message || 'Failed to remove background. Please try again.');
                                                                setIsRemovingBg(false);
                                                            }
                                                        }}
                                                        disabled={isRemovingBg}
                                                    >
                                                        {isRemovingBg ? (
                                                            <>
                                                                <span className={styles.miniSpinner}></span>
                                                                Processing...
                                                            </>
                                                        ) : (
                                                            <>✨ Apply {bgRemovalTechnique.charAt(0).toUpperCase() + bgRemovalTechnique.slice(1)}</>
                                                        )}
                                                    </button>
                                                    <button
                                                        className={styles.techniqueBtn}
                                                        style={{
                                                            flex: 1,
                                                            background: 'rgba(0,0,0,0.05)',
                                                            color: '#475569',
                                                            border: '1px solid rgba(0,0,0,0.08)',
                                                        }}
                                                        onClick={() => setShowTechniqueSelector(false)}
                                                        disabled={isRemovingBg}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selected && (selected as any).id && hasRemovedBg[(selected as any).id] && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                                        <div className={styles.bgRemovedBadge}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            Background Removed
                                        </div>
                                        {originalImages[(selected as any).id] && (
                                            <button
                                                className={styles.undoRemoveBgBtn}
                                                onClick={async () => {
                                                    if (!selected || !mainCanvas.current) return;

                                                    const img = selected as fabric.FabricImage;
                                                    const id = (img as any).id;
                                                    const originalDataUrl = originalImages[id];

                                                    if (!originalDataUrl) {
                                                        alert('Original image not found');
                                                        return;
                                                    }

                                                    try {
                                                        // Restore the original image
                                                        fabric.FabricImage.fromURL(originalDataUrl).then((originalImg: fabric.FabricImage) => {
                                                            if (!mainCanvas.current) return;

                                                            // Preserve the position, scale, and other properties
                                                            originalImg.set({
                                                                left: img.left,
                                                                top: img.top,
                                                                scaleX: img.scaleX,
                                                                scaleY: img.scaleY,
                                                                angle: img.angle,
                                                                originX: img.originX,
                                                                originY: img.originY,
                                                                opacity: img.opacity,
                                                                clipPath: img.clipPath,
                                                            });

                                                            // Remove processed image and add original
                                                            mainCanvas.current.remove(img);
                                                            mainCanvas.current.add(originalImg);
                                                            mainCanvas.current.setActiveObject(originalImg);
                                                            mainCanvas.current.renderAll();

                                                            // Clear the background removal flag
                                                            setHasRemovedBg(prev => {
                                                                const newState = { ...prev };
                                                                delete newState[id];
                                                                return newState;
                                                            });
                                                            setSelected(originalImg);

                                                            saveCurrentDesign();
                                                        }).catch((err) => {
                                                            console.error('Error restoring original image:', err);
                                                            alert('Failed to restore original image');
                                                        });
                                                    } catch (error: any) {
                                                        console.error('Error undoing background removal:', error);
                                                        alert(error.message || 'Failed to undo background removal');
                                                    }
                                                }}
                                            >
                                                ↶ Undo Background Removal
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Image Options Modal */}
            {/* Image Options Modal - inline JSX, conditionally wrapped in Portal on mobile */}
            {showImageOptions && (
                <>
                    {/* Mobile: render through Portal to escape stacking context issues */}
                    {isMobile && typeof document !== 'undefined' && createPortal(
                        <div className={styles.modalOverlay} onClick={() => { if (!isGeneratingAI) { setShowImageOptions(false); setShowAIPrompt(false); } }}>
                            <div
                                className={`${styles.imageOptionsModal} ${isDraggingOver && !showAIPrompt && generatedImages.length === 0 ? styles.dragOver : ''}`}
                                onClick={(e) => e.stopPropagation()}
                                onDragOver={!showAIPrompt && generatedImages.length === 0 ? handleDragOver : undefined}
                                onDragLeave={!showAIPrompt && generatedImages.length === 0 ? handleDragLeave : undefined}
                                onDrop={!showAIPrompt && generatedImages.length === 0 ? handleDrop : undefined}
                            >
                                <button className={styles.modalClose} onClick={() => { setShowImageOptions(false); setShowAIPrompt(false); setIsDraggingOver(false); }} disabled={isGeneratingAI}>×</button>

                                {!showAIPrompt && generatedImages.length === 0 && (
                                    <>
                                        <h3 className={styles.modalTitle}>Add Image</h3>
                                        <div
                                            className={`${styles.dragDropArea} ${isDraggingOver ? styles.dragOver : ''}`}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {isDraggingOver ? (
                                                <>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="64" height="64">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                        <polyline points="17 8 12 3 7 8" />
                                                        <line x1="12" y1="3" x2="12" y2="15" />
                                                    </svg>
                                                    <p className={styles.dragDropText}>Drop your image here</p>
                                                </>
                                            ) : (
                                                <>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                        <polyline points="17 8 12 3 7 8" />
                                                        <line x1="12" y1="3" x2="12" y2="15" />
                                                    </svg>
                                                    <p className={styles.dragDropText}>Drag and drop your image here</p>
                                                    <p className={styles.dragDropSubtext}>or click to browse</p>
                                                </>
                                            )}
                                        </div>
                                        <div className={styles.imageOptionsButtons}>
                                            <button className={styles.imageOptionBtn} onClick={() => setShowAIPrompt(true)}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                                    <path d="M2 17l10 5 10-5" />
                                                    <path d="M2 12l10 5 10-5" />
                                                </svg>
                                                <span>Generate with AI</span>
                                            </button>
                                        </div>
                                    </>
                                )}

                                {showAIPrompt && generatedImages.length === 0 && (
                                    <>
                                        <h3 className={styles.modalTitle}>Generate with AI</h3>
                                        <div className={styles.aiPromptSection}>
                                            <label className={styles.promptLabel}>Enter your prompt:</label>
                                            <textarea
                                                className={styles.promptInput}
                                                value={aiPrompt}
                                                onChange={(e) => setAiPrompt(e.target.value)}
                                                placeholder="Describe the image you want to generate..."
                                                rows={4}
                                                disabled={isGeneratingAI}
                                            />
                                            <div className={styles.aiActions}>
                                                <button
                                                    className={styles.generateBtn}
                                                    onClick={handleGenerateAI}
                                                    disabled={!aiPrompt.trim() || isGeneratingAI}
                                                >
                                                    {isGeneratingAI ? (
                                                        <>
                                                            <span className={styles.miniSpinner}></span>
                                                            Generating...
                                                        </>
                                                    ) : (
                                                        'Generate'
                                                    )}
                                                </button>
                                                <button
                                                    className={styles.backBtn}
                                                    onClick={() => { setShowAIPrompt(false); setAiPrompt(''); }}
                                                    disabled={isGeneratingAI}
                                                >
                                                    Back
                                                </button>
                                            </div>
                                        </div>
                                        {aiImageHistory.length > 0 && (
                                            <>
                                                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', marginTop: '24px', marginBottom: '12px' }}>
                                                    Previous Generations
                                                </h4>
                                                <div className={styles.generatedImagesGrid}>
                                                    {aiImageHistory.map((img, index) => (
                                                        <button
                                                            key={`history-${index}`}
                                                            className={styles.generatedImageCard}
                                                            onClick={() => selectGeneratedImage(img)}
                                                        >
                                                            <img src={img} alt={`Previous ${index + 1}`} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}

                                {(generatedImages.length > 0 || aiImageHistory.length > 0) && (
                                    <>
                                        <h3 className={styles.modalTitle}>
                                            {generatedImages.length > 0 ? 'New Generated Images' : 'Previous Generated Images'}
                                        </h3>
                                        {generatedImages.length > 0 && (
                                            <div className={styles.generatedImagesGrid}>
                                                {generatedImages.map((img, index) => (
                                                    <button
                                                        key={`new-${index}`}
                                                        className={styles.generatedImageCard}
                                                        onClick={() => selectGeneratedImage(img)}
                                                    >
                                                        <img src={img} alt={`Generated ${index + 1}`} />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {aiImageHistory.length > 0 && (
                                            <>
                                                {generatedImages.length > 0 && (
                                                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', marginTop: '20px', marginBottom: '12px' }}>
                                                        Previous Generations
                                                    </h4>
                                                )}
                                                <div className={styles.generatedImagesGrid}>
                                                    {aiImageHistory
                                                        .filter(img => !generatedImages.includes(img))
                                                        .map((img, index) => (
                                                            <button
                                                                key={`history-${index}`}
                                                                className={styles.generatedImageCard}
                                                                onClick={() => selectGeneratedImage(img)}
                                                            >
                                                                <img src={img} alt={`Previous ${index + 1}`} />
                                                            </button>
                                                        ))}
                                                </div>
                                            </>
                                        )}
                                        <div className={styles.regenerateSection}>
                                            <button
                                                className={styles.regenerateBtn}
                                                onClick={() => {
                                                    setGeneratedImages([]);
                                                    setShowAIPrompt(true);
                                                }}
                                            >
                                                Generate New Images
                                            </button>
                                            {aiImageHistory.length > 0 && (
                                                <button
                                                    className={styles.clearHistoryBtn}
                                                    onClick={() => {
                                                        if (confirm('Clear all generated image history?')) {
                                                            setAiImageHistory([]);
                                                            setGeneratedImages([]);
                                                        }
                                                    }}
                                                    style={{
                                                        marginTop: '8px',
                                                        padding: '8px 16px',
                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                        color: '#dc2626',
                                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                                        borderRadius: '8px',
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                    }}
                                                >
                                                    Clear History
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>,
                        document.body
                    )}
                    {/* Desktop: render inline */}
                    {!isMobile && (
                        <div className={styles.modalOverlay} onClick={() => { if (!isGeneratingAI) { setShowImageOptions(false); setShowAIPrompt(false); } }}>
                            <div
                                className={`${styles.imageOptionsModal} ${isDraggingOver && !showAIPrompt && generatedImages.length === 0 ? styles.dragOver : ''}`}
                                onClick={(e) => e.stopPropagation()}
                                onDragOver={!showAIPrompt && generatedImages.length === 0 ? handleDragOver : undefined}
                                onDragLeave={!showAIPrompt && generatedImages.length === 0 ? handleDragLeave : undefined}
                                onDrop={!showAIPrompt && generatedImages.length === 0 ? handleDrop : undefined}
                            >
                                <button className={styles.modalClose} onClick={() => { setShowImageOptions(false); setShowAIPrompt(false); setIsDraggingOver(false); }} disabled={isGeneratingAI}>×</button>

                                {!showAIPrompt && generatedImages.length === 0 && (
                                    <>
                                        <h3 className={styles.modalTitle}>Add Image</h3>
                                        <div
                                            className={`${styles.dragDropArea} ${isDraggingOver ? styles.dragOver : ''}`}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {isDraggingOver ? (
                                                <>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="64" height="64">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                        <polyline points="17 8 12 3 7 8" />
                                                        <line x1="12" y1="3" x2="12" y2="15" />
                                                    </svg>
                                                    <p className={styles.dragDropText}>Drop your image here</p>
                                                </>
                                            ) : (
                                                <>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                        <polyline points="17 8 12 3 7 8" />
                                                        <line x1="12" y1="3" x2="12" y2="15" />
                                                    </svg>
                                                    <p className={styles.dragDropText}>Drag and drop your image here</p>
                                                    <p className={styles.dragDropSubtext}>or click to browse</p>
                                                </>
                                            )}
                                        </div>
                                        <div className={styles.imageOptionsButtons}>
                                            <button className={styles.imageOptionBtn} onClick={() => setShowAIPrompt(true)}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                                    <path d="M2 17l10 5 10-5" />
                                                    <path d="M2 12l10 5 10-5" />
                                                </svg>
                                                <span>Generate with AI</span>
                                            </button>
                                        </div>
                                    </>
                                )}

                                {showAIPrompt && generatedImages.length === 0 && (
                                    <>
                                        <h3 className={styles.modalTitle}>Generate with AI</h3>
                                        <div className={styles.aiPromptSection}>
                                            <label className={styles.promptLabel}>Enter your prompt:</label>
                                            <textarea
                                                className={styles.promptInput}
                                                value={aiPrompt}
                                                onChange={(e) => setAiPrompt(e.target.value)}
                                                placeholder="Describe the image you want to generate..."
                                                rows={4}
                                                disabled={isGeneratingAI}
                                            />
                                            <div className={styles.aiActions}>
                                                <button
                                                    className={styles.generateBtn}
                                                    onClick={handleGenerateAI}
                                                    disabled={!aiPrompt.trim() || isGeneratingAI}
                                                >
                                                    {isGeneratingAI ? (
                                                        <>
                                                            <span className={styles.miniSpinner}></span>
                                                            Generating...
                                                        </>
                                                    ) : (
                                                        'Generate'
                                                    )}
                                                </button>
                                                <button
                                                    className={styles.backBtn}
                                                    onClick={() => { setShowAIPrompt(false); setAiPrompt(''); }}
                                                    disabled={isGeneratingAI}
                                                >
                                                    Back
                                                </button>
                                            </div>
                                        </div>
                                        {aiImageHistory.length > 0 && (
                                            <>
                                                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', marginTop: '24px', marginBottom: '12px' }}>
                                                    Previous Generations
                                                </h4>
                                                <div className={styles.generatedImagesGrid}>
                                                    {aiImageHistory.map((img, index) => (
                                                        <button
                                                            key={`history-${index}`}
                                                            className={styles.generatedImageCard}
                                                            onClick={() => selectGeneratedImage(img)}
                                                        >
                                                            <img src={img} alt={`Previous ${index + 1}`} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}

                                {(generatedImages.length > 0 || aiImageHistory.length > 0) && (
                                    <>
                                        <h3 className={styles.modalTitle}>
                                            {generatedImages.length > 0 ? 'New Generated Images' : 'Previous Generated Images'}
                                        </h3>
                                        {generatedImages.length > 0 && (
                                            <div className={styles.generatedImagesGrid}>
                                                {generatedImages.map((img, index) => (
                                                    <button
                                                        key={`new-${index}`}
                                                        className={styles.generatedImageCard}
                                                        onClick={() => selectGeneratedImage(img)}
                                                    >
                                                        <img src={img} alt={`Generated ${index + 1}`} />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {aiImageHistory.length > 0 && (
                                            <>
                                                {generatedImages.length > 0 && (
                                                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', marginTop: '20px', marginBottom: '12px' }}>
                                                        Previous Generations
                                                    </h4>
                                                )}
                                                <div className={styles.generatedImagesGrid}>
                                                    {aiImageHistory
                                                        .filter(img => !generatedImages.includes(img))
                                                        .map((img, index) => (
                                                            <button
                                                                key={`history-${index}`}
                                                                className={styles.generatedImageCard}
                                                                onClick={() => selectGeneratedImage(img)}
                                                            >
                                                                <img src={img} alt={`Previous ${index + 1}`} />
                                                            </button>
                                                        ))}
                                                </div>
                                            </>
                                        )}
                                        <div className={styles.regenerateSection}>
                                            <button
                                                className={styles.regenerateBtn}
                                                onClick={() => {
                                                    setGeneratedImages([]);
                                                    setShowAIPrompt(true);
                                                }}
                                            >
                                                Generate New Images
                                            </button>
                                            {aiImageHistory.length > 0 && (
                                                <button
                                                    className={styles.clearHistoryBtn}
                                                    onClick={() => {
                                                        if (confirm('Clear all generated image history?')) {
                                                            setAiImageHistory([]);
                                                            setGeneratedImages([]);
                                                        }
                                                    }}
                                                    style={{
                                                        marginTop: '8px',
                                                        padding: '8px 16px',
                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                        color: '#dc2626',
                                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                                        borderRadius: '8px',
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                    }}
                                                >
                                                    Clear History
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
        </div>
    );
});

export default DesignEditor;
