"use client";

// Note: Using document.createElement('img') instead of new Image() to avoid conflict with Next.js Image
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../../styles/product-upload.module.css";
// ProductUploadHeader removed - using dashboard layout instead
import { combineDesigns } from "@/lib/utils/designRenderer";
import { useAlert } from "@/components/providers/AlertContext";
import ProductUploadSteps from "../../../product-upload/components/ProductUploadSteps";

type MockupCategory = {
  id: string;
  label: string;
  emoji: string;
};

const MOCKUP_CATEGORIES: MockupCategory[] = [
  { id: "male", label: "Homme", emoji: "👨" },
  { id: "female", label: "Femme", emoji: "👩" },
  { id: "boy", label: "Garçon", emoji: "👦" },
  { id: "girl", label: "Fille", emoji: "👧" },
  { id: "upload", label: "Téléverser", emoji: "📤" },
];

// MIN_PRICE will be loaded from API
const MIN_PRICE = 55;

// ─── Top-Level Sub-components ─────────────────────────────────────────────
// IMPORTANT: These must be defined OUTSIDE ProductDetailsPage.
// Defining components inside a parent component causes React to treat them as
// new component types on every render, triggering unmount/remount cycles
// which causes the sticky price bar and the "Retour à l'édition" button to jump.

type MobilePriceBarDetailsProps = {
  totalPrice: number;
  basePrice: number;
  designFee: number;
  qualityPrice: number;
  productTypeLabel: string;
  selectedQualityLabel: string;
  expanded: boolean;
  onToggle: () => void;
};

