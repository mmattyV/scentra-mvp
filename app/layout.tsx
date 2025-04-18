import type { Metadata } from "next";
import "./globals.css";
import { openSans } from "./ui/fonts";
import AuthenticatorProvider from "./ui/components/AuthenticatorProvider";

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
        <AuthenticatorProvider>
          {children}
        </AuthenticatorProvider>
      </body>
    </html>
  );
}
