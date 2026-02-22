# Dashboard Fixes - Update 2

## Fixed Mobile Header Layout
**File**: `app/styles/dashboard.module.css`
- Forced `display: none !important` on desktop elements (`.dash-nav`, `.dash-actions`, `.dash-logo`) when on mobile.
- Configured mobile header grid with `grid-template-columns: 1fr auto`.
- Forced store info (logo) to `grid-column: 1`.
- Forced hamburger button to `grid-column: 2`.
- Removed duplicate style blocks that were causing conflicts.

## Fixed Desktop Content Overlap
**File**: `app/styles/dashboard.module.css`
- Increased `.dash-main` padding-top from `110px` to **`150px`**.
- This provides ample space for the fixed header, ensuring no content is hidden behind it.
- Cleaned up duplicate mobile styles.

## Fixed Infinite Spinner on Query Change
**File**: `components/ui/LoadingLink.tsx`
- Added `useSearchParams` hook.
- Added `searchParams` to `useEffect` dependency array.
- This ensures the spinner stops when navigating between same-page routes with different query parameters (e.g., filtering orders).

## Verify
1. **Mobile**: Header should clearly show Logo/Name on LEFT and Menu Button on RIGHT.
2. **Desktop**: Content should start well below the header (approx 150px down).
3. **Filtering**: Click "Commandes > Non confirmé" etc. - spinner should stop correctly.
