import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NutriVision - AI Fitness & Nutrition Coach",
  description: "Your personalized AI-powered fitness and nutrition coach. Get custom workout plans, nutrition guidance, and track your calories effortlessly.",
  keywords: ["fitness", "nutrition", "workout", "calories", "macro tracking", "meal planning"],
  authors: [{ name: "NutriVision" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <ErrorBoundary>
          <AuthProvider>
            <main className="page">
              {children}
            </main>
            <Navigation />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
