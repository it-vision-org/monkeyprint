# Next Review Checklist (After Fixes)

Date: __________  
Reviewer: __________  
Build/Commit: __________

Use this checklist after implementing fixes from `QA_UX_FULL_AUDIT.md`.

## 1) Critical Regression Gates (Must Pass)

- [ ] `/admin/products` opens without server-side crash.
- [ ] Seller can complete onboarding and reach dashboard without dead ends.
- [ ] Seller can create a product and see a clear success state.
- [ ] Created product is visible on storefront and opens product detail.
- [ ] Primary nav links (home, stores, contact, login, create shop) all route correctly.
- [ ] No primary CTA appears clickable but does nothing.

## 2) Route Health Sweep

Public:
- [ ] `/`
- [ ] `/stores`
- [ ] `/contact`
- [ ] `/login`
- [ ] `/create-shop`

Seller:
- [ ] `/dashboard/apercu`
- [ ] `/dashboard/produits`
- [ ] `/dashboard/product-upload`
- [ ] `/dashboard/commandes`
- [ ] `/dashboard/compte`

Admin:
- [ ] `/admin`
- [ ] `/admin/users`
- [ ] `/admin/stores`
- [ ] `/admin/orders`
- [ ] `/admin/products`
- [ ] `/admin/support`
- [ ] `/admin/analytics`
- [ ] `/admin/settings`

## 3) Product Lifecycle Re-Validation

- [ ] Create new seller/test account or login seller.
- [ ] Create one new product end-to-end (name, pricing, description, publish/save).
- [ ] Confirm success message includes direct link to product/store page.
- [ ] Open storefront and verify product appears in listing.
- [ ] Open product details and verify image/name/price/description correctness.
- [ ] Add to cart and verify cart count updates predictably.
- [ ] Start checkout and verify required-field validation and feedback.

## 4) UX Clarity and Flow

- [ ] Every major action shows immediate visual feedback (loading/pending/confirmed).
- [ ] CTA labels match destination behavior (no misleading button names).
- [ ] Empty states contain clear next-step actions.
- [ ] Back navigation and “continue” flow feel natural with no confusion.
- [ ] No duplicate/conflicting sections that reduce readability.

## 5) Interaction and Accessibility

- [ ] No unnamed interactive controls (especially onboarding/theme selection).
- [ ] Keyboard focus is visible and logical on forms and nav.
- [ ] Required fields show clear inline errors.
- [ ] Disabled states are understandable and explain how to proceed.
- [ ] Touch targets are usable on mobile viewport.

## 6) Speed and Perceived Performance

- [ ] Navigation responds instantly (or shows explicit pending indicator).
- [ ] No “dead click” feeling on first interaction.
- [ ] Dashboard pages become usable quickly after route change.
- [ ] Product/store pages do not visibly jank during initial render.
- [ ] Repeated actions do not trigger duplicate requests or duplicate UI transitions.

## 7) Mobile + Desktop Pass

Desktop (e.g. 1366x768):
- [ ] Key flows complete without layout break.

Mobile (e.g. 390x844):
- [ ] Header/nav remains usable.
- [ ] Forms remain readable and tappable.
- [ ] Store/product/checkout flows remain complete.

## 8) Console + Network Cleanliness

- [ ] No new uncaught errors in browser console during core flows.
- [ ] No failing core API requests in tested journeys.
- [ ] Any non-critical warnings are documented for later cleanup.

## 9) Sign-Off Summary

Status:
- [ ] PASS (ready for next stage)
- [ ] PASS WITH RISKS (minor known issues)
- [ ] FAIL (blocking issues remain)

Blocking issues found:
- 1. ______________________________________
- 2. ______________________________________
- 3. ______________________________________

Recommended next actions:
- ______________________________________
- ______________________________________

