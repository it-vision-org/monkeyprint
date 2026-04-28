"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import StoreHeader from "../layout/StoreHeader";
import ProductCard from "../ui/ProductCard";
import type { Product } from "../types";
import type { ThemeConfig } from "../themes/themeConfig";
import { useCart } from "../providers/CartContext";
import { useState, type ComponentProps } from "react";

/* ============================================================
   Types
   ============================================================ */
type HeroContent = {
  title: string;
  subtitle: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  variant?: "simple" | "circles" | "background";
  circles?: Array<{ src: string; className: string }>;
  backgroundImage?: string;
};

type CategoryItem = {
  image: string;
  alt: string;
  label: string;
  imageWidth: number;
  imageHeight: number;
  className?: string;
};

type SectionItem = {
  title: string;
  type: "best-seller" | "products";
  products?: Product[];
  showViewAll?: boolean;
};

type ThemeStorePageProps = {
  theme: ThemeConfig;
  products: Product[];
  heroContent: HeroContent;
  categories: CategoryItem[];
  sections?: SectionItem[];
  customization?: Record<string, string | null | undefined>;
  storeSlug?: string;
};

type InternalProps = {
  theme: ThemeConfig;
  heroContent: HeroContent;
  categories: CategoryItem[];
  sections: SectionItem[];
  baseRoute: string;
  cartCount: number;
};

type SafeThemeImageProps = ComponentProps<typeof Image> & {
  fallbackSrc?: string;
};

function SafeThemeImage({
  src,
  fallbackSrc = "/logo.png",
  ...props
}: SafeThemeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <Image
      {...props}
      src={imgSrc}
      onError={() => {
        if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
      }}
    />
  );
}

/* ============================================================
   Shared product card props helper
   ============================================================ */
function getCardProps(theme: ThemeConfig) {
  return {
    className: theme.productCardClassName,
    imageClassName: theme.productImageClassName,
    infoClassName: theme.productInfoClassName,
    nameClassName: theme.productNameClassName,
    priceClassName: theme.productPriceClassName,
    ratingClassName: theme.productRatingClassName,
  };
}

/* ============================================================
   THEME 1 — "Médina"
   Mediterranean blue & white. Sidi Bou Said inspired.
   Clean, airy, welcoming. Lightweight.
   ============================================================ */
function Theme1({
  theme,
  heroContent,
  categories,
  sections,
  baseRoute,
  cartCount,
}: InternalProps) {
  const router = useRouter();
  const go = (path: string) => router.push(path);
  const image = heroContent.image || heroContent.backgroundImage;
  const pCard = getCardProps(theme);
  const titleWords = heroContent.title.split(" ");

  return (
    <div className="theme-1-page">
      <StoreHeader
        cartCount={cartCount}
        cartHref={`${baseRoute}/cart`}
        logoFilter={theme.logoFilter}
        className="theme-1-header"
        containerClassName="theme-1-container"
        cartButtonClassName="theme-1-cart-btn"
        cartBadgeClassName="theme-1-cart-badge"
        cartStrokeColor={theme.cartStrokeColor}
      />

      {/* Hero */}
      <section className="theme-1-hero">
        <div className="t1-hero-inner">
          <div className="t1-hero-left">
            <span className="t1-hero-season">Nouvelle Collection</span>
            <h1 className="t1-hero-headline">
              {titleWords.map((w, i) => (
                <span key={i} className="t1-hero-word">
                  {w}
                </span>
              ))}
            </h1>
            <div className="t1-hero-footer">
              <p className="t1-hero-sub">{heroContent.subtitle}</p>
              <button
                className="t1-hero-cta"
                onClick={() => go(`${baseRoute}/all-products`)}
              >
                Voir la collection <span className="t1-arrow">→</span>
              </button>
            </div>
          </div>
          {image && (
            <div className="t1-hero-visual">
              <SafeThemeImage
                src={image}
                alt={heroContent.title}
                width={heroContent.imageWidth || 400}
                height={heroContent.imageHeight || 480}
                quality={80}
                priority
                style={{ objectFit: "contain" }}
              />
            </div>
          )}
        </div>
      </section>

      {/* Ticker */}
      <div className="t1-ticker" aria-hidden="true">
        <div className="t1-ticker-track">
          {Array(6)
            .fill("NOUVELLE COLLECTION — T-SHIRTS — MODE — STYLE — ")
            .join("")}
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="t1-cats-section">
          <div className="t1-cats-label">
            <span>Catégories</span>
            <div className="t1-cats-line" />
          </div>
          <div className="t1-cats-grid">
            {categories.map((cat, i) => (
              <button
                key={i}
                className="theme-1-category"
                onClick={() => go(`${baseRoute}/all-products`)}
              >
                <div className="t1-cat-img">
                  <SafeThemeImage
                    src={cat.image}
                    alt=""
                    width={cat.imageWidth}
                    height={cat.imageHeight}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                    }}
                    sizes="(max-width:768px) 50vw, 33vw"
                  />
                </div>
                <span className="theme-1-category-label">{cat.label}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Product sections */}
      {sections.map(
        (section, si) =>
          section.products &&
          section.products.length > 0 && (
            <section key={si} className="theme-1-section">
              <div className="t1-section-header">
                <div className="t1-section-title-wrap">
                  <h2 className="theme-1-section-title">{section.title}</h2>
                  <div className="t1-section-rule" />
                </div>
                {section.showViewAll && (
                  <button
                    className="theme-1-view-all"
                    onClick={() => go(`${baseRoute}/all-products`)}
                  >
                    Tous les produits
                  </button>
                )}
              </div>
              <div className="t1-products-grid">
                {section.products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    href={`${baseRoute}/product/${p.id}`}
                    {...pCard}
                  />
                ))}
              </div>
            </section>
          ),
      )}
    </div>
  );
}

