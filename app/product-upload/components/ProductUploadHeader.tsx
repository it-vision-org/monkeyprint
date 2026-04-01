"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "../../styles/product-upload.module.css";
import mpStyles from "../../styles/monkeyprint.module.css";

type CartItem = {
  label: string;
  price: number;
  icon?: React.ReactNode;
};

type ProductUploadHeaderProps = {
  totalPrice: number;
  cartItems?: CartItem[];
  showPriceDetails?: boolean;
};

const BASE_PRICE = 20;
const DESIGN_FEE = 30;

export default function ProductUploadHeader({
  totalPrice,
  cartItems,
  showPriceDetails = true,
}: ProductUploadHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobilePriceExpanded, setMobilePriceExpanded] = useState(false);
  const [hasStore, setHasStore] = useState(false);

  // Check if user has a store
  useEffect(() => {
    async function checkStore() {
      try {
        const response = await fetch("/api/check-store");
        const data = await response.json();
        setHasStore(data.hasStore);
      } catch (error) {
        console.error("Error checking store:", error);
        setHasStore(false);
      }
    }
    checkStore();
  }, []);

  // Default cart items if not provided
  const defaultCartItems: CartItem[] = cartItems || [
    {
      label: "Articles (T-shirt)",
      price: BASE_PRICE,
      icon: (
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
      ),
    },
    {
      label: "Design",
      price: DESIGN_FEE,
      icon: (
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
      ),
    },
  ];

  // Mobile sticky cart bar
  const MobilePriceBar = () => (
    <div
      className={`${styles["pu-cart-container"]} ${styles["pu-cart-container-mobile"]}`}
    >
      <button
        className={styles["pu-cart-bar"]}
        type="button"
        aria-expanded={mobilePriceExpanded}
        onClick={() =>
          showPriceDetails && setMobilePriceExpanded((prev) => !prev)
        }
      >
        <div className={styles["pu-cart-content"]}>
          <svg
            className={styles["pu-cart-icon"]}
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
        <div className={styles["pu-cart-total"]}>
          <span className={styles["pu-cart-price"]}>{totalPrice}DT</span>
          {showPriceDetails && (
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
          )}
        </div>
      </button>
      {showPriceDetails && mobilePriceExpanded && (
        <div
          className={`${styles["pu-cart-details"]} ${styles["pu-cart-details-mobile"]}`}
        >
          <div className={styles["pu-cart-details-header"]}>
            <h3 className={styles["pu-cart-details-title"]}>Détails du prix</h3>
          </div>
          <div className={styles["pu-cart-items"]}>
            {defaultCartItems.map((item, index) => (
              <div key={index} className={styles["pu-cart-item"]}>
                <div className={styles["pu-cart-item-info"]}>
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <span className={styles["pu-cart-item-price"]}>
                  {item.price}DT
                </span>
              </div>
            ))}
          </div>
          <div className={styles["pu-cart-total-line"]}>
            <span className={styles["pu-cart-total-label"]}>Total</span>
            <span className={styles["pu-cart-total-price"]}>
              {totalPrice}DT
            </span>
          </div>
        </div>
      )}
    </div>
  );

  // Desktop expandable floating price widget
  const DesktopPriceWidget = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    const handleToggle = () => {
      if (isLocked) {
        setIsLocked(false);
        setIsExpanded(false);
      } else {
        setIsLocked(true);
        setIsExpanded(true);
      }
    };

    const handleMouseEnter = () => {
      if (!isLocked) {
        setIsExpanded(true);
      }
    };

    const handleMouseLeave = () => {
      if (!isLocked) {
        setIsExpanded(false);
      }
    };

    return (
      <div
        className={`${styles["pu-price-widget-desktop"]} ${isExpanded ? styles.expanded : ""} ${isLocked ? styles.locked : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Compact button view */}
        <button
          className={styles["pu-price-widget-trigger"]}
          type="button"
          onClick={handleToggle}
          aria-label="Voir le récapitulatif des prix"
        >
          <div className={styles["pu-price-widget-trigger-icon"]}>
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
          <div className={styles["pu-price-widget-trigger-price"]}>
            {totalPrice}DT
          </div>
        </button>

        {/* Expanded panel */}
        <div className={styles["pu-price-widget-panel"]}>
          <div className={styles["pu-price-widget-header"]}>
            <div className={styles["pu-price-widget-header-icon"]}>
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
            <div className={styles["pu-price-widget-header-title"]}>
              Récapitulatif
            </div>
          </div>
          <div className={styles["pu-price-widget-content"]}>
            <div className={styles["pu-price-widget-items"]}>
              {defaultCartItems.map((item, index) => (
                <div key={index} className={styles["pu-price-widget-item"]}>
                  <div className={styles["pu-price-widget-item-info"]}>
                    <div className={styles["pu-price-widget-item-icon"]}>
                      {item.icon}
                    </div>
                    <span className={styles["pu-price-widget-item-label"]}>
                      {item.label}
                    </span>
                  </div>
                  <span className={styles["pu-price-widget-item-price"]}>
                    {item.price}DT
                  </span>
                </div>
              ))}
            </div>
            <div className={styles["pu-price-widget-total"]}>
              <div className={styles["pu-price-widget-total-label"]}>Total</div>
              <div className={styles["pu-price-widget-total-price"]}>
                {totalPrice}DT
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <header className={styles["pu-header"]}>
        <div className={styles["pu-header-inner"]}>
          <div className={styles["pu-logo-container"]}>
            <Image src="/logo.png" alt="Monkey Print" width={84} height={42} />
          </div>
          <nav className={styles["pu-desktop-nav"]}>
            {hasStore ? (
              <>
                <Link
                  href="/dashboard/apercu"
                  className={styles["pu-desktop-nav-link"]}
                >
                  APERÇU
                </Link>
                <Link
                  href="/dashboard/produits"
                  className={styles["pu-desktop-nav-link"]}
                >
                  PRODUITS
                </Link>
                <Link
                  href="/dashboard/commandes"
                  className={styles["pu-desktop-nav-link"]}
                >
                  COMMANDES
                </Link>
                <Link
                  href="/dashboard/portefeuille"
                  className={styles["pu-desktop-nav-link"]}
                >
                  PORTEFEUILLE
                </Link>
                <Link
                  href="/dashboard/compte"
                  className={styles["pu-desktop-nav-link"]}
                >
                  COMPTE
                </Link>
              </>
            ) : (
              <>
                <Link href="/" className={styles["pu-desktop-nav-link"]}>
                  Accueil
                </Link>
                <Link href="/#stores" className={styles["pu-desktop-nav-link"]}>
                  Shop List
                </Link>
                <Link href="/contact" className={styles["pu-desktop-nav-link"]}>
                  Contactez-nous
                </Link>
              </>
            )}
          </nav>
          <button
            className={styles["pu-menu-trigger"]}
            type="button"
            aria-label="Ouvrir le menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className={styles["pu-menu-line"]}></span>
            <span className={styles["pu-menu-line"]}></span>
            <span className={styles["pu-menu-line"]}></span>
          </button>
        </div>
        {showPriceDetails && <MobilePriceBar />}
      </header>

      {/* Desktop expandable price widget */}
      {showPriceDetails && <DesktopPriceWidget />}

      {mobileMenuOpen && (
        <div
          className={mpStyles["mp-mobile-overlay"]}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className={styles["pu-mobile-sheet"]}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className={styles["pu-mobile-close"]}
              type="button"
              onClick={() => setMobileMenuOpen(false)}
            >
              ×
            </button>
            <nav className={styles["pu-mobile-menu"]}>
              {hasStore ? (
                <>
                  <Link
                    href="/dashboard/apercu"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Aperçu
                  </Link>
                  <Link
                    href="/dashboard/produits"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Produits
                  </Link>
                  <Link
                    href="/dashboard/commandes"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Commandes
                  </Link>
                  <Link
                    href="/dashboard/portefeuille"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Portefeuille
                  </Link>
                  <Link
                    href="/dashboard/compte"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Compte
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                    Accueil
                  </Link>
                  <Link href="/#stores" onClick={() => setMobileMenuOpen(false)}>
                    Shop List
                  </Link>
                  <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                    Contactez-nous
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
