# Mobile QA/UX Production Readiness Review — Pass 2

Date: 2026-04-02  
Scope: Seller dashboard + storefront deep audit, public pages regression, mobile-only  
Viewports tested: `390x844` (primary), `360x800` (secondary), `412x915` (sanity)  
Method: Live browser validation with Playwright MCP, with in-place localized fixes

## Executive summary

- **Result: FAIL (No-Go)**
- **Mobile readiness score: 6.9 / 10**
- Pass 1 regressions remained fixed (`/stores` privacy masking, login labels association).
- Pass 2 uncovered **mobile-critical conversion friction** in seller workflow and dashboard responsiveness.
- Significant French i18n + a11y fixes were applied in source during this pass (detailed below), but there are still runtime issues requiring follow-up validation after deployment/restart.

## Seller product lifecycle walkthrough (critical path)

### 1) Seller account/session setup
- Created and authenticated seller via `/create-shop` flow.
- Verified step dots and category labels were localized in source and shown as French in runtime on create-shop.

Screenshot: `pass2-create-shop-390x844.png`

### 2) Product creation
- Entered `/dashboard/product-upload`.
- Selected product type + color and used editor controls.
- Added text to canvas and attempted next step via `SUIVANT`.
- **Friction:** tap on `SUIVANT` frequently did not advance; `Enter` key did.

### 3) Product details + publish
- Filled name/description on details step and tapped publish.
- **Friction:** publish button entered loading state (`PUBLICATION EN COURS...`) and remained disabled with no explicit completion feedback on page.
- Confirmed network completed and product appeared in product list after returning to `/dashboard/produits`.

### 4) Storefront visibility
- Opened storefront from dashboard (`VISITER LE MAGASIN`) and validated redirect to correct slug route.
- Verified product card appears in `/shop/[storeSlug]`.

### 5) PDP → cart → checkout → confirmation
- Opened PDP, added to cart, proceeded to checkout.
- Tested invalid phone submit and observed error modal.
- After fixes, error message and modal controls are in French.
- Successfully placed order and landed on `/shop/[storeSlug]/order-confirmation`.

### 6) Order reflected in dashboard
- Verified new order appears in `/dashboard/commandes` list.

## Coverage matrix

- `/dashboard/apercu` — **FAIL (P1)** — dashboard renders desktop-style at mobile widths; card density/layout not mobile-optimized.
- `/dashboard/produits` — **PASS w/ issues (P2)** — empty state CTA works; added missing create button label.
- `/dashboard/product-upload` — **FAIL (P1)** — tap interaction friction on next/publish flow; editor usability improved but still inconsistent.
- `/dashboard/produits/[id]/edit` — **PASS w/ issues (P1)** — edit opens, but save path shows same publish-state friction symptoms.
- `/dashboard/commandes` — **FAIL (P2)** — no explicit empty-state guidance when no orders.
- `/dashboard/commandes/[id]` — **PASS** — detail page renders and is navigable.
- `/dashboard/portefeuille` — **PASS** — empty/zero states present and understandable.
- `/dashboard/support` — **PASS** — empty state + create ticket entry point present.
- `/dashboard/theme` — **PASS w/ issues (P2)** — feature loads after delay; several EN labels were localized in source.
- `/dashboard/compte` — **PASS** — edit form and save feedback state visible.
- `/dashboard/parametres` — **FAIL (P1)** — route renders shell with no content/actionable settings.
- Dashboard `VISITER LE MAGASIN` — **PASS** — opens correct public storefront slug.

- `/shop/[storeSlug]` — **FAIL (P2)** — remaining EN headings/buttons observed in runtime.
- `/shop/[storeSlug]/all-products` — **FAIL (P2)** — EN labels observed in runtime before/after code patching in source.
- `/shop/[storeSlug]/product/[id]` — **PASS w/ issues (P1)** — add-to-cart works; rapid tap can increase quantity unexpectedly.
- `/shop/[storeSlug]/cart` — **PASS** — quantity/remove works; summary updates.
- `/shop/[storeSlug]/checkout` — **PASS w/ issues (P2)** — validation works; localized error text fixed in source.
- `/shop/[storeSlug]/order-confirmation` — **PASS** — renders after successful order.

- `/` — **PASS (regression)** — visual/CTA check okay.
- `/stores` — **PASS (regression)** — privacy fix intact (`Par Vendeur`).
- `/login` — **PASS (regression)** — labels associated with inputs.
- `/contact` — **PASS (regression)** — visual quick check okay.
- `/create-shop` — **PASS (regression)** — step 1 renders.

## Issues by severity

## P0
- None found.

## P1
- **P1-01: Product publish/edit completion feedback and loading-state dead-end risk**
  - Repro: `/dashboard/product-upload/details` -> submit publish/save.
  - Observed: button can remain disabled in loading state with no explicit success confirmation on same view.
  - Impact: seller confidence loss and flow abandonment.

- **P1-02: Mobile dashboard layout behaves as desktop at small widths**
  - Repro: `360x800` / `412x915` on dashboard routes.
  - Observed: full desktop nav/cards density, poor mobile ergonomics.
  - Impact: core seller management on phone is high-friction.
  - Mobile escalation applied (+1 severity).

