'use server';

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const checkoutSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    phoneNumber: z.string().min(6, 'Phone number must be at least 6 digits'),
    address: z.string().min(2, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    items: z.string().min(1, 'Items are required'),
});

export async function placeOrder(formData: FormData) {
    const rawData = {
        name: formData.get('name'),
        phoneNumber: formData.get('phoneNumber'),
        address: formData.get('address'),
        city: formData.get('city'),
        items: formData.get('items'),
    };

    const validatedFields = checkoutSchema.safeParse(rawData);

    if (!validatedFields.success) {
        console.error('Checkout validation failed:', validatedFields.error.flatten());
        const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
        return { error: firstError || 'Invalid form data. Please check all fields.' };
    }

    const { name, phoneNumber, address, city, items } = validatedFields.data;
    const cartItems = JSON.parse(items);

    if (!cartItems.length) {
        return { error: 'Cart is empty' };
    }

    // Group items by store
    const itemsByStore: Record<string, typeof cartItems> = {};
    for (const item of cartItems) {
        if (!itemsByStore[item.storeId]) {
            itemsByStore[item.storeId] = [];
        }
        itemsByStore[item.storeId].push(item);
    }

    try {
        // Find or create customer
        // We use phoneNumber as unique identifier for simplicity in this POC
        // In real app, we might check auth or more complex matching
        let customer = await prisma.customer.findFirst({
            where: { phoneNumber }
        });

        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    phoneNumber,
                    name,
                    address: `${address}, ${city}`,
                    // city: city // Schema doesn't have city separate? Let's check schema.
                    // Schema has name, phoneNumber, address.
                }
            });
        } else {
            // Update address
            await prisma.customer.update({
                where: { id: customer.id },
                data: {
                    name,
                    address: `${address}, ${city}`
                }
            });
        }

        // Create orders (one per store)
        const orderIds = [];

        for (const storeId in itemsByStore) {
            const storeItems = itemsByStore[storeId];
            const totalAmount = storeItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

            const order = await prisma.order.create({
                data: {
                    customerId: customer.id,
                    storeId: storeId,
                    totalAmount: totalAmount,
                    status: 'PENDING',
                    items: {
                        create: storeItems.map((item: any) => ({
                            productId: item.id,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    }
                }
            });
            orderIds.push(order.id);
        }

        // Return success for client-side handling
        return { success: true, orderIds };

    } catch (e) {
        console.error('Checkout error:', e);
        return { error: 'Failed to place order' };
    }
}
