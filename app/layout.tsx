import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans, Inter, Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider, SessionProviderWrapper, AlertProvider } from "@/components";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Monkey Print",
  description: "Gagnez de l'argent gratuitement en vendant des produits marchands en Tunisie.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} ${inter.variable} ${outfit.variable} antialiased`}
      >
        <SessionProviderWrapper>
          <CartProvider>
            <AlertProvider>
              {children}
            </AlertProvider>
          </CartProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
