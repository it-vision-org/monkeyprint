import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';

export const authConfig = {
    trustHost: true, // Trust all hosts (localhost and production domain)
    pages: {
        signIn: '/login', // Dedicated login page
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');
            const isOnLogin = nextUrl.pathname === '/login';

            function safeInternalPath(path: string | null): string | null {
                if (!path || !path.startsWith('/') || path.startsWith('//')) return null;
                return path;
            }

            // Protect dashboard routes - require authentication
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }

            // Admin: send anonymous users to login with return URL
            if (isOnAdmin) {
                if (isLoggedIn) return true;
                const login = new URL('/login', nextUrl);
                login.searchParams.set(
                    'callbackUrl',
                    `${nextUrl.pathname}${nextUrl.search}`
                );
                return NextResponse.redirect(login);
            }

            // Logged-in users hitting /login → dashboard or safe callbackUrl
            if (isLoggedIn && isOnLogin) {
                const callback = safeInternalPath(nextUrl.searchParams.get('callbackUrl'));
                if (callback) {
                    return NextResponse.redirect(new URL(callback, nextUrl));
                }
                return NextResponse.redirect(new URL('/dashboard/apercu', nextUrl));
            }

            return true;
        },
        async session({ session, token }: any) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
                session.user.role = token.role;
            }
            return session;
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.sub = user.id;
                token.role = user.role;
            }
            return token;
        }
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
