'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { uploadImageToR2 } from '@/lib/storage';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function registerUser(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Missing fields' };
    }

    // Validate password length (minimum 6 characters)
    if (password.length < 6) {
        return { error: 'Le mot de passe doit contenir au moins 6 caractères' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { error: 'Veuillez entrer une adresse e-mail valide' };
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return { error: 'User already exists' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });

        // Return success - client will handle sign-in
        return { success: true, email, password };
    } catch (error: any) {
        console.error('Registration error:', error);
        return { error: 'Registration failed' };
    }
}

export async function createStore(prevState: any, formData: FormData) {
    const shopName = formData.get('shopName') as string;
    const theme = formData.get('theme') as string;
    const logoFile = formData.get('logo') as File; // handling file upload
    const email = formData.get('email') as string; // Pass email to link store if needed or use session

    // In a real flow, we should get the user from the session.
    // However, since we just registered/logged in, we can try to get the session.
    // But `auth()` might not be updated immediately in the same request cycle if middleware/cookies aren't set yet.
    // For this flow, we might need to rely on the user being logged in or passing the email if we are in the same flow.
    // Let's rely on `auth()`.

    // Note: server actions can read cookies.

    const session = await auth();

    if (!session?.user?.email) {
        return { error: 'Not authenticated' };
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { error: 'User not found' };

    // Check if user already has a store
    const existingStore = await prisma.store.findFirst({
        where: { ownerId: user.id }
    });
    
    if (existingStore) {
        return { error: 'You already have a store. Each user can only have one store.' };
    }

    let logoUrl = null;
    if (logoFile && logoFile.size > 0) {
        try {
            // Convert file to base64 for our helper
            const arrayBuffer = await logoFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString('base64');
            const dataUrl = `data:${logoFile.type};base64,${base64}`;

            logoUrl = await uploadImageToR2(dataUrl, 'logos');
        } catch (e) {
            console.error('Logo upload failed', e);
            // Continue without logo or error out?
            // Let's continue.
        }
    }

    try {
        const slug = shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Math.floor(Math.random() * 1000); // Simple slug generation

        await prisma.store.create({
            data: {
                name: shopName,
                slug: slug,
                theme: theme || 'theme-1',
                logoUrl: logoUrl,
                ownerId: user.id
            }
        });

    } catch (e: any) {
        console.error("Store creation failed", e);
        // Check if it's a unique constraint violation (user already has a store)
        if (e.code === 'P2002' && e.meta?.target?.includes('ownerId')) {
            return { error: 'You already have a store. Each user can only have one store.' };
        }
        return { error: 'Failed to create store' };
    }

    redirect('/dashboard/product-upload');
}