/* ============================================================
   THEME 2 — "Sahara"
   Warm sand & terracotta. Desert-inspired warmth.
   Earthy, inviting, elegant. Lightweight.
   ============================================================ */
function Theme2({
  theme,
  heroContent,
  categories,
  sections,
  baseRoute,
  cartCount,
}: InternalProps) {
  const router = useRouter();
  const go = (path: string) => router.push(path);
  const image = heroContent.image || heroContent.backgroundImage;
  const pCard = getCardProps(theme);

  return (
    <div className="theme-2-page">
      <StoreHeader
        cartCount={cartCount}
        cartHref={`${baseRoute}/cart`}
        logoFilter={theme.logoFilter}
        className="theme-2-header"
        containerClassName="theme-2-container"
        cartButtonClassName="theme-2-cart-btn"
        cartBadgeClassName="theme-2-cart-badge"
        cartStrokeColor={theme.cartStrokeColor}
      />

      {/* Hero: warm 50/50 split */}
      <section className="theme-2-hero">
        <div className="t2-hero-img-side">
          {image ? (
            <SafeThemeImage
              src={image}
              alt={heroContent.title}
              fill
              quality={75}
              priority
              style={{ objectFit: "contain" }}
              sizes="50vw"
            />
          ) : (
            <div className="t2-hero-img-fallback" />
          )}
        </div>
        <div className="t2-hero-text-side">
          <div className="t2-hero-badge">Nouvelle Collection</div>
          <h1 className="t2-hero-headline">
            {heroContent.title.split(" ").map((w, i) => (
              <span key={i} className="t2-hero-word">
                {w}
              </span>
            ))}
          </h1>
          <p className="t2-hero-sub">{heroContent.subtitle}</p>
          <div className="t2-hero-actions">
            <button
              className="t2-hero-cta-primary"
              onClick={() => go(`${baseRoute}/all-products`)}
            >
              <span>Découvrir la collection</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="t2-cats-strip">
          {categories.map((cat, i) => (
            <button
              key={i}
              className="theme-2-category"
              onClick={() => go(`${baseRoute}/all-products`)}
            >
              <SafeThemeImage
                src={cat.image}
                alt=""
                fill
                style={{ objectFit: "cover" }}
                sizes="33vw"
              />
              <div className="t2-cat-overlay" />
              <div className="t2-cat-info">
                <div>
                  <span className="theme-2-category-label">{cat.label}</span>
                </div>
                <span className="t2-cat-arrow">→</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Product sections */}
      {sections.map(
        (section, si) =>
          section.products &&
          section.products.length > 0 && (
            <section key={si} className="theme-2-section">
              <div className="t2-section-header">
                <span className="t2-section-code">{section.title}</span>
                {section.showViewAll && (
                  <button
                    className="theme-2-view-all"
                    onClick={() => go(`${baseRoute}/all-products`)}
                  >
                    Voir tout →
                  </button>
                )}
              </div>
              <div className="t2-products-grid">
                {section.products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    href={`${baseRoute}/product/${p.id}`}
                    {...pCard}
                  />
                ))}
              </div>
            </section>
          ),
      )}
    </div>
  );
}

