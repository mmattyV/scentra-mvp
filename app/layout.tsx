import type { Metadata } from "next";
import "./globals.css";
import { Authenticator } from "@aws-amplify/ui-react";
import Footer from "./ui/components/Footer";
import { openSans } from "./ui/fonts";
import Header from "./ui/components/Header";
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
    <AuthenticatorProvider>
      <html lang="en">
        <body
          suppressHydrationWarning={true}
          className={`${openSans.className} min-h-screen flex flex-col`}
        >
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </body>
      </html>
    </AuthenticatorProvider>
  );
}
