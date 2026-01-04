# Hardcoded Images in Themes - Report

## Summary

This report identifies all hardcoded image paths used in theme-related files.

## ✅ FIXES APPLIED

### Fixed Issues:

1. **Default Hero Image (`/T-Shirt.png`)** - ✅ FIXED
   - Removed hardcoded default in `app/shop/[storeSlug]/page.tsx`
   - Removed hardcoded default in `app/store/[theme]/page.tsx`
   - Now prioritizes: customization → store logo → undefined (no image)
2. **Fallback in ThemeStorePage.tsx** - ✅ FIXED
   - Removed hardcoded `/T-Shirt.png` fallback
   - Now conditionally renders image only if it exists

### Remaining Acceptable Hardcoded Images:

- Category image defaults (`/Hoodie.png`) - Acceptable as fallbacks, users can customize
- Theme preview images (`/theme-1.png`, etc.) - UI elements, should remain static
- Demo data in `lib/constants/themeData.ts` - Intentional demo/fallback data

## Categories of Hardcoded Images

### 1. Hero Images (Default Fallbacks)

#### `/T-Shirt.png`

- **Location**: `app/shop/[storeSlug]/page.tsx` (line 58)
  - Used as default hero image when store has no logoUrl
  - **Status**: ⚠️ Should be customizable or use a better default
- **Location**: `app/store/[theme]/page.tsx` (line 71)

  - Used as default hero image when store has no logoUrl
  - **Status**: ⚠️ Should be customizable or use a better default

- **Location**: `components/ThemeStorePage.tsx` (line 78)

  - Used as fallback: `heroContent.image || "/T-Shirt.png"`
  - **Status**: ⚠️ Fallback should be handled better

- **Location**: `lib/constants/themeData.ts` (line 46)
  - Used in demo data for theme-1
  - **Status**: ✅ OK (demo data)

#### `/T-Shirt-Design.png`

- **Location**: `lib/constants/themeData.ts` (lines 83-87, 119)
  - Used in demo data for theme-2 and theme-3 hero sections
  - **Status**: ✅ OK (demo data)

### 2. Category Images

#### `/Hoodie.png`

- **Location**: `app/shop/[storeSlug]/page.tsx` (lines 123-125)
  - Used as default fallback for category images
  - **Status**: ✅ Already customizable (user can upload custom images)
- **Location**: `app/store/[theme]/page.tsx` (lines 121-123)

  - Used as default fallback for category images
  - **Status**: ✅ Already customizable (user can upload custom images)

- **Location**: `lib/constants/themeData.ts` (lines 52-54)
  - Used in demo data for theme-1 categories
  - **Status**: ✅ OK (demo data)

#### `/T-Shirt-Design.png`

- **Location**: `lib/constants/themeData.ts` (lines 90-91, 122-124)
  - Used in demo data for theme-2 and theme-3 categories
  - **Status**: ✅ OK (demo data)

### 3. Theme Preview Images

#### `/theme-1.png`, `/theme-2.png`, `/theme-3.png`

- **Locations**: Multiple files
  - `app/dashboard/theme/ThemeCustomizationEditor.tsx` (lines 443-445)
  - `app/store/page.tsx` (lines 11, 16, 21)
  - `app/create-shop/CreateShopContent.tsx` (lines 30-32)
  - `app/dashboard/compte/CompteForm.tsx` (lines 16-18)
  - `app/HomeContent.tsx` (lines 115-117, 301-303)
- **Status**: ✅ OK (these are theme preview thumbnails, should remain static)

## Recommendations

### High Priority (Should be customizable)

1. **Default Hero Image (`/T-Shirt.png`)**

   - Currently hardcoded in `app/shop/[storeSlug]/page.tsx` and `app/store/[theme]/page.tsx`
   - **Action**: Consider adding a default hero image field in customization, or use a more generic placeholder
   - **Impact**: Users see the same default image if they don't upload a logo

2. **Fallback in ThemeStorePage.tsx**
   - Line 78: `heroContent.image || "/T-Shirt.png"`
   - **Action**: This fallback should use the same logic as the store pages (check customization first)

### Low Priority (Acceptable as-is)

1. **Demo Data in `lib/constants/themeData.ts`**

   - Contains hardcoded images for demo purposes
   - **Status**: ✅ Keep as-is (this is intentional demo/fallback data)

2. **Category Image Fallbacks**

   - Already handled - users can customize these
   - Fallbacks are acceptable

3. **Theme Preview Images**
   - Static preview images for theme selection
   - **Status**: ✅ Keep as-is (these are UI elements, not user content)

## Files That Need Updates

1. `app/shop/[storeSlug]/page.tsx` - Default hero image
2. `app/store/[theme]/page.tsx` - Default hero image
3. `components/ThemeStorePage.tsx` - Fallback hero image logic

## Notes

- Category images are already customizable ✅
- Hero images can be customized via `heroImageUrl` and `heroBackgroundUrl` ✅
- The main issue is the default fallback when no customization exists
- Demo data in `lib/constants/themeData.ts` is intentional and should remain
