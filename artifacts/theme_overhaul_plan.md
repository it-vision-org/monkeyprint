# Theme Overhaul Implementation Plan

## 1. Modular CSS System
- Create `theme-1.css`, `theme-2.css`, and `theme-3.css` in `app/styles/themes` with purely separate CSS Variables (`--primary`, `--background`, `--font-family`, etc.).
- Ensure that the dashboard customization at `http://localhost:3000/dashboard/theme` directly overwrites or previews these variables correctly.

## 2. Global/Scoped Reset
- Introduce a base layout for shops in `app/shop/[storeSlug]/layout.tsx` that dynamically imports or injects the CSS file based on the store's selected theme from the database/context.

## 3. Theme 1: The Modern Minimalist (Premium & Clean)
- **Aesthetics**: Monochromatic with strong typographic hierarchy, thin lines, ample whitespace, and subtle micro-animations (e.g., glassmorphism, slow fades).
- **Pages to Overhaul**: Shop Home, Product Details, All Products, Cart, Checkout, Order Confirmation.

## 4. Theme 2: The Bold Streetwear (Vibrant & Edgy)
- **Aesthetics**: Dark mode by default, intense neon accent colors (like hot pink or electric green), brutalist UI elements, marquee scrolling text, and heavy hover interactions.
- **Pages to Overhaul**: Shop Home, Product Details, All Products, Cart, Checkout, Order Confirmation.

## 5. Theme 3: The Elegant Boutique (Soft & Luxurious)
- **Aesthetics**: Earth tones, serif + sans-serif font pairings, soft drop shadows, rounded corners, warm and inviting layout.
- **Pages to Overhaul**: Shop Home, Product Details, All Products, Cart, Checkout, Order Confirmation.

## 6. Full Component Refactoring
- Rewrite `app/shop/[storeSlug]/page.tsx` and all inner pages to use a robust grid/flex layout responsive to the active theme's CSS variables, avoiding hard-coded colors/sizes.
- Enhance UI for Product Options, Cart interactions, and the Checkout Flow to feel like a multi-million-dollar e-commerce front.

Let's begin by setting up the 3 distinct base CSS files and variables.
