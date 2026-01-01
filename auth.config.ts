import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';

export const authConfig = {
    pages: {
        signIn: '/login', // Dedicated login page
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnCreateShop = nextUrl.pathname === '/create-shop';
            const isOnLogin = nextUrl.pathname === '/login';

            // Protect dashboard routes - require authentication
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }

            // Redirect logged-in users away from login page only
            // Allow logged-in users to access /create-shop (they may not have a store yet)
            if (isLoggedIn && isOnLogin) {
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
