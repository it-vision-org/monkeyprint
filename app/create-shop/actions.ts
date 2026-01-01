'use server';

import { auth, signIn } from '@/auth';
import { prisma } from '@/lib/prisma';
import { uploadImageToR2 } from '@/lib/storage';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';

export async function registerUser(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Missing fields' };
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

        // Attempt to sign in - signIn may throw NEXT_REDIRECT in server actions
        // We need to handle this properly
        try {
            const result = await signIn('credentials', { 
                email, 
                password, 
                redirect: false 
            });
            // If signIn returns without throwing, it was successful
            return { success: true };
        } catch (e: any) {
            // Check if it's a Next.js redirect (which indicates success in Next.js 15)
            if (e?.digest?.startsWith('NEXT_REDIRECT') || e?.message?.includes('NEXT_REDIRECT')) {
                // This is normal - sign in was successful, redirect was triggered
                return { success: true };
            }
            // Check for auth errors
            if (e instanceof AuthError) {
                console.error('Auth error:', e);
                return { error: 'Failed to auto-login' };
            }
            // For other errors, log and return error
            console.error('Unexpected sign-in error:', e);
            return { error: 'Failed to sign in after registration' };
        }
    } catch (error: any) {
        // Let Next.js redirects pass through
        if (error?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
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

    } catch (e) {
        console.error("Store creation failed", e);
        return { error: 'Failed to create store' };
    }

    redirect('/product-upload');
}
