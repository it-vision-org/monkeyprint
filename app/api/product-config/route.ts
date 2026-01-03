import { prisma } from '@/lib/prisma';
import { getR2Url } from '@/lib/storage';
import { NextResponse } from 'next/server';

// Public API to fetch active product configuration for product upload page
export async function GET() {
    try {
        const [productTypes, colors, qualities, pricingSettings] = await Promise.all([
            prisma.productType.findMany({
                where: { isActive: true },
                orderBy: { displayOrder: 'asc' },
            }),
            prisma.productColor.findMany({
                where: { isActive: true },
                orderBy: { displayOrder: 'asc' },
            }),
            prisma.productQuality.findMany({
                where: { isActive: true },
                orderBy: { displayOrder: 'asc' },
            }),
            prisma.pricingSettings.findFirst(),
        ]);

        // Parse availableColorIds and print areas from JSON string for each product type
        // Also convert R2 keys to full URLs for images
        // Include product-type-specific qualities and colors
        const parsedProductTypes = await Promise.all(productTypes.map(async (pt) => {
            let imageUrl = pt.image;
            let backImageUrl = pt.backImage;
            
            // Convert R2 keys to full URLs if they're not already URLs
            if (pt.image && !pt.image.startsWith('http') && !pt.image.startsWith('/')) {
                imageUrl = await getR2Url(pt.image);
            }
            if (pt.backImage && !pt.backImage.startsWith('http') && !pt.backImage.startsWith('/')) {
                backImageUrl = await getR2Url(pt.backImage);
            }
            
            // Get product-type-specific qualities
            const typeQualities = await prisma.productTypeQuality.findMany({
                where: { 
                    productTypeId: pt.id,
                    isActive: true 
                },
                orderBy: { displayOrder: 'asc' },
            });
            
            // Get product-type-specific colors via ProductTypeColor relation
            const typeColorRelations = await prisma.productTypeColor.findMany({
                where: { productTypeId: pt.id },
                include: { color: true },
                orderBy: { displayOrder: 'asc' },
            });
            const typeColorIds = typeColorRelations
                .filter(rel => rel.color.isActive)
                .map(rel => rel.colorId);
            
            // Fallback to availableColorIds if ProductTypeColor is not used
            const availableColorIds = typeColorIds.length > 0 
                ? typeColorIds 
                : (pt.availableColorIds ? JSON.parse(pt.availableColorIds) : []);
            
            return {
                ...pt,
                image: imageUrl,
                backImage: backImageUrl,
                availableColorIds,
                qualities: typeQualities,
                printAreaFront: pt.printAreaFront ? (typeof pt.printAreaFront === 'string' ? JSON.parse(pt.printAreaFront) : pt.printAreaFront) : null,
                printAreaBack: pt.printAreaBack ? (typeof pt.printAreaBack === 'string' ? JSON.parse(pt.printAreaBack) : pt.printAreaBack) : null,
            };
        }));

        // If no pricing settings exist, use defaults
        const defaultPricing = {
            designFee: 30,
            minPrice: 55,
            profitCalculationType: 'DIFFERENCE' as const,
        };

        return NextResponse.json({
            productTypes: parsedProductTypes,
            colors,
            qualities,
            pricingSettings: pricingSettings || defaultPricing,
        });
    } catch (error) {
        console.error('Error fetching product config:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