const MobilePriceBarDetails = memo(function MobilePriceBarDetails({
  totalPrice,
  basePrice,
  designFee,
  qualityPrice,
  productTypeLabel,
  selectedQualityLabel,
  expanded,
  onToggle,
}: MobilePriceBarDetailsProps) {
  return (
    <div className={`${styles.puCartContainer} ${styles.puCartContainerMobile}`}>
      <button
        className={styles.puCartBar}
        type="button"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <div className={styles.puCartContent}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.895 17 15 17.895 15 19C15 20.105 15.895 21 17 21C18.105 21 19 20.105 19 19C19 17.895 18.105 17 17 17ZM9 19C9 20.105 8.105 21 7 21C5.895 21 5 20.105 5 19C5 17.895 5.895 17 7 17C8.105 17 9 17.895 9 19Z" />
          </svg>
        </div>
        <div className={styles.puCartTotal}>
          <span className={styles.puCartPrice}>{totalPrice}DT</span>
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none" className={expanded ? styles.expanded : ""}>
            <path d="M1 1L8 8L15 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>
      {expanded && (
        <div className={styles.puCartDetails}>
          <div className={styles.puCartDetailsHeader}>
            <h3 className={styles.puCartDetailsTitle}>Détails du prix</h3>
          </div>
          <div className={styles.puCartItems}>
            <div className={styles.puCartItem}>
              <div className={styles.puCartItemInfo}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span>Articles ({productTypeLabel})</span>
              </div>
              <span className={styles.puCartItemPrice}>{basePrice}DT</span>
            </div>
            <div className={styles.puCartItem}>
              <div className={styles.puCartItemInfo}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                <span className={styles.puPriceWidgetItemLabel}>Qualité ({selectedQualityLabel})</span>
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

type DesktopPriceWidgetDetailsProps = {
  totalPrice: number;
  basePrice: number;
  designFee: number;
  qualityPrice: number;
  productTypeLabel: string;
  selectedQualityLabel: string;
  expanded: boolean;
  locked: boolean;
  onToggle: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

const DesktopPriceWidgetDetails = memo(function DesktopPriceWidgetDetails({
  totalPrice,
  basePrice,
  designFee,
  qualityPrice,
  productTypeLabel,
  selectedQualityLabel,
  expanded,
  locked,
  onToggle,
  onMouseEnter,
  onMouseLeave,
}: DesktopPriceWidgetDetailsProps) {
  return (
    <div
      className={`${styles.puPriceWidgetDesktop} ${expanded ? styles.expanded : ""} ${locked ? styles.locked : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button className={styles.puPriceWidgetTrigger} type="button" onClick={onToggle} aria-label="Voir le récapitulatif des prix">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.895 17 15 17.895 15 19C15 20.105 15.895 21 17 21C18.105 21 19 20.105 19 19C19 17.895 18.105 17 17 17ZM9 19C9 20.105 8.105 21 7 21C5.895 21 5 20.105 5 19C5 17.895 5.895 17 7 17C8.105 17 9 17.895 9 19Z" />
        </svg>
        <div className={styles.puPriceWidgetTriggerPrice}>{totalPrice}DT</div>
      </button>

      <div className={styles.puPriceWidgetPanel}>
        <div className={styles.puPriceWidgetHeader}>
          <div className={styles.puPriceWidgetHeaderIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </div>
                <span className={styles.puPriceWidgetItemLabel}>Articles ({productTypeLabel})</span>
              </div>
              <span className={styles.puPriceWidgetItemPrice}>{basePrice}DT</span>
            </div>
            <div className={styles.puPriceWidgetItem}>
              <div className={styles.puPriceWidgetItemInfo}>
                <div className={styles.puPriceWidgetItemIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <span className={styles.puPriceWidgetItemLabel}>Design</span>
              </div>
              <span className={styles.puPriceWidgetItemPrice}>{designFee}DT</span>
            </div>
            <div className={styles.puPriceWidgetItem}>
              <div className={styles.puPriceWidgetItemInfo}>
                <div className={styles.puPriceWidgetItemIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className={styles.puPriceWidgetItemLabel}>Qualité ({selectedQualityLabel})</span>
              </div>
              <span className={styles.puPriceWidgetItemPrice}>{qualityPrice}DT</span>
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
  const [mockupStep, setMockupStep] = useState<"category" | "template" | "loading" | "result" | "error">("category");
  const [selectedCategory, setSelectedCategory] = useState<string>("male");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("male_1");
  const [mockupLoading, setMockupLoading] = useState(false);
  const [mockupProgress, setMockupProgress] = useState(0);
  const [mockupStatus, setMockupStatus] = useState("");
  const [mockupError, setMockupError] = useState<string | null>(null);
  const [generatedMockup, setGeneratedMockup] = useState<string | null>(null);
  const [templateCatalog, setTemplateCatalog] = useState<Record<string, { id: string; index: number; name: string }[]>>({});
  const [isRenderingDesign, setIsRenderingDesign] = useState(true);
  const [combinedDesignImage, setCombinedDesignImage] = useState<string | null>(
    null,
  );
  // Load template catalog on mount
  useEffect(() => {
    async function loadTemplates() {
      try {
        const res = await fetch("/api/generate-mockup");
        const data = await res.json();
        if (data.catalog) setTemplateCatalog(data.catalog);
      } catch (e) {
        console.error("Failed to load template catalog:", e);
      }
    }
    loadTemplates();
  }, []);
  const [isFirstProduct, setIsFirstProduct] = useState<boolean>(true);
  const [minPrice, setMinPrice] = useState<number>(55);

  // Progress bar simulation — exponential ease, caps at 85%, resets on done
  useEffect(() => {
    if (!mockupLoading) {
      return;
    }
    setMockupProgress(5);
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 1;
      const p = Math.min(Math.round(5 + 80 * (1 - Math.exp(-elapsed * 0.04))), 85);
      setMockupProgress(p);
    }, 1000);
    return () => clearInterval(interval);
  }, [mockupLoading]);

  // Status message based on progress
  useEffect(() => {
    if (mockupProgress < 20) setMockupStatus("Initialisation…");
    else if (mockupProgress < 50) setMockupStatus("Application du design…");
    else if (mockupProgress < 80) setMockupStatus("Rendu de la texture…");
    else setMockupStatus("Finalisation…");
  }, [mockupProgress]);
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
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const mockupUploadInputRef = useRef<HTMLInputElement>(null);

  // Load design data and product data on mount
  useEffect(() => {
    const savedDesign = sessionStorage.getItem("uploadedDesign");
    const savedEditorData = sessionStorage.getItem("designEditorData");
    const editingProductId = sessionStorage.getItem("editingProductId");
    setIsEditingProduct(!!editingProductId);

    // Load pricing data from previous step
    const totalPriceStr = sessionStorage.getItem("productTotalPrice") || "20";
    const totalPriceVal = parseFloat(totalPriceStr);
    setBasePrice(
      parseFloat(sessionStorage.getItem("productBasePrice") || "20"),
    );
    setDesignFee(parseFloat(sessionStorage.getItem("productDesignFee") || "0"));
    setQualityPrice(
      parseFloat(sessionStorage.getItem("productQualityPrice") || "0"),
    );
    setSelectedQualityLabel(
      sessionStorage.getItem("productQualityLabel") || "Cotton",
    );
    setTotalPrice(totalPriceVal);
    setProductTypeLabel(
      sessionStorage.getItem("productTypeLabel") || "T-Shirt",
    );

    // If editing, load product data
    if (editingProductId) {
      const editingProductName = sessionStorage.getItem("editingProductName");
      const editingProductDescription = sessionStorage.getItem(
        "editingProductDescription",
      );
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
    } else {
      // New product: default "Prix du produit" and "Prix affiché" to (total + 10) so user gains 10 TND by default
      if (totalPriceStr && !isNaN(totalPriceVal)) {
        const defaultPrice = totalPriceVal + 10;
        const defaultPriceStr = Number.isInteger(defaultPrice) ? String(defaultPrice) : defaultPrice.toFixed(2);
        setProductPrice(defaultPriceStr);
        setDisplayPrice(defaultPriceStr);
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
        const response = await fetch("/api/product-config");
        const data = await response.json();
        if (data.pricingSettings) {
          setPricingSettings(data.pricingSettings);
          setMinPrice(data.pricingSettings.minPrice + 10 || 55);
          // Only set default from minPrice when no total from step 1 (avoid overwriting current price)
          const fromStep1 = sessionStorage.getItem("productTotalPrice");
          if (productPrice === "55" && !fromStep1) {
            setProductPrice(data.pricingSettings.minPrice?.toString() || "55");
            setDisplayPrice(data.pricingSettings.minPrice?.toString() || "55");
          }
        }
      } catch (error) {
        console.error("Error loading pricing settings:", error);
      }
    }
    loadPricingSettings();
  }, []);

  // Check if this is the first product
  useEffect(() => {
    async function checkProductCount() {
      try {
        const response = await fetch("/api/check-product-count");
        const data = await response.json();
        setIsFirstProduct(data.count === 0);
      } catch (error) {
        console.error("Error checking product count:", error);
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
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (!frontDesignImage && !backDesignImage) {
        return null;
      }
    }

    try {
      let combined: string;

      if (frontDesignImage && backDesignImage) {
        // Combine the preview images side by side
        const canvas = document.createElement("canvas");
        // Each preview is 400x500, so combined is 800x500
        canvas.width = 800; // 400 * 2
        canvas.height = 500;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          // Load and draw front image (left side)
          const frontImageEl = document.createElement("img");
          frontImageEl.crossOrigin = "anonymous";
          frontImageEl.src = frontDesignImage;
          await new Promise((resolve, reject) => {
            frontImageEl.onload = () => {
              ctx.drawImage(frontImageEl, 0, 0, 400, 500);
              resolve(null);
            };
            frontImageEl.onerror = reject;
          });

          // Load and draw back image (right side)
          const backImageEl = document.createElement("img");
          backImageEl.crossOrigin = "anonymous";
          backImageEl.src = backDesignImage;
          await new Promise((resolve, reject) => {
            backImageEl.onload = () => {
              ctx.drawImage(backImageEl, 400, 0, 400, 500);
              resolve(null);
            };
            backImageEl.onerror = reject;
          });

          combined = canvas.toDataURL("image/png", 1.0);
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
      console.error("Error generating combined image:", error);
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
      showAlert("Impossible de générer l'image combinée", "error");
      return;
    }

    // Create download link
    const link = document.createElement("a");
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
      showAlert("Impossible de générer l'image combinée", "error");
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

      if (!editorData || editorData.trim() === "") {
        designData = { front: null, back: null };
      } else {
        designData = JSON.parse(editorData);
      }

      const frontDesign = designData.front || null;
      const backDesign = designData.back || null;

      // Always render both front and back, even when empty
      // Render front design (always)
      try {
        const frontDesignToRender =
          frontDesign && frontDesign.trim() !== "" && frontDesign !== "null"
            ? frontDesign
            : emptyDesign;
        const frontImg = await renderDesignToImage(
          frontDesignToRender,
          400,
          500,
          "front",
        );
        setFrontDesignImage(frontImg);
      } catch (error) {
        console.error("Error rendering front design:", error);
      }

      // Render back design (always)
      try {
        const backDesignToRender =
          backDesign && backDesign.trim() !== "" && backDesign !== "null"
            ? backDesign
            : emptyDesign;
        const backImg = await renderDesignToImage(
          backDesignToRender,
          400,
          500,
          "back",
        );
        setBackDesignImage(backImg);
      } catch (error) {
        console.error("Error rendering back design:", error);
      }

      // Generate combined image for download/preview after images are set
      // Use setTimeout to ensure state is updated first
      setTimeout(() => {
        generateCombinedImage();
      }, 100);
    } catch (error) {
      console.error("Error rendering designs:", error);
      console.error("Editor data:", editorData?.substring(0, 200));
    } finally {
      setIsRenderingDesign(false);
    }
  };

  const renderDesignToImage = async (
    designJson: string,
    width: number = 400,
    height: number = 500,
    side: "front" | "back" = "front",
  ): Promise<string> => {
    // Import fabric correctly - when using dynamic import, fabric is the namespace
    const fabric = await import("fabric");

    // Get product type and color from sessionStorage
    const productType = sessionStorage.getItem("productType") || "tshirt";
    const productColor = sessionStorage.getItem("productColor") || "#ffffff";

    return new Promise((resolve, reject) => {
      try {
        if (!fabric || !fabric.StaticCanvas) {
          console.error("Fabric module structure:", Object.keys(fabric));
          throw new Error("Fabric.js StaticCanvas not available");
        }

        const canvas = new fabric.StaticCanvas(undefined, {
          width,
          height,
          backgroundColor: "transparent",
        });

        const design = JSON.parse(designJson);
        const { objects = [], w = width, h = height } = design;

        // Load product background image - use dynamic R2 picture from sessionStorage
        let imagePath: string | null;
        if (side === "front") {
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
            const img = document.createElement("img") as HTMLImageElement;
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => {
              // Fallback to front image if back doesn't exist
              if (side === "back") {
                const frontImagePath =
                  sessionStorage.getItem("productTypeImage");
                if (frontImagePath) {
                  const fallbackImg = document.createElement(
                    "img",
                  ) as HTMLImageElement;
                  fallbackImg.crossOrigin = "anonymous";

                  // Proxy R2 URLs if needed
                  const isExternalUrl =
                    frontImagePath.startsWith("http://") ||
                    frontImagePath.startsWith("https://");
                  const isLocalhost =
                    frontImagePath.includes("localhost") ||
                    frontImagePath.startsWith("/");
                  const finalSrc =
                    isExternalUrl && !isLocalhost
                      ? `/api/proxy-image?url=${encodeURIComponent(frontImagePath)}`
                      : frontImagePath;

                  fallbackImg.onload = () => resolve(fallbackImg);
                  fallbackImg.onerror = reject;
                  fallbackImg.src = finalSrc;
                } else {
                  reject(
                    new Error(
                      "Failed to load product image and no fallback available",
                    ),
                  );
                }
              } else {
                reject(new Error("Failed to load product image"));
              }
            };

            // Proxy R2 URLs if needed (external URLs that aren't localhost)
            const isExternalUrl =
              imagePath.startsWith("http://") ||
              imagePath.startsWith("https://");
            const isLocalhost =
              imagePath.includes("localhost") || imagePath.startsWith("/");
            const finalSrc =
              isExternalUrl && !isLocalhost
                ? `/api/proxy-image?url=${encodeURIComponent(imagePath)}`
                : imagePath;

            img.src = finalSrc;
          });
        };

        loadProductImage()
          .then((productImg) => {
            // Create fabric image from product image
            const bgImg = new fabric.FabricImage(productImg, {
              originX: "center",
              originY: "center",
            });

            const scale = Math.min(
              (width * 0.88) / (bgImg.width || 1),
              (height * 0.88) / (bgImg.height || 1),
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
            if (
              productColor &&
              productColor !== "#FFFFFF" &&
              productColor !== "#ffffff"
            ) {
              try {
                const blendFilter = new fabric.filters.BlendColor({
                  color: productColor,
                  mode: "multiply",
                  alpha: 0.6,
                });
                bgImg.filters = [blendFilter];
                bgImg.applyFilters();
              } catch (e) {
                console.warn("Could not apply color filter:", e);
              }
            }

            // Set as background
            canvas.backgroundImage = bgImg;
            canvas.renderAll();

            // Add design objects on top
            if (objects && objects.length > 0) {
              const scaleX = width / w;
              const scaleY = height / h;

              fabric.util
                .enlivenObjects(objects)
                .then(async (objs: any[]) => {
                  // Wait for all images to be fully loaded
                  const imagePromises = objs
                    .filter(
                      (obj) =>
                        obj.type === "image" ||
                        obj instanceof fabric.FabricImage,
                    )
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
                  await new Promise((resolve) => setTimeout(resolve, 100));

                  // Use requestAnimationFrame to ensure everything is rendered
                  requestAnimationFrame(() => {
                    const dataUrl = canvas.toDataURL({
                      format: "png",
                      quality: 1,
                      multiplier: 1,
                    });

                    canvas.dispose();
                    resolve(dataUrl);
                  });
                })
                .catch((error) => {
                  console.error("Error enlivening objects:", error);
                  canvas.dispose();
                  reject(error);
                });
            } else {
              // No design objects, just render background
              canvas.renderAll();
              requestAnimationFrame(() => {
                const dataUrl = canvas.toDataURL({
                  format: "png",
                  quality: 1,
                  multiplier: 1,
                });
                canvas.dispose();
                resolve(dataUrl);
              });
            }
          })
          .catch((error) => {
            console.error("Error loading product image:", error);
            // Fallback: render without background
            if (objects && objects.length > 0) {
              const scaleX = width / w;
              const scaleY = height / h;

              fabric.util
                .enlivenObjects(objects)
                .then(async (objs: any[]) => {
                  // Wait for all images to be fully loaded
                  const imagePromises = objs
                    .filter(
                      (obj) =>
                        obj.type === "image" ||
                        obj instanceof fabric.FabricImage,
                    )
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
                  await new Promise((resolve) => setTimeout(resolve, 100));

                  const dataUrl = canvas.toDataURL({
                    format: "png",
                    quality: 1,
                    multiplier: 1,
                  });
                  canvas.dispose();
                  resolve(dataUrl);
                })
                .catch((error) => {
                  console.error("Error enlivening objects (fallback):", error);
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
    const sellingPrice = parseFloat(productPrice) || 0;
    const costPrice = totalPrice || 0;

    if (!pricingSettings) {
      return sellingPrice - costPrice;
    }

    switch (pricingSettings.profitCalculationType) {
      case "PERCENTAGE":
        if (pricingSettings.profitPercentage) {
          return (sellingPrice * pricingSettings.profitPercentage) / 100;
        }
        return 0;
      case "FIXED":
        return pricingSettings.profitFixedAmount || 0;
      case "DIFFERENCE":
      default:
        return sellingPrice - costPrice;
    }
  }, [productPrice, totalPrice, pricingSettings]);

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    setCharCount(value.length);
  };

  const openMockupModal = () => {
    setMockupStep("category");
    setMockupError(null);
    setGeneratedMockup(null);
    setMockupModalOpen(true);
  };

  const closeMockupModal = () => {
    setMockupModalOpen(false);
    setMockupLoading(false);
    setGeneratedMockup(null);
  };

  const handleCategorySelect = (categoryId: string) => {
    if (categoryId === "upload") {
      // Close modal and trigger file upload
      closeMockupModal();
      mockupUploadInputRef.current?.click();
      return;
    }
    setSelectedCategory(categoryId);
    // Auto-select first template of category
    const templates = templateCatalog[categoryId];
    if (templates && templates.length > 0) {
      setSelectedTemplateId(templates[0].id);
    }
    setMockupStep("template");
  };

  const handleGenerateMockup = async () => {
    if (!designEditorData) {
      showAlert(
        "Aucun design trouvé. Veuillez retourner à l'éditeur de design.",
        "warning",
      );
      return;
    }

    setMockupStep("loading");
    setMockupLoading(true);
    setMockupProgress(0);
    setMockupError(null);
    setGeneratedMockup(null);

    try {
      // Use the front design image (the main design to put on the shirt)
      if (!frontDesignImage) {
        throw new Error(
          "Aucune image de design recto disponible. Veuillez retourner à l'éditeur.",
        );
      }

      // Get shirt color from sessionStorage
      const shirtColor = sessionStorage.getItem("productColor") || "#FFFFFF";

      const response = await fetch("/api/generate-mockup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          designImageBase64: frontDesignImage,
          templateId: selectedTemplateId,
          shirtColor,
        }),
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          error.error || `Échec de la génération: ${response.statusText}`,
        );
      }

      const data = await response.json();

      if (data.success && data.image) {
        setMockupProgress(100);
        setTimeout(() => {
          setGeneratedMockup(data.image);
          setMockupLoading(false);
          setMockupStep("result");
        }, 300);
      } else {
        throw new Error("Aucune image retournée par le serveur");
      }
    } catch (error: any) {
      console.error("Error generating mockup:", error);
      setMockupError(error.message || "Une erreur inconnue est survenue.");
      setMockupLoading(false);
      setMockupStep("error");
    }
  };

  const handleSelectMockup = (dataUrl: string) => {
    setSelectedMockup(dataUrl);
    sessionStorage.setItem("uploadedDesign", dataUrl);
    closeMockupModal();
  };

  const handleMockupFileSelected = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showAlert(
        "Veuillez choisir un fichier image (PNG, JPG, WebP…).",
        "warning",
      );
      return;
    }
    const maxMb = 12;
    if (file.size > maxMb * 1024 * 1024) {
      showAlert(`Image trop volumineuse (maximum ${maxMb} Mo).`, "warning");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setSelectedMockup(dataUrl);
      sessionStorage.setItem("uploadedDesign", dataUrl);
    };
    reader.onerror = () => {
      showAlert("Impossible de lire ce fichier.", "error");
    };
    reader.readAsDataURL(file);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const sellingPrice = parseFloat(productPrice) || 0;
    const costPrice = totalPrice || 0;

    if (!productName || !productPrice) {
      showAlert("Veuillez remplir le nom et le prix du produit.", "warning");
      return;
    }

    if (sellingPrice < costPrice) {
      showAlert(
        `Le prix de vente (${sellingPrice}DT) ne peut pas être inférieur au prix de revient (${costPrice}DT). Vous devez augmenter votre prix pour couvrir les frais de production.`,
        "error",
      );
      return;
    }

    // Check if user has selected a mockup or we need to use combined image
    let finalImage = selectedMockup;

    if (!finalImage) {
      // If no mockup selected, generate and use the combined image
      finalImage = combinedDesignImage || (await generateCombinedImage());
    }

    if (!finalImage) {
      showAlert(
        "Veuillez générer une maquette ou attendre que les aperçus se chargent.",
        "warning",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", productName);
      formData.append("description", description);
      formData.append("price", productPrice);
      formData.append(
        "type",
        sessionStorage.getItem("productType") || "tshirt",
      );
      formData.append("designData", designEditorData || "{}");

      // Send only the final mockup image
      formData.append("mockupImage", finalImage);

      // If editing, include product ID
      const editingProductId = sessionStorage.getItem("editingProductId");
      if (editingProductId) {
        formData.append("productId", editingProductId);
      }

      const { createProduct } = await import("../../../product-upload/actions");
      const result = await createProduct(formData);

      // Check if there's an error returned (not a redirect)
      if (result?.error) {
        showAlert(`Erreur: ${result.error}`, "error");
        setIsSubmitting(false);
      }
      // If no error and no result, redirect happened (which throws)
    } catch (error: any) {
      // Check if it's a Next.js redirect (which is expected and not an error)
      if (error?.digest?.startsWith("NEXT_REDIRECT")) {
        // This is normal - redirect is happening, product was saved successfully
        // Clean up edit mode sessionStorage
        sessionStorage.removeItem("editingProductId");
        sessionStorage.removeItem("editingProductName");
        sessionStorage.removeItem("editingProductDescription");
        sessionStorage.removeItem("editingProductPrice");
        return;
      }
      // Only show error for actual errors
      console.error("Product save error:", error);
      showAlert(
        "Une erreur est survenue lors de l'enregistrement du produit.",
        "error",
      );
      setIsSubmitting(false);
    }
  };

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleMobilePriceToggle = useCallback(() => {
    setMobilePriceExpanded((prev) => !prev);
  }, []);

  const handleDesktopPriceToggle = useCallback(() => {
    if (desktopPriceLocked) {
      setDesktopPriceLocked(false);
      setDesktopPriceExpanded(false);
    } else {
      setDesktopPriceLocked(true);
      setDesktopPriceExpanded(true);
    }
  }, [desktopPriceLocked]);

  const handleDesktopMouseEnter = useCallback(() => {
    if (!desktopPriceLocked) setDesktopPriceExpanded(true);
  }, [desktopPriceLocked]);

  const handleDesktopMouseLeave = useCallback(() => {
    if (!desktopPriceLocked) setDesktopPriceExpanded(false);
  }, [desktopPriceLocked]);

  return (
    <div className={styles.productUploadPage}>
      <MobilePriceBarDetails
        totalPrice={totalPrice}
        basePrice={basePrice}
        designFee={designFee}
        qualityPrice={qualityPrice}
        productTypeLabel={productTypeLabel}
        selectedQualityLabel={selectedQualityLabel}
        expanded={mobilePriceExpanded}
        onToggle={handleMobilePriceToggle}
      />
      <DesktopPriceWidgetDetails
        totalPrice={totalPrice}
        basePrice={basePrice}
        designFee={designFee}
        qualityPrice={qualityPrice}
        productTypeLabel={productTypeLabel}
        selectedQualityLabel={selectedQualityLabel}
        expanded={desktopPriceExpanded}
        locked={desktopPriceLocked}
        onToggle={handleDesktopPriceToggle}
        onMouseEnter={handleDesktopMouseEnter}
        onMouseLeave={handleDesktopMouseLeave}
      />
      <main
        className={`${styles.puMobileMain} ${mobilePriceExpanded ? styles.pdMainExpanded : ""}`}
      >
        <div className={styles.puMobileFlow}>
          <button
            type="button"
            className={styles.pdBackToEditor}
            onClick={handleBack}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Retour à l&apos;édition
          </button>
          <div className={styles.pdIntro}>
            <p className={styles.pdIntroTitle}>
              {isEditingProduct
                ? "Modifiez les détails de votre produit"
                : "Dernière étape, remplissez la description de votre produit"}
            </p>
            <span className={styles.pdIntroLine} />
          </div>

          <section className={styles.pdCard}>
            <h3
              className={styles.puCardSubtitle}
              style={{
                marginBottom: "20px",
                fontSize: "16px",
                fontWeight: 700,
                color: "#000",
              }}
            >
              Aperçu de votre design
            </h3>

            <div className={styles.pdPreviewCard}>
              {isRenderingDesign ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "300px",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div className={styles.puSpinner} />
                  <p
                    style={{
                      color: "rgba(255, 255, 255, 0.6)",
                      fontSize: "14px",
                      margin: 0,
                    }}
                  >
                    Chargement du design...
                  </p>
                </div>
              ) : (
                <div className={styles.pdDesignPreviewGrid}>
                  {/* Front Design */}
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: "16px",
                      padding: "16px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#0d1c23",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Recto
                    </span>
                    <div
                      style={{
                        width: "100%",
                        aspectRatio: "4/5",
                        background: "#f9fafb",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        border: "2px solid #e5e7eb",
                      }}
                    >
                      {frontDesignImage ? (
                        <img
                          src={frontDesignImage}
                          alt="Front Design"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            color: "#9ca3af",
                            fontSize: "12px",
                            textAlign: "center",
                            padding: "20px",
                          }}
                        >
                          Aucun design recto
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Back Design */}
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: "16px",
                      padding: "16px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#0d1c23",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Verso
                    </span>
                    <div
                      style={{
                        width: "100%",
                        aspectRatio: "4/5",
                        background: "#f9fafb",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        border: "2px solid #e5e7eb",
                      }}
                    >
                      {backDesignImage ? (
                        <img
                          src={backDesignImage}
                          alt="Back Design"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            color: "#9ca3af",
                            fontSize: "12px",
                            textAlign: "center",
                            padding: "20px",
                          }}
                        >
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
              <div
                style={{
                  marginTop: "24px",
                  padding: "20px",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  borderRadius: "16px",
                  border: "2px solid #41eb5c",
                  boxShadow: "0 4px 16px rgba(65, 235, 92, 0.15)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background:
                        "linear-gradient(135deg, #41eb5c 0%, #2dd44a 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#0d1c23",
                    }}
                  >
                    Maquette sélectionnée
                  </h4>
                </div>
                <div
                  style={{
                    width: "100%",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "2px solid #e5e7eb",
                    background: "#fff",
                  }}
                >
                  <img
                    src={selectedMockup}
                    alt="Selected Mockup"
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                    }}
                  />
                </div>
                <p
                  style={{
                    marginTop: "12px",
                    margin: 0,
                    fontSize: "13px",
                    color: "#6b7280",
                    textAlign: "center",
                    fontStyle: "italic",
                  }}
                >
                  Ceci est l'aperçu final de votre produit
                </p>
              </div>
            )}

            <input
              ref={mockupUploadInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className={styles.pdHiddenFileInput}
              aria-label="Téléverser une image de maquette"
              onChange={handleMockupFileSelected}
            />
            <div className={styles.pdActionRow}>
              <button
                type="button"
                className={styles.pdActionPrimary}
                onClick={openMockupModal}
                style={{ flex: "1", minWidth: "160px" }}
              >
                GÉNÉRER UNE MAQUETTE
              </button>
              <button
                type="button"
                className={styles.pdActionRefresh}
                onClick={() =>
                  designEditorData && renderUserDesigns(designEditorData)
                }
                title="Actualiser l'aperçu"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="1 4 1 10 7 10" />
                  <polyline points="23 20 23 14 17 14" />
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
                </svg>
              </button>
            </div>

            {/* Combined Image Actions */}
            {(frontDesignImage || backDesignImage) && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "16px",
                  background: "#f9fafb",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: "1", minWidth: "200px" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#0d1c23",
                      marginBottom: "4px",
                    }}
                  >
                    Image combinée (Recto + Verso)
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                    Téléchargez ou utilisez comme aperçu final
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={downloadCombinedImage}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      border: "2px solid #41eb5c",
                      background: "#ffffff",
                      color: "#41eb5c",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f0fdf4";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#ffffff";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
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
                      padding: "10px 20px",
                      borderRadius: "8px",
                      border: "none",
                      background:
                        "linear-gradient(135deg, #41eb5c 0%, #2dd44a 100%)",
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 2px 8px rgba(65, 235, 92, 0.3)",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(65, 235, 92, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(65, 235, 92, 0.3)";
                    }}
                  >
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
                {MOCKUP_CATEGORIES.filter(c => c.id !== "upload").map((option) => (
                  <label
                    key={option.id}
                    className={`${styles.pdRadioOption} ${selectedGenders.includes(option.id) ? styles.active : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedGenders.includes(option.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGenders([...selectedGenders, option.id]);
                        } else {
                          setSelectedGenders(
                            selectedGenders.filter((g) => g !== option.id),
                          );
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
                    className={`${styles.pdInput} ${profit < 0 ? styles.inputError : ""}`}
                    type="number"
                    min={minPrice}
                    value={productPrice}
                    onChange={(event) => setProductPrice(event.target.value)}
                  />
                  <span className={styles.pdInputSuffix}>DT</span>
                </div>
                <div className={styles.pdProfit}>
                  <span className={styles.pdProfitLabel}>
                    {profit < 0 ? "Perte" : "Tu prends"}
                  </span>
                  <button
                    type="button"
                    className={`${styles.pdProfitPill} ${profit < 0 ? styles.error : ""}`}
                  >
                    {profit.toFixed(0)}DT
                  </button>
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
                onChange={(event) =>
                  handleDescriptionChange(event.target.value)
                }
              />
              <div className={styles.pdTextareaCounter}>3000 Personnages</div>
            </div>
          </section>

          <ProductUploadSteps currentStep={2} />

          <button
            className={styles.pdSubmit}
            type="button"
            onClick={handleSubmit}
            disabled={profit < 0 || isSubmitting}
            style={
              profit < 0
                ? {
                    opacity: 0.5,
                    cursor: "not-allowed",
                    filter: "grayscale(1)",
                  }
                : {}
            }
          >
            {isSubmitting
              ? "PUBLICATION EN COURS..."
              : isEditingProduct
                ? "ENREGISTRER LES MODIFICATIONS"
                : "PUBLIER LE PRODUIT"}
          </button>
        </div>
      </main>

      {/* Mockup Generation Modal — unified multi-step */}
      {mockupModalOpen && (
        <div
          className={styles.puPopupOverlay}
          onClick={() => !mockupLoading && closeMockupModal()}
        >
          <div
            className={styles.puPopup}
            onClick={(event) => event.stopPropagation()}
            style={{
              maxWidth: mockupStep === "result" ? "700px" : "600px",
              padding: "32px",
            }}
          >
            <button
              className={styles.puPopupClose}
              type="button"
              onClick={closeMockupModal}
              disabled={mockupLoading}
              style={{
                top: "20px",
                right: "20px",
                fontSize: "28px",
                color: "#666",
              }}
            >
              ×
            </button>

            {/* Step 1: Category Selection */}
            {mockupStep === "category" && (
              <>
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                  <h2
                    className={styles.puPopupTitle}
                    style={{
                      fontSize: "28px",
                      fontWeight: 700,
                      color: "#0d1c23",
                      marginBottom: "12px",
                    }}
                  >
                    Générer une maquette
                  </h2>
                  <p
                    style={{
                      fontSize: "15px",
                      color: "#6b7280",
                      margin: 0,
                      lineHeight: "1.5",
                    }}
                  >
                    Choisissez une catégorie pour votre maquette.
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                    gap: "16px",
                    marginBottom: "24px",
                  }}
                >
                  {MOCKUP_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.id)}
                      style={{
                        padding: "20px 12px",
                        borderRadius: "16px",
                        border: "2px solid #e5e7eb",
                        backgroundColor: "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#41eb5c";
                        e.currentTarget.style.backgroundColor = "#f0fdf4";
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(0, 0, 0, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e5e7eb";
                        e.currentTarget.style.backgroundColor = "#ffffff";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 2px 8px rgba(0, 0, 0, 0.05)";
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "12px",
                          backgroundColor: "#f3f4f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "4px",
                          transition: "all 0.3s",
                        }}
                      >
                        <span style={{ fontSize: "24px" }}>{cat.emoji}</span>
                      </div>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#4b5563",
                          textAlign: "center",
                        }}
                      >
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Step 2: Template Selection */}
            {mockupStep === "template" && (
              <>
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <h2
                    className={styles.puPopupTitle}
                    style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      color: "#0d1c23",
                      marginBottom: "8px",
                    }}
                  >
                    Choisissez un modèle
                  </h2>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      margin: 0,
                    }}
                  >
                    {MOCKUP_CATEGORIES.find((c) => c.id === selectedCategory)
                      ?.label || selectedCategory}{" "}
                    — sélectionnez un modèle de maquette
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "16px",
                    marginBottom: "24px",
                  }}
                >
                  {(
                    templateCatalog[selectedCategory] || [
                      { id: "male_1", index: 0, name: "Modèle 1" },
                      { id: "male_1", index: 1, name: "Modèle 2" },
                      { id: "male_1", index: 2, name: "Modèle 3" },
                      { id: "male_1", index: 3, name: "Modèle 4" },
                    ]
                  ).map((tpl, idx) => {
                    const isSelected =
                      selectedTemplateId === tpl.id && idx === 0
                        ? true
                        : selectedTemplateId === `${tpl.id}_${idx}` ||
                          (selectedTemplateId === tpl.id && idx === 0);
                    return (
                      <button
                        key={`${tpl.id}-${idx}`}
                        type="button"
                        onClick={() => {
                          setSelectedTemplateId(tpl.id);
                        }}
                        style={{
                          padding: "0",
                          borderRadius: "16px",
                          border: isSelected
                            ? "3px solid #41eb5c"
                            : "2px solid #e5e7eb",
                          backgroundColor: "#ffffff",
                          cursor: "pointer",
                          transition: "all 0.3s",
                          overflow: "hidden",
                          boxShadow: isSelected
                            ? "0 8px 24px rgba(65, 235, 92, 0.15)"
                            : "0 2px 8px rgba(0, 0, 0, 0.05)",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = "#41eb5c";
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = "#e5e7eb";
                            e.currentTarget.style.transform = "translateY(0)";
                          }
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            aspectRatio: "2/3",
                            background: "#f9fafb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={`/api/mockup-templates/${tpl.id}/preview`}
                            alt={tpl.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            padding: "10px",
                            textAlign: "center",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: isSelected ? "#0d1c23" : "#6b7280",
                          }}
                        >
                          Modèle {idx + 1}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    justifyContent: "center",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setMockupStep("category")}
                    className={styles.pdActionSecondary}
                    style={{ minWidth: "120px" }}
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateMockup}
                    className={styles.pdActionPrimary}
                    style={{
                      padding: "14px 32px",
                      borderRadius: "12px",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#ffffff",
                      background:
                        "linear-gradient(135deg, #41eb5c 0%, #2dd44a 100%)",
                      boxShadow: "0 4px 16px rgba(65, 235, 92, 0.3)",
                      transition: "all 0.2s",
                      minWidth: "140px",
                    }}
                  >
                    Générer la maquette
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Loading */}
            {mockupStep === "loading" && (
              <>
                <h2 className={styles.puPopupTitle}>Création de la maquette</h2>
                <div className={styles.puMockupLoadingPanel}>
                  <div className={styles.puMockupOrb}>✦</div>
                  <p className={styles.puMockupLoadingTitle}>{mockupStatus}</p>
                  <div className={styles.puMockupProgressWrap}>
                    <div className={styles.puProgressContainer}>
                      <div
                        className={styles.puProgressBar}
                        style={{ width: `${mockupProgress}%` }}
                      />
                    </div>
                    <div className={styles.puMockupProgressMeta}>
                      <span className={styles.puMockupProgressLabel}>
                        Quelques secondes...
                      </span>
                      <span className={styles.puMockupProgressPct}>
                        {Math.round(mockupProgress)}%
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 4: Error */}
            {mockupStep === "error" && (
              <>
                <h2 className={styles.puPopupTitle}>Oups !</h2>
                <div className={styles.puErrorContainer}>
                  <div className={styles.puErrorIcon}>!</div>
                  <div className={styles.puErrorTitle}>
                    Échec de la génération
                  </div>
                  <div className={styles.puErrorText}>{mockupError}</div>
                  <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "16px" }}>
                    <button
                      type="button"
                      className={styles.pdActionSecondary}
                      onClick={() => setMockupStep("template")}
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      className={styles.puRetryBtn}
                      onClick={handleGenerateMockup}
                    >
                      Réessayer
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Step 5: Result */}
            {mockupStep === "result" && generatedMockup && (
              <div className={styles.puMockupConfirmWrap}>
                <div className={styles.puMockupConfirmHeader}>
                  <span className={styles.puMockupConfirmBadge}>
                    Maquette générée
                  </span>
                  <h2 className={styles.puMockupConfirmTitle}>
                    Voici votre maquette
                  </h2>
                  <p className={styles.puMockupConfirmLead}>
                    Validez pour l&apos;utiliser comme image principale du
                    produit, ou choisissez un autre modèle.
                  </p>
                </div>
                <div className={styles.puMockupPreviewShell}>
                  <div className={styles.puMockupPreviewInner}>
                    <img
                      src={generatedMockup}
                      alt="Aperçu maquette produit"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                </div>
                <p className={styles.puMockupConfirmHint}>
                  Cette image remplacera l&apos;aperçu actuel sur votre fiche
                  produit et en boutique.
                </p>
                <div className={styles.puMockupConfirmActions}>
                  <button
                    type="button"
                    className={styles.puMockupConfirmPrimary}
                    onClick={() => handleSelectMockup(generatedMockup)}
                  >
                    Utiliser cette maquette
                  </button>
                  <button
                    type="button"
                    className={styles.puMockupConfirmSecondary}
                    onClick={closeMockupModal}
                  >
                    Fermer
                  </button>
                  <button
                    type="button"
                    className={styles.puMockupConfirmLink}
                    onClick={() => setMockupStep("template")}
                  >
                    Choisir un autre modèle
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
