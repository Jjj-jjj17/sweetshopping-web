import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { OrderProvider } from "@/context/OrderContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "sonner";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { PWAUpdater } from "@/components/PWAUpdater";
import { Footer } from "@/components/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LFS-BOMS | Secure Bakery Orders",
  description: "Local-First Secure Bakery Order Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GlobalErrorBoundary>
          <OrderProvider>
            <CartProvider>
              {children}
            </CartProvider>
            <Footer />
            <Toaster position="top-right" />
            <PWAUpdater />
          </OrderProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
