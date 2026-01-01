import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// DELETE product
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Check for admin role
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { orderItems: true }
                }
            }
        });

        if (!product) {
            return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
        }

        // Delete the product
        await prisma.product.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting product:", error);
        return NextResponse.json(
            { error: "Erreur lors de la suppression du produit" },
            { status: 500 }
        );
    }
}

// UPDATE product
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Check for admin role
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }

        const body = await request.json();
        const { name, description, basePrice } = body;

        // Validate required fields
        if (!name || basePrice === undefined) {
            return NextResponse.json(
                { error: "Le nom et le prix sont requis" },
                { status: 400 }
            );
        }

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id }
        });

        if (!product) {
            return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
        }

        // Update the product
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                name,
                description: description || null,
                basePrice: parseFloat(basePrice.toString()),
            }
        });

        return NextResponse.json({ success: true, product: updatedProduct });
    } catch (error) {
        console.error("Error updating product:", error);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour du produit" },
            { status: 500 }
        );
    }
}

