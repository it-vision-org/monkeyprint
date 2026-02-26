"use client";

import Image from "next/image";
import { useState, useCallback, useEffect, useMemo, memo } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "../../styles/product-upload.module.css";
import DesignEditor from "../../product-upload/components/DesignEditorNew";
import { getProductForEdit } from "../../product-upload/actions";

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

// These will be loaded from the API
let PRODUCT_TYPES: ProductCard[] = [];
let COLOR_SWATCHES: ColorSwatch[] = [];
let QUALITY_OPTIONS: QualityOption[] = [];
let DESIGN_FEE = 30;
let PRODUCT_PRICES: Record<string, number> = {};
let COLOR_FILTERS: Record<string, string> = {};

// Get product name for display
const getProductName = (
  productId: string,
  productTypes: ProductCard[],
): string => {
  const product = productTypes.find((p) => p.id === productId);
  return product?.name || "T-Shirt";
};

// ─── Top-Level Sub-components ─────────────────────────────────────────────
// IMPORTANT: These must be defined OUTSIDE ProductUploadPage.
// Defining components inside a parent component causes React to treat them as
// new component types on every render, triggering unmount/remount cycles
// and severe interaction lag (e.g., hovering the price widget re-mounts it).

type MobilePriceBarProps = {
  totalPrice: number;
  basePrice: number;
  designFee: number;
  qualityPrice: number;
  qualityLabel: string;
  productName: string;
  expanded: boolean;
  onToggle: () => void;
};