/* ============================================================
   THEME 3 — "Jasmin"
   Fresh green & white. Tunisia's national flower.
   Modern, youthful, energetic. Lightweight.
   ============================================================ */
function Theme3({
  theme,
  heroContent,
  categories,
  sections,
  baseRoute,
  cartCount,
}: InternalProps) {
  const router = useRouter();
  const go = (path: string) => router.push(path);
  const bgImage = heroContent.backgroundImage || heroContent.image;
  const pCard = getCardProps(theme);

  return (
    <div className="theme-3-page">
      {/* Hero: full-width with content overlay */}
      <section className="theme-3-hero">
        {bgImage && (
          <div className="t3-hero-bg">
            <SafeThemeImage
              src={bgImage}
              alt={heroContent.title}
              fill
              quality={75}
              priority
              style={{ objectFit: "contain" }}
              sizes="100vw"
            />
          </div>
        )}
        <div className="t3-hero-gradient" />

        {/* Header floating over hero */}
        <StoreHeader
          cartCount={cartCount}
          cartHref={`${baseRoute}/cart`}
          logoFilter={theme.logoFilter}
          className="theme-3-header"
          containerClassName="theme-3-container"
          cartButtonClassName="theme-3-cart-btn"
          cartBadgeClassName="theme-3-cart-badge"
          cartStrokeColor={theme.cartStrokeColor}
        />

        <div className="t3-hero-content">
          <span className="t3-hero-tag">Nouvelle collection</span>
          <h1 className="t3-hero-headline">{heroContent.title}</h1>
          <p className="t3-hero-sub">{heroContent.subtitle}</p>
          <button
            className="t3-hero-cta"
            onClick={() => go(`${baseRoute}/all-products`)}
          >
            Découvrir la collection
          </button>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="t3-cats-section">
          <div className="t3-cats-intro">
            <h2 className="t3-cats-heading">Parcourir par catégorie</h2>
          </div>
          <div className="t3-cats-grid">
            {categories.map((cat, i) => (
              <button
                key={i}
                className="theme-3-category"
                onClick={() => go(`${baseRoute}/all-products`)}
              >
                <div className="t3-cat-img">
                  <SafeThemeImage
                    src={cat.image}
                    alt=""
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width:768px) 50vw, 33vw"
                  />
                </div>
                <div className="t3-cat-overlay" />
                <div className="t3-cat-info">
                  <span className="theme-3-category-label">{cat.label}</span>
                  <span className="t3-cat-cta">Explorer →</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Product sections */}
      {sections.map(
        (section, si) =>
          section.products &&
          section.products.length > 0 && (
            <section key={si} className="theme-3-section">
              <div className="t3-section-header">
                <h2 className="theme-3-section-title">{section.title}</h2>
                {section.showViewAll && (
                  <button
                    className="theme-3-view-all"
                    onClick={() => go(`${baseRoute}/all-products`)}
                  >
                    Voir tous les produits
                  </button>
                )}
              </div>
              <div className="t3-products-grid">
                {section.products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    href={`${baseRoute}/product/${p.id}`}
                    {...pCard}
                  />
                ))}
              </div>
            </section>
          ),
      )}
    </div>
  );
}

/* ============================================================
   Main export — switches between the 3 website UIs
   ============================================================ */
export default function ThemeStorePage({
  theme,
  heroContent,
  categories,
  sections,
}: ThemeStorePageProps) {
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const baseRoute = theme.baseRoute;

  const internal: InternalProps = {
    theme,
    heroContent,
    categories,
    sections: sections || [],
    baseRoute,
    cartCount,
  };

  if (theme.id === "theme-1") return <Theme1 {...internal} />;
  if (theme.id === "theme-2") return <Theme2 {...internal} />;
  return <Theme3 {...internal} />;
}
