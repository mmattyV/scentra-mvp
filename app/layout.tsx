import type { Metadata } from "next";
import "./globals.css";
import AuthWrapper from "./ui/components/AuthWrapper";
import Footer from "./ui/components/Footer";
import { openSans } from "./ui/fonts";
import Header from "./ui/components/Header";

export const metadata: Metadata = {
  title: "Scentra - Luxury Fragrance Marketplace",
  description: "Buy, sell, and collect luxury fragrances",
  keywords: ["fragrance", "perfume", "cologne", "marketplace", "buy", "sell"],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${openSans.className} min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-grow">
          <AuthWrapper>{children}</AuthWrapper>
        </main>
        <Footer />
      </body>
    </html>
  );
}