const MobilePriceBar = memo(function MobilePriceBar({
  totalPrice,
  basePrice,
  designFee,
  qualityPrice,
  qualityLabel,
  productName,
  expanded,
  onToggle,
}: MobilePriceBarProps) {
  return (
    <div
      className={`${styles.puCartContainer} ${styles.puCartContainerMobile}`}
    >
      <button
        className={styles.puCartBar}
        type="button"
        aria-expanded={expanded}
        onClick={onToggle}
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
            className={expanded ? styles.expanded : ""}
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
      {expanded && (
        <div
          className={`${styles.puCartDetails} ${styles.puCartDetailsMobile}`}
        >
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
                <span>Articles ({productName})</span>
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
                <span>Quality ({qualityLabel})</span>
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
});

type DesktopPriceWidgetProps = {
  totalPrice: number;
  basePrice: number;
  designFee: number;
  qualityPrice: number;
  qualityLabel: string;
  productName: string;
  expanded: boolean;
  locked: boolean;
  onExpand: (v: boolean) => void;
  onLock: (v: boolean) => void;
};

const DesktopPriceWidget = memo(function DesktopPriceWidget({
  totalPrice,
  basePrice,
  designFee,
  qualityPrice,
  qualityLabel,
  productName,
  expanded,
  locked,
  onExpand,
  onLock,
}: DesktopPriceWidgetProps) {
  const handleToggle = useCallback(() => {
    if (locked) {
      onLock(false);
      onExpand(false);
    } else {
      onLock(true);
      onExpand(true);
    }
  }, [locked, onLock, onExpand]);

  const handleMouseEnter = useCallback(() => {
    if (!locked) onExpand(true);
  }, [locked, onExpand]);

  const handleMouseLeave = useCallback(() => {
    if (!locked) onExpand(false);
  }, [locked, onExpand]);

  return (
    <div
      className={`${styles.puPriceWidgetDesktop} ${expanded ? styles.expanded : ""} ${locked ? styles.locked : ""}`}
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
                  Articles ({productName})
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
                  Quality ({qualityLabel})
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
});

export default function ProductUploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editProductId = searchParams.get("edit");
  const [isLoadingProduct, setIsLoadingProduct] = useState(!!editProductId);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [productTypes, setProductTypes] = useState<ProductCard[]>([]);
  const [productTypesFull, setProductTypesFull] = useState<any[]>([]);
  const [colorSwatches, setColorSwatches] = useState<ColorSwatch[]>([]);
  const [qualityOptions, setQualityOptions] = useState<QualityOption[]>([]);
  const [designFee, setDesignFee] = useState(30);
  const [productPrices, setProductPrices] = useState<Record<string, number>>(
    {},
  );
  const [colorFilters, setColorFilters] = useState<Record<string, string>>({});
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [activeColor, setActiveColorState] = useState<string>("");
  const [selectedQuality, setSelectedQuality] = useState<string>("");
  const [uploadedDesign, setUploadedDesign] = useState<string | null>(null);
  const [showAIPopup, setShowAIPopup] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiImages, setAiImages] = useState<string[]>([]);
  const [designEditorData, setDesignEditorData] = useState<string | null>(null);
  const [mobilePriceExpanded, setMobilePriceExpanded] = useState(false);
  const [desktopPriceExpanded, setDesktopPriceExpanded] = useState(false);
  const [desktopPriceLocked, setDesktopPriceLocked] = useState(false);
  // Initialize mask image from sessionStorage if available, no fallback
  const [productMaskImage, setProductMaskImage] = useState<string | null>(
    () => {
      if (typeof window !== "undefined") {
        const savedImage = sessionStorage.getItem("productTypeImage");
        if (savedImage) {
          const isExternalUrl =
            savedImage.startsWith("http://") ||
            savedImage.startsWith("https://");
          const isLocalhost =
            savedImage.includes("localhost") || savedImage.startsWith("/");
          return isExternalUrl && !isLocalhost
            ? `/api/proxy-image?url=${encodeURIComponent(savedImage)}`
            : savedImage;
        }
      }
      return null;
    },
  );

  // Store product images in sessionStorage when product type is selected
  useEffect(() => {
    if (selectedProduct && productTypesFull.length > 0) {
      const selectedProductType = productTypes.find(
        (p) => p.id === selectedProduct,
      );
      if (selectedProductType) {
        sessionStorage.setItem("productTypeImage", selectedProductType.image);
        // Get back image from stored full product type data
        const fullType = productTypesFull.find(
          (pt: any) => pt.slug === selectedProduct,
        );
        if (fullType?.backImage) {
          sessionStorage.setItem("productTypeBackImage", fullType.backImage);
        } else {
          // Clear back image if not available
          sessionStorage.removeItem("productTypeBackImage");
        }

        // Update mask image - proxy R2 URLs if needed for CSS masks
        const imageUrl = selectedProductType.image;
        if (imageUrl) {
          const isExternalUrl =
            imageUrl.startsWith("http://") || imageUrl.startsWith("https://");
          const isLocalhost =
            imageUrl.includes("localhost") || imageUrl.startsWith("/");
          // Proxy external R2 URLs for CSS masks to avoid CORS issues
          const maskUrl =
            isExternalUrl && !isLocalhost
              ? `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
              : imageUrl;
          setProductMaskImage(maskUrl);
        } else {
          // No image available, clear mask
          setProductMaskImage(null);
        }

        // Dispatch custom event to notify DesignEditor to reload images
        window.dispatchEvent(new Event("productImagesUpdated"));
      }
    } else {
      // Get from sessionStorage if available (e.g., on initial load)
      const savedImage = sessionStorage.getItem("productTypeImage");
      if (savedImage) {
        const isExternalUrl =
          savedImage.startsWith("http://") || savedImage.startsWith("https://");
        const isLocalhost =
          savedImage.includes("localhost") || savedImage.startsWith("/");
        const maskUrl =
          isExternalUrl && !isLocalhost
            ? `/api/proxy-image?url=${encodeURIComponent(savedImage)}`
            : savedImage;
        setProductMaskImage(maskUrl);
      } else {
        setProductMaskImage(null);
      }
    }
  }, [selectedProduct, productTypes, productTypesFull]);

  // Load product configuration from API
  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch("/api/product-config");
        if (!response.ok) {
          throw new Error("Failed to load product configuration");
        }
        const data = await response.json();

        // Store full product types data
        setProductTypesFull(data.productTypes || []);

        // Transform product types
        const types: ProductCard[] = (data.productTypes || []).map(
          (pt: any) => ({
            id: pt.slug,
            name: pt.name,
            image: pt.image,
            badge: `${pt.basePrice}DT`,
          }),
        );
        setProductTypes(types);

        // Build product prices map
        const prices: Record<string, number> = {};
        (data.productTypes || []).forEach((pt: any) => {
          prices[pt.slug] = pt.basePrice;
        });
        setProductPrices(prices);

        // Transform colors
        const colors: ColorSwatch[] = (data.colors || []).map((c: any) => ({
          id: c.id,
          hex: c.hex,
          label: c.name,
        }));
        setColorSwatches(colors);

        // Build color filters map
        const filters: Record<string, string> = {};
        (data.colors || []).forEach((c: any) => {
          if (c.filter) {
            filters[c.id] = c.filter;
          }
        });
        setColorFilters(filters);

        // Transform qualities
        const qualities: QualityOption[] = (data.qualities || []).map(
          (q: any) => ({
            id: q.id,
            label: q.name,
            price: q.price,
          }),
        );
        setQualityOptions(qualities);

        // Set pricing settings
        setDesignFee(data.pricingSettings?.designFee || 30);

        // Set default selections only if we have data
        if (types.length > 0 && !selectedProduct) {
          const defaultProductId = types[0].id;
          setSelectedProduct(defaultProductId);
          // Store images for default product immediately
          const defaultProductType = types.find(
            (p) => p.id === defaultProductId,
          );
          if (defaultProductType) {
            sessionStorage.setItem(
              "productTypeImage",
              defaultProductType.image,
            );
            const fullType = data.productTypes.find(
              (pt: any) => pt.slug === defaultProductId,
            );
            if (fullType?.backImage) {
              sessionStorage.setItem(
                "productTypeBackImage",
                fullType.backImage,
              );
            }
            // Set mask image for default product
            const imageUrl = defaultProductType.image;
            if (imageUrl) {
              const isExternalUrl =
                imageUrl.startsWith("http://") ||
                imageUrl.startsWith("https://");
              const isLocalhost =
                imageUrl.includes("localhost") || imageUrl.startsWith("/");
              const maskUrl =
                isExternalUrl && !isLocalhost
                  ? `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
                  : imageUrl;
              setProductMaskImage(maskUrl);
            } else {
              setProductMaskImage(null);
            }
          }
        }
        // Note: Default color and quality selection will be handled by useEffect hooks
        // that depend on selectedProduct and availableColors/availableQualities

        setConfigError(null);
      } catch (error: any) {
        console.error("Error loading product config:", error);
        setConfigError(
          error.message || "Erreur lors du chargement de la configuration",
        );
      } finally {
        setIsLoadingConfig(false);
      }
    }
    loadConfig();
  }, []);

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

  // Get available qualities for the selected product type
  const availableQualities = useMemo(() => {
    if (!selectedProduct || !productTypesFull.length) return [];
    const selectedType = productTypesFull.find(
      (pt: any) => pt.slug === selectedProduct,
    );
    if (!selectedType?.qualities) return [];
    return selectedType.qualities.map((q: any) => ({
      id: q.id,
      label: q.name,
      price: q.price,
    }));
  }, [selectedProduct, productTypesFull]);

  // Get available colors for the selected product type
  const availableColors = useMemo(() => {
    if (!selectedProduct || !productTypesFull.length) return colorSwatches;
    const selectedType = productTypesFull.find(
      (pt: any) => pt.slug === selectedProduct,
    );
    if (
      !selectedType?.availableColorIds ||
      selectedType.availableColorIds.length === 0
    ) {
      return colorSwatches; // Fallback to all colors if no specific colors defined
    }
    return colorSwatches.filter((swatch) =>
      selectedType.availableColorIds.includes(swatch.id),
    );
  }, [selectedProduct, productTypesFull, colorSwatches]);

  // Update selected quality if current one is not available for new product type
  useEffect(() => {
    if (availableQualities.length > 0) {
      const currentQualityExists = availableQualities.some(
        (q: QualityOption) => q.id === selectedQuality,
      );
      if (!currentQualityExists || !selectedQuality) {
        // Set to first available quality or default quality
        const defaultQuality =
          availableQualities.find((q: any) => q.isDefault) ||
          availableQualities[0];
        if (defaultQuality) {
          setSelectedQuality(defaultQuality.id);
        }
      }
    }
  }, [availableQualities, selectedQuality]);

  // Update selected colors if current ones are not available for new product type
  useEffect(() => {
    if (availableColors.length > 0) {
      const validColors = selectedColors.filter((colorId) =>
        availableColors.some((c) => c.id === colorId),
      );
      if (validColors.length === 0) {
        // No valid colors, set to first available
        setSelectedColors([availableColors[0].id]);
        setActiveColorState(availableColors[0].id);
      } else if (validColors.length !== selectedColors.length) {
        // Some colors were removed, update selection
        setSelectedColors(validColors);
        if (!validColors.includes(activeColor)) {
          setActiveColorState(validColors[0]);
        }
      } else if (selectedColors.length === 0) {
        // Initial setup: no colors selected yet
        setSelectedColors([availableColors[0].id]);
        setActiveColorState(availableColors[0].id);
      }
    }
  }, [availableColors, selectedColors, activeColor]);

  const qualityPrice =
    availableQualities.find(
      (option: QualityOption) => option.id === selectedQuality,
    )?.price ?? 0;
  const basePrice = productPrices[selectedProduct] ?? 20;
  const totalPrice = basePrice + designFee + qualityPrice;

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
  const orderedColors = useMemo(() => {
    // Safety check: if activeColor is not in selectedColors, use first selected color
    const validActiveColor = selectedColors.includes(activeColor)
      ? activeColor
      : selectedColors.length > 0
        ? selectedColors[0]
        : "";

    const activeSwatch = availableColors.find(
      (swatch) => swatch.id === validActiveColor,
    );
    const otherColors = selectedColors.filter((id) => id !== validActiveColor);
    const otherSwatches = otherColors
      .map((id) => availableColors.find((swatch) => swatch.id === id))
      .filter((swatch): swatch is ColorSwatch => swatch !== undefined);

    // Return active color first (for center), then others in their original order
    return activeSwatch ? [activeSwatch, ...otherSwatches] : otherSwatches;
  }, [activeColor, availableColors, selectedColors]);

  // Pre-compute hex brightness for all available colors to avoid inline calculations
  const colorBrightnessMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const swatch of availableColors) {
      const hex = swatch.hex.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      map[swatch.id] = (r * 299 + g * 587 + b * 114) / 1000 > 200;
    }
    return map;
  }, [availableColors]);

  // Memoize the active color hex to avoid inline .find() on every render
  const activeColorHex = useMemo(
    () => colorSwatches.find((s) => s.id === activeColor)?.hex || "#ffffff",
    [colorSwatches, activeColor],
  );

  // Memoize print area props to avoid recreating inline on every render (prevents DesignEditor re-renders)
  const selectedProductFull = useMemo(
    () => productTypesFull.find((pt: any) => pt.slug === selectedProduct),
    [productTypesFull, selectedProduct],
  );
  const printAreaFront = useMemo(
    () => selectedProductFull?.printAreaFront || null,
    [selectedProductFull],
  );
  const printAreaBack = useMemo(
    () => selectedProductFull?.printAreaBack || null,
    [selectedProductFull],
  );

  // Memoize quality label
  const selectedQualityLabel = useMemo(
    () =>
      availableQualities.find((o: QualityOption) => o.id === selectedQuality)
        ?.label || "Cotton",
    [availableQualities, selectedQuality],
  );

  // Memoize product name
  const selectedProductName = useMemo(
    () => getProductName(selectedProduct, productTypes),
    [selectedProduct, productTypes],
  );

  const handleNext = async () => {
    // Save uploaded design if exists
    if (uploadedDesign) {
      sessionStorage.setItem("uploadedDesign", uploadedDesign);
    }

    // Save product type and color for rendering background
    sessionStorage.setItem("productType", selectedProduct);
    const selectedProductType = productTypes.find(
      (p) => p.id === selectedProduct,
    );
    if (selectedProductType) {
      sessionStorage.setItem("productTypeImage", selectedProductType.image);
      // Get back image from stored full product type data
      const fullType = productTypesFull.find(
        (pt: any) => pt.slug === selectedProduct,
      );
      if (fullType?.backImage) {
        sessionStorage.setItem("productTypeBackImage", fullType.backImage);
      }
    }
    const activeColorHex =
      colorSwatches.find((s) => s.id === activeColor)?.hex || "#ffffff";
    sessionStorage.setItem("productColor", activeColorHex);

    // Save pricing details for the details page
    sessionStorage.setItem("productBasePrice", basePrice.toString());
    sessionStorage.setItem("productDesignFee", designFee.toString());
    sessionStorage.setItem("productQualityPrice", qualityPrice.toString());
    const qualityLabel =
      availableQualities.find((o: QualityOption) => o.id === selectedQuality)
        ?.label || "Cotton";
    sessionStorage.setItem("productQualityLabel", qualityLabel);
    sessionStorage.setItem("productTotalPrice", totalPrice.toString());

    // Save product type label
    const selectedTypeLabel = getProductName(selectedProduct, productTypes);
    sessionStorage.setItem("productTypeLabel", selectedTypeLabel);

    // Force save design editor data before navigation
    // Get the latest from sessionStorage first (in case auto-save already happened)
    const latestDesignData = sessionStorage.getItem("designEditorData");

    if (latestDesignData) {
      console.log(
        "Saving design data before navigation:",
        latestDesignData.substring(0, 200),
      );
      sessionStorage.setItem("designEditorData", latestDesignData);
    } else {
      // If no design data exists, save empty structure to ensure consistency
      const emptyDesign = JSON.stringify({ front: null, back: null });
      console.log("No design data, saving empty structure");
      sessionStorage.setItem("designEditorData", emptyDesign);
    }

    // Verify it was saved
    const verify = sessionStorage.getItem("designEditorData");
    console.log("Verified saved design data:", verify?.substring(0, 200));

    // Navigate immediately - sessionStorage is synchronous
    router.push("/dashboard/product-upload/details");
  };

  const handleDesignChange = (designData: string) => {
    // DO NOT update state here to avoid massive lag/re-rendering of the entire page
    // setDesignEditorData(designData);
    // Auto-save is now handled in the DesignEditor component which saves to sessionStorage directly
  };

  // Removed handleDesignSave - auto-save is now automatic in DesignEditor

  // Load product data if in edit mode
  useEffect(() => {
    async function loadProductData() {
      if (!editProductId) {
        // Not in edit mode, just load saved design if exists
        const savedDesign = sessionStorage.getItem("designEditorData");
        if (savedDesign) {
          setDesignEditorData(savedDesign);
        }
        setIsLoadingProduct(false);
        return;
      }

      try {
        const result = await getProductForEdit(editProductId);
        if (result.error) {
          console.error("Error loading product:", result.error);
          router.push("/dashboard/produits");
          return;
        }

        if (result.product) {
          const product = result.product;

          // Set product type
          setSelectedProduct(product.type || "tshirt");

          // Load design data
          if (product.designData) {
            try {
              // Validate that designData is valid JSON
              const parsed = JSON.parse(product.designData);
              // Ensure it has the expected structure
              const designData =
                typeof parsed === "object" && parsed !== null
                  ? JSON.stringify({
                      front: parsed.front || null,
                      back: parsed.back || null,
                    })
                  : JSON.stringify({ front: null, back: null });
              setDesignEditorData(designData);
              sessionStorage.setItem("designEditorData", designData);
            } catch (e) {
              console.error("Error parsing designData:", e);
              // Use empty design if parsing fails
              const emptyDesign = JSON.stringify({ front: null, back: null });
              setDesignEditorData(emptyDesign);
              sessionStorage.setItem("designEditorData", emptyDesign);
            }
          } else {
            // No design data, use empty structure
            const emptyDesign = JSON.stringify({ front: null, back: null });
            setDesignEditorData(emptyDesign);
            sessionStorage.setItem("designEditorData", emptyDesign);
          }

          // Set product type and default color in sessionStorage for design rendering
          sessionStorage.setItem(
            "productType",
            product.type || selectedProduct || "tshirt",
          );
          const defaultColorHex =
            colorSwatches.find((s) => s.id === activeColor)?.hex ||
            colorSwatches[0]?.hex ||
            "#1c1c1c";
          sessionStorage.setItem("productColor", defaultColorHex);

          // Load preview image if exists
          if (product.previewFront) {
            setUploadedDesign(product.previewFront);
            sessionStorage.setItem("uploadedDesign", product.previewFront);
          }

          // Store product ID for later use in details page
          sessionStorage.setItem("editingProductId", editProductId);
          sessionStorage.setItem("editingProductName", product.name);
          sessionStorage.setItem(
            "editingProductDescription",
            product.description || "",
          );
          sessionStorage.setItem(
            "editingProductPrice",
            product.basePrice.toString(),
          );
        }
      } catch (error) {
        console.error("Error loading product for edit:", error);
        router.push("/dashboard/produits");
      } finally {
        setIsLoadingProduct(false);
      }
    }

    loadProductData();
  }, [editProductId, router, activeColor]);

  // (MobilePriceBar and DesktopPriceWidget are top-level memo'd components - see above the default export)

  if (isLoadingProduct || isLoadingConfig) {
    return (
      <div className={styles.productUploadPage}>
        <main className={styles.puMobileMain}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "60vh",
              gap: "24px",
            }}
          >
            <div className={styles.puSpinner} />
            <p style={{ color: "white", fontSize: "16px", fontWeight: 600 }}>
              {isLoadingConfig
                ? "Chargement de la configuration..."
                : "Chargement du produit..."}
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (configError) {
    return (
      <div className={styles.productUploadPage}>
        <main className={styles.puMobileMain}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "80vh",
              gap: "32px",
              padding: "40px 20px",
              textAlign: "center",
              background: "rgba(254, 242, 242, 0.95)",
              borderRadius: "32px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 40px rgba(239, 68, 68, 0.3)",
                marginBottom: "8px",
              }}
            >
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <div
              style={{
                maxWidth: "500px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <h2
                style={{
                  color: "#ff3b3b",
                  fontSize: "28px",
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: "1.2",
                }}
              >
                Erreur de chargement
              </h2>
              <p
                style={{
                  color: "white",
                  fontSize: "16px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                {configError}
              </p>
            </div>

            <button
              onClick={() => {
                setConfigError(null);
                setIsLoadingConfig(true);
                window.location.reload();
              }}
              className={styles.puNextCta}
              style={{ maxWidth: "240px" }}
            >
              Réessayer
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (productTypes.length === 0) {
    return (
      <div className={styles.productUploadPage}>
        <main className={styles.puMobileMain}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "80vh",
              gap: "32px",
              padding: "40px 20px",
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "32px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #41eb5c 0%, #2dd44a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 40px rgba(65, 235, 92, 0.3)",
                marginBottom: "8px",
              }}
            >
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>

            <div
              style={{
                maxWidth: "500px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <h2
                style={{
                  color: "#41eb5c",
                  fontSize: "28px",
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: "1.2",
                }}
              >
                Aucun type de produit disponible
              </h2>
              <p
                style={{
                  color: "white",
                  fontSize: "16px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                Pour commencer à créer des produits, vous devez d'abord
                configurer les types de produits dans le panneau
                d'administration.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                width: "100%",
                maxWidth: "400px",
                marginTop: "8px",
              }}
            >
              <a
                href="/admin/product-config"
                className={styles.puNextCta}
                style={{ textDecoration: "none", textAlign: "center" }}
              >
                Configurer les produits
              </a>

              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "14px 32px",
                  background: "transparent",
                  color: "#41eb5c",
                  border: "2px solid #41eb5c",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "15px",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(65, 235, 92, 0.1)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Actualiser la page
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`${styles.productUploadPage} product-upload-page`}>
      {/* Mobile sticky price bar */}
      <MobilePriceBar
        totalPrice={totalPrice}
        basePrice={basePrice}
        designFee={designFee}
        qualityPrice={qualityPrice}
        qualityLabel={selectedQualityLabel}
        productName={selectedProductName}
        expanded={mobilePriceExpanded}
        onToggle={() => setMobilePriceExpanded((prev) => !prev)}
      />

      {/* Desktop floating price widget */}
      <DesktopPriceWidget
        totalPrice={totalPrice}
        basePrice={basePrice}
        designFee={designFee}
        qualityPrice={qualityPrice}
        qualityLabel={selectedQualityLabel}
        productName={selectedProductName}
        expanded={desktopPriceExpanded}
        locked={desktopPriceLocked}
        onExpand={setDesktopPriceExpanded}
        onLock={setDesktopPriceLocked}
      />

      <main
        className={`${styles.puMobileMain} ${styles.puMainDesktop} dashboard-pu-mobile-main`}
        style={{ paddingBottom: mobilePriceExpanded ? "260px" : "120px" }}
      >
        <div className={styles.puMobileFlow}>
          <div className={styles.puIntro}>
            <p className={styles.puIntroTitle}>
              {editProductId
                ? "Modifiez votre produit"
                : "Créez votre propre produit"}
            </p>
            <span className={styles.puIntroLine} />
          </div>

          <section className={styles.puCard}>
            <h2 className={styles.puCardTitle}>
              Choisissez le type de produit
            </h2>
            <div className={styles.puProductGrid}>
              {productTypes.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className={`${styles.puProductCell} ${selectedProduct === product.id ? styles.active : ""}`}
                  onClick={() => setSelectedProduct(product.id)}
                >
                  {product.badge && (
                    <span className={styles.puProductBadge}>
                      {product.badge}
                    </span>
                  )}
                  <div className={styles.puProductImage}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={120}
                      height={120}
                    />
                  </div>
                  <span className={styles.puProductLabel}>{product.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className={styles.puCard}>
            <h3 className={styles.puCardSubtitle}>Couleurs disponibles :</h3>
            <div className={styles.puColorWrapper}>
              <div className={styles.puColorHero}>
                {orderedColors.map((swatch, index) => {
                  const isActive = index === 0;
                  const distanceFromCenter = index;
                  const scale = Math.max(0.6, 1 - distanceFromCenter * 0.15);
                  const zIndex = isActive ? 100 : 50 - distanceFromCenter;

                  let offset = 0;
                  if (index > 0) {
                    const sideIndex = Math.floor((index - 1) / 2) + 1;
                    const isLeft = (index - 1) % 2 === 0;
                    offset = isLeft ? -sideIndex * 70 : sideIndex * 70;
                  }

                  if (!productMaskImage) {
                    return null;
                  }

                  return (
                    <div
                      key={swatch.id}
                      className={`${styles.puShirt} ${isActive ? styles.active : ""}`}
                      style={{
                        left: "50%",
                        transform: `translate(calc(-50% + ${offset}px), -50%) scale(${scale})`,
                        zIndex: zIndex,
                      }}
                    >
                      {/* Border/shadow layer - behind the t-shirt */}
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: "102px",
                          height: "122px",
                          backgroundColor: "rgba(0, 0, 0, 0.6)",
                          WebkitMask: productMaskImage
                            ? `url(${productMaskImage}) no-repeat center / contain`
                            : "none",
                          mask: productMaskImage
                            ? `url(${productMaskImage}) no-repeat center / contain`
                            : "none",
                          zIndex: 0,
                        }}
                      />
                      {/* White halo layer */}
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: "98px",
                          height: "118px",
                          backgroundColor: "rgba(255, 255, 255, 1)",
                          WebkitMask: productMaskImage
                            ? `url(${productMaskImage}) no-repeat center / contain`
                            : "none",
                          mask: productMaskImage
                            ? `url(${productMaskImage}) no-repeat center / contain`
                            : "none",
                          zIndex: 1,
                        }}
                      />
                      {/* Main t-shirt */}
                      <div
                        style={{
                          width: "90px",
                          height: "110px",
                          backgroundColor: swatch.hex,
                          WebkitMask: productMaskImage
                            ? `url(${productMaskImage}) no-repeat center / contain`
                            : "none",
                          mask: productMaskImage
                            ? `url(${productMaskImage}) no-repeat center / contain`
                            : "none",
                          position: "relative",
                          zIndex: 2,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className={styles.puColorSwatches}>
                {availableColors.map((swatch) => {
                  const isSelected = selectedColors.includes(swatch.id);
                  const isActive = swatch.id === activeColor;
                  const isLight = colorBrightnessMap[swatch.id] ?? false;

                  return (
                    <button
                      key={swatch.id}
                      type="button"
                      className={`${styles.puColorDot} ${isSelected ? styles.active : ""} ${isActive && isSelected ? styles.selected : ""}`}
                      style={{
                        background: swatch.hex,
                        border: isLight
                          ? "2px solid rgba(0, 0, 0, 0.15)"
                          : "none",
                        boxShadow: isLight
                          ? "0 0 0 2px rgba(255, 255, 255, 0.5), 0 0 8px rgba(0, 0, 0, 0.1)"
                          : "none",
                      }}
                      onClick={() => toggleColor(swatch.id)}
                      title={swatch.label}
                    >
                      {isSelected && (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={isLight ? "#000000" : "#ffffff"}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            pointerEvents: "none",
                            filter: isLight
                              ? "drop-shadow(0 0 2px rgba(255, 255, 255, 0.8))"
                              : "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))",
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

          <section className={styles.puCard}>
            <div
              className={styles.puCardHeader}
              style={{ padding: "20px 18px 0" }}
            >
              <h3 className={styles.puCardSubtitle}>Modifiez votre design</h3>
              <span className={styles.puPriceTag}>
                À partir de {designFee} DT
              </span>
            </div>

            <div className={styles.puDesignEditorContainer}>
              <DesignEditor
                productType={selectedProduct}
                productColor={activeColorHex}
                initialDesign={designEditorData}
                onDesignChange={handleDesignChange}
                printAreaFront={printAreaFront}
                printAreaBack={printAreaBack}
              />
            </div>
            <div style={{ padding: "16px 18px" }}>
              <span className={styles.puPreviewLabel}>Couleurs d'aperçu</span>
              <div className={styles.puMiniSwatches}>
                {selectedColors.map((colorId) => {
                  const swatch =
                    availableColors.find((c) => c.id === colorId) ||
                    colorSwatches.find((c) => c.id === colorId);
                  const isActive = colorId === activeColor;
                  const isLight = colorBrightnessMap[colorId] ?? false;

                  return (
                    <button
                      key={colorId}
                      type="button"
                      className={`${styles.puMiniDot} ${isActive ? styles.active : ""}`}
                      style={{
                        background: swatch?.hex,
                        border: isLight
                          ? "2px solid rgba(0, 0, 0, 0.15)"
                          : "none",
                        boxShadow: isLight
                          ? "0 0 0 2px rgba(255, 255, 255, 0.5), 0 0 8px rgba(0, 0, 0, 0.1)"
                          : "none",
                      }}
                      onClick={() => setActiveColor(colorId)}
                      title={swatch?.label}
                    />
                  );
                })}
              </div>
            </div>
          </section>

          <section className={styles.puCard} style={{ gap: "14px" }}>
            <h3 className={styles.puCardSubtitle}>
              Select quality of the product
            </h3>
            <div className={styles.puQualityRow}>
              {availableQualities.map((option: QualityOption) => (
                <button
                  key={option.id}
                  type="button"
                  className={`${styles.puQualityPill} ${selectedQuality === option.id ? styles.active : ""}`}
                  onClick={() => setSelectedQuality(option.id)}
                >
                  <span className={styles.puQualityLabel}>{option.label}</span>
                  <span className={styles.puQualityPrice}>
                    {option.price === 0 ? "Inclus" : `+${option.price}DT`}
                  </span>
                </button>
              ))}
            </div>
            <div className={styles.puSummary}>
              <div className={styles.puSummaryRow}>
                <span>
                  Articles ({getProductName(selectedProduct, productTypes)})
                </span>
                <span>{basePrice}DT</span>
              </div>
              <div className={styles.puSummaryRow}>
                <span>Design</span>
                <span>{designFee}DT</span>
              </div>
              <div className={styles.puSummaryRow}>
                <span>Quality</span>
                <span>{qualityPrice}DT</span>
              </div>
              <div className={styles.puSummaryTotal}>
                <span>Article Prix Base</span>
                <span>{totalPrice}DT</span>
              </div>
            </div>
          </section>

          <button
            className={styles.puNextCta}
            type="button"
            onClick={handleNext}
          >
            {editProductId ? "SUIVANT (MODIFIER)" : "SUIVANT"}
          </button>
        </div>
      </main>

      {showAIPopup && (
        <div
          className={styles.puPopupOverlay}
          onClick={() => !isLoadingAI && setShowAIPopup(false)}
        >
          <div
            className={styles.puPopup}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className={styles.puPopupClose}
              type="button"
              onClick={() => setShowAIPopup(false)}
              disabled={isLoadingAI}
            >
              ×
            </button>
            <h2 className={styles.puPopupTitle}>
              Choisissez votre design généré par IA
            </h2>
            {isLoadingAI ? (
              <div className={styles.puLoading}>
                <div className={styles.puSpinner} />
                <p>Génération en cours...</p>
              </div>
            ) : (
              <div className={styles.puAiGrid}>
                {aiImages.map((img, index) => (
                  <button
                    key={img}
                    type="button"
                    className={styles.puAiImageCard}
                    onClick={() => selectAIImage(img)}
                  >
                    <Image
                      src={img}
                      alt={`Design ${index + 1}`}
                      width={200}
                      height={200}
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