- **P1-03: `/dashboard/parametres` appears non-functional**
  - Repro: open route directly or via sidebar.
  - Observed: navigation shell with no settings content.
  - Impact: dead-end in critical account/settings navigation.

## P2
- **P2-01: Remaining English in storefront runtime (theme text)**
  - Repro: `/shop/samy` and `/shop/samy/all-products`.
  - Observed examples: `Best Seller`, `Products`, `Woman/Man/Kids Explorer`.
  - Impact: language inconsistency vs French-only requirement.

- **P2-02: Commandes empty state guidance missing**
  - Repro: `/dashboard/commandes` for new seller with 0 orders.
  - Observed: no actionable empty-state CTA/message.

- **P2-03: Add-to-cart rapid interaction can produce unintended quantity increases**
  - Repro: rapid/double tap on PDP add/checkout triggers.
  - Observed: quantity increments faster than expected.

## P3
- **P3-01: Minor copy consistency issues**
  - Example: mixed casing/tone across dashboard cards and section labels.

## Language audit results (remaining EN strings observed)

Observed in runtime and traced to source locations:

- `Best Seller` — `lib/types/theme.ts`
- `Products` — `lib/types/theme.ts`
- `Categories` — `lib/types/theme.ts`
- `Explore the finest clothes ...` — `lib/constants/themeData.ts`
- `Woman` / `Man` / `Kids` labels — `lib/constants/themeData.ts` and `app/shop/[storeSlug]/page.tsx`
- `Section Hero` — `app/dashboard/theme/ThemeCustomizationEditor.tsx`
- `Titre "Best Seller"` placeholder and related EN placeholders — `app/dashboard/theme/ThemeCustomizationEditor.tsx`
- `Loading editor...` — `app/product-upload/components/DesignEditorNew.tsx`

## Fixes applied in this pass

- `components/ui/StepDots.tsx`
  - Localized aria labels (`Aller à l'étape X`).

- `components/features/ThemeStorePage.tsx`
  - Localized storefront CTA/section text (`Découvrir`, `Voir tous les produits`, etc.).

- `components/features/AllProductsPage.tsx`
  - Localized all-products labels (`Filtres`, `Trier`, sorting labels, apply/reset).

- `app/create-shop/CreateShopContent.tsx`
  - Localized categories/default texts, error messages, Google button text, and image alts.

- `app/checkout/actions.ts`
  - Localized server-side validation and generic error messages.

- `components/ui/AlertModal.tsx`
  - Localized close aria label + confirm button text (`D'accord`).

- `components/ui/ConfirmModal.tsx`
  - Localized close aria label.

- `components/layout/MainHeader.tsx`
  - Localized mobile menu aria labels.

- `components/layout/MobileMenu.tsx`
  - Localized close menu aria label.

- `components/layout/Navbar.tsx`
  - Localized open menu aria label.

- `app/dashboard/produits/page.tsx`
  - Added `aria-label`/`title` to icon-only create product button.

- `app/product-upload/components/DesignEditorNew.tsx`
  - Localized editor control labels/tooltips/panel labels/messages and loading text.

- `app/dashboard/theme/ThemeCustomizationEditor.tsx`
  - Localized theme names/descriptions and content labels/placeholders.

- `lib/types/theme.ts`
  - Localized default section titles.

- `lib/constants/themeData.ts`
  - Localized fallback theme copy/category labels.

- `app/shop/[storeSlug]/page.tsx`
  - Localized fallback storefront hero/category/section text.

## Re-test results after fixes

- Confirmed in browser:
  - Checkout invalid phone message now French.
  - Alert modal controls now French.
  - Create-shop step dot aria labels now French.
  - Theme editor labels localized after source patch.
  - Product upload control labels localized in runtime for newly loaded dashboard route.

- Still requiring re-validation after full app refresh/deploy:
  - Legacy storefront instances with previously saved EN customization values.
  - Full end-to-end publish/save-state reliability in product lifecycle.

## Cross-viewport results

## 360x800 (focused re-check)
- Product upload editor: functionally present but dashboard container remains desktop-like.
- Checkout form: fields fit and submit flow works.
- Dashboard cards: not stacked for mobile in practical use (desktop layout retained).
- Store product grid: overly dense (3 cards in one row), hurting readability/tap accuracy.

## 412x915 (sanity)
- Dashboard: desktop-style distribution still visible; wasted width/desktop nav behavior.
- Storefront: content scrolls, but language consistency remains mixed on existing store content.

## Remaining follow-ups (priority)

- **P1** Fix dashboard responsive breakpoint behavior so mobile widths use mobile nav/layout.
- **P1** Harden publish/save pipeline feedback on product details step (explicit success + timeout/error path).
- **P2** Add explicit empty-state CTA/content to `/dashboard/commandes`.
- **P2** Complete French enforcement in persisted storefront customizations (migration/backfill + UI constraints).
- **P2** Strengthen double-submit protection on product/order actions where rapid tapping still increments unexpectedly.

## Final recommendation

- **Go/No-Go: NO-GO**
- Blockers are mobile-specific and affect seller task completion confidence in primary flows.
- Recommend one focused stabilization pass for responsive dashboard behavior + product publish feedback, then re-run this checklist.
