import { prisma } from "@/lib/prisma";
import { getR2Url } from "@/lib/storage";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import StoreHeader from "@/components/StoreHeader";
import { themeConfigs } from '@/components/themeConfig';

export default async function ProductPage({ params }: { params: Promise<{ storeSlug: string, productId: string }> }) {
    const { storeSlug, productId } = await params;
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { 
            store: {
                include: {
                    themeCustomization: true
                }
            }
        }
    });

    if (!product || !product.store) notFound();

    const frontUrl = product.previewFront ? await getR2Url(product.previewFront) : null;
    const backUrl = product.previewBack ? await getR2Url(product.previewBack) : null;

    const themeId = (product.store.theme || 'theme-1') as keyof typeof themeConfigs;
    const theme = themeConfigs[themeId] || themeConfigs['theme-1'];
    
    // Update baseRoute to use shop route
    const themeWithRoute = {
        ...theme,
        baseRoute: `/shop/${storeSlug}`
    };

    const getPageClassName = () => {
        const baseClass = 'product-detail-page-modern';
        if (themeId === 'theme-2') return `${baseClass} product-detail-theme-2`;
        if (themeId === 'theme-3') return `${baseClass} product-detail-theme-3`;
        return `${baseClass} product-detail-theme-1`;
    };

    return (
        <div className={getPageClassName()}>
            <StoreHeader
                cartCount={1}
                cartHref={`${themeWithRoute.baseRoute}/cart`}
                logoFilter={themeWithRoute.logoFilter}
                className={themeWithRoute.headerClassName}
                containerClassName={themeWithRoute.containerClassName}
                cartButtonClassName={themeWithRoute.cartButtonClassName}
                cartBadgeClassName={themeWithRoute.cartBadgeClassName}
                cartStrokeColor={themeWithRoute.cartStrokeColor}
            />

            <div className="product-detail-container-modern">
                <Link href={`/shop/${storeSlug}`} className="product-detail-back-modern">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Back to Store</span>
                </Link>

                <div className="product-detail-content-modern">
                    {/* Image Gallery */}
                    <div className="product-detail-gallery-modern">
                        {frontUrl && (
                            <div className="product-detail-image-wrapper-modern">
                                <Image 
                                    src={frontUrl} 
                                    alt={product.name} 
                                    width={600} 
                                    height={600}
                                    className="product-detail-image-modern"
                                    priority
                                />
                            </div>
                        )}
                        {backUrl && (
                            <div className="product-detail-image-wrapper-modern">
                                <Image 
                                    src={backUrl} 
                                    alt={`${product.name} - Back`} 
                                    width={600} 
                                    height={600}
                                    className="product-detail-image-modern"
                                />
                            </div>
                        )}
                        {!frontUrl && !backUrl && (
                            <div className="product-detail-image-placeholder-modern">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.105 20 20 19.105 20 18V6C20 4.895 19.105 4 18 4H6C4.895 4 4 4.895 4 6V18C4 19.105 4.895 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <p>No image available</p>
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="product-detail-info-modern">
                        <div className="product-detail-header-modern">
                            <h1 className="product-detail-name-modern">{product.name}</h1>
                            <div className="product-detail-price-modern">{product.basePrice} DT</div>
                        </div>

                        {product.description && (
                            <div className="product-detail-description-section-modern">
                                <h3 className="product-detail-section-title-modern">Description</h3>
                                <p className="product-detail-description-modern">{product.description}</p>
                            </div>
                        )}

                        <div className="product-detail-add-to-cart-modern">
                            <AddToCartButton 
                                product={product} 
                                frontUrl={frontUrl} 
                                storeName={product.store.name} 
                                storeSlug={storeSlug} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
