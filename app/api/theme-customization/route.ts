import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import type { ThemeCustomization } from '@/lib/types/theme';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch theme customization for current user's store
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { store: { include: { themeCustomization: true } } }
    });

    if (!user || !user.store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // If no customization exists, return defaults based on theme
    if (!user.store.themeCustomization) {
      return NextResponse.json({ 
        customization: null,
        theme: user.store.theme || 'theme-1'
      });
    }

    const customization = user.store.themeCustomization;
    
    return NextResponse.json({
      customization: {
        primaryColor: customization.primaryColor,
        secondaryColor: customization.secondaryColor,
        accentColor: customization.accentColor,
        backgroundColor: customization.backgroundColor,
        textColor: customization.textColor,
        headingColor: customization.headingColor,
        headerBackgroundColor: customization.headerBackgroundColor,
        headerTextColor: customization.headerTextColor,
        heroTitle: customization.heroTitle,
        heroSubtitle: customization.heroSubtitle,
        heroImageUrl: customization.heroImageUrl,
        heroBackgroundUrl: customization.heroBackgroundUrl,
        heroVariant: customization.heroVariant,
        heroCtaText: customization.heroCtaText,
        heroCtaLink: customization.heroCtaLink,
        bestSellerTitle: customization.bestSellerTitle,
        productsTitle: customization.productsTitle,
        categoriesTitle: customization.categoriesTitle,
        bestSellerDesc: customization.bestSellerDesc,
        productsDesc: customization.productsDesc,
        categoriesDesc: customization.categoriesDesc,
        categoryWomanImageUrl: customization.categoryWomanImageUrl,
        categoryManImageUrl: customization.categoryManImageUrl,
        categoryKidsImageUrl: customization.categoryKidsImageUrl,
        layoutDensity: customization.layoutDensity,
        productCardStyle: customization.productCardStyle,
        gridColumns: customization.gridColumns,
        fontFamily: customization.fontFamily,
        headingFontWeight: customization.headingFontWeight,
        bodyFontWeight: customization.bodyFontWeight,
        themeSettings: customization.themeSettings,
      },
      theme: user.store.theme || 'theme-1'
    });
  } catch (error) {
    console.error('Error fetching theme customization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch theme customization' },
      { status: 500 }
    );
  }
}

// PUT/PATCH - Update theme customization
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { store: true }
    });

    if (!user || !user.store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const body = await request.json() as Partial<ThemeCustomization>;
    const storeId = user.store.id;

    // Upsert customization (create if doesn't exist, update if exists)
    const customization = await prisma.storeThemeCustomization.upsert({
      where: { storeId },
      create: {
        storeId,
        primaryColor: body.primaryColor,
        secondaryColor: body.secondaryColor,
        accentColor: body.accentColor,
        backgroundColor: body.backgroundColor,
        textColor: body.textColor,
        headingColor: body.headingColor,
        headerBackgroundColor: body.headerBackgroundColor,
        headerTextColor: body.headerTextColor,
        heroTitle: body.heroTitle,
        heroSubtitle: body.heroSubtitle,
        heroImageUrl: body.heroImageUrl,
        heroBackgroundUrl: body.heroBackgroundUrl,
        heroVariant: body.heroVariant,
        heroCtaText: body.heroCtaText,
        heroCtaLink: body.heroCtaLink,
        bestSellerTitle: body.bestSellerTitle,
        productsTitle: body.productsTitle,
        categoriesTitle: body.categoriesTitle,
        bestSellerDesc: body.bestSellerDesc,
        productsDesc: body.productsDesc,
        categoriesDesc: body.categoriesDesc,
        categoryWomanImageUrl: body.categoryWomanImageUrl,
        categoryManImageUrl: body.categoryManImageUrl,
        categoryKidsImageUrl: body.categoryKidsImageUrl,
        layoutDensity: body.layoutDensity,
        productCardStyle: body.productCardStyle,
        gridColumns: body.gridColumns,
        fontFamily: body.fontFamily,
        headingFontWeight: body.headingFontWeight,
        bodyFontWeight: body.bodyFontWeight,
        themeSettings: body.themeSettings,
      },
      update: {
        primaryColor: body.primaryColor,
        secondaryColor: body.secondaryColor,
        accentColor: body.accentColor,
        backgroundColor: body.backgroundColor,
        textColor: body.textColor,
        headingColor: body.headingColor,
        headerBackgroundColor: body.headerBackgroundColor,
        headerTextColor: body.headerTextColor,
        heroTitle: body.heroTitle,
        heroSubtitle: body.heroSubtitle,
        heroImageUrl: body.heroImageUrl,
        heroBackgroundUrl: body.heroBackgroundUrl,
        heroVariant: body.heroVariant,
        heroCtaText: body.heroCtaText,
        heroCtaLink: body.heroCtaLink,
        bestSellerTitle: body.bestSellerTitle,
        productsTitle: body.productsTitle,
        categoriesTitle: body.categoriesTitle,
        bestSellerDesc: body.bestSellerDesc,
        productsDesc: body.productsDesc,
        categoriesDesc: body.categoriesDesc,
        categoryWomanImageUrl: body.categoryWomanImageUrl,
        categoryManImageUrl: body.categoryManImageUrl,
        categoryKidsImageUrl: body.categoryKidsImageUrl,
        layoutDensity: body.layoutDensity,
        productCardStyle: body.productCardStyle,
        gridColumns: body.gridColumns,
        fontFamily: body.fontFamily,
        headingFontWeight: body.headingFontWeight,
        bodyFontWeight: body.bodyFontWeight,
        themeSettings: body.themeSettings,
      },
    });

    return NextResponse.json({ 
      success: true,
      customization: {
        primaryColor: customization.primaryColor,
        secondaryColor: customization.secondaryColor,
        accentColor: customization.accentColor,
        backgroundColor: customization.backgroundColor,
        textColor: customization.textColor,
        headingColor: customization.headingColor,
        headerBackgroundColor: customization.headerBackgroundColor,
        headerTextColor: customization.headerTextColor,
        heroTitle: customization.heroTitle,
        heroSubtitle: customization.heroSubtitle,
        heroImageUrl: customization.heroImageUrl,
        heroBackgroundUrl: customization.heroBackgroundUrl,
        heroVariant: customization.heroVariant,
        heroCtaText: customization.heroCtaText,
        heroCtaLink: customization.heroCtaLink,
        bestSellerTitle: customization.bestSellerTitle,
        productsTitle: customization.productsTitle,
        categoriesTitle: customization.categoriesTitle,
        bestSellerDesc: customization.bestSellerDesc,
        productsDesc: customization.productsDesc,
        categoriesDesc: customization.categoriesDesc,
        categoryWomanImageUrl: customization.categoryWomanImageUrl,
        categoryManImageUrl: customization.categoryManImageUrl,
        categoryKidsImageUrl: customization.categoryKidsImageUrl,
        layoutDensity: customization.layoutDensity,
        productCardStyle: customization.productCardStyle,
        gridColumns: customization.gridColumns,
        fontFamily: customization.fontFamily,
        headingFontWeight: customization.headingFontWeight,
        bodyFontWeight: customization.bodyFontWeight,
        themeSettings: customization.themeSettings,
      }
    });
  } catch (error) {
    console.error('Error updating theme customization:', error);
    return NextResponse.json(
      { error: 'Failed to update theme customization' },
      { status: 500 }
    );
  }
}

