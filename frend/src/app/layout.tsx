import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/libre-baskerville";
import "@fontsource/hind-siliguri/bengali-400.css";
import "@fontsource/hind-siliguri/bengali-500.css";
import "@fontsource/hind-siliguri/bengali-600.css";
import "@fontsource/hind-siliguri/bengali-700.css";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Header } from "@/components/Header";
import { StorefrontOnly } from "@/components/StorefrontOnly";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";
import { getStoreProfile } from "@/lib/store-profile";
import { getRequestLocale } from "@/lib/request-locale";
import { LocaleProvider } from "@/context/LocaleContext";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getStoreProfile();
  return { title: { default: profile.name, template: "%s | " + profile.name }, description: profile.description, icons: { icon: profile.logoUrl } };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [profile, locale] = await Promise.all([getStoreProfile(), getRequestLocale()]);
  const colors = { "--store-primary": profile.primaryColor, "--store-accent": profile.accentColor } as CSSProperties;
  return (
    <html lang={locale}>
      <body style={colors} suppressHydrationWarning className="min-h-screen text-stone-900 antialiased selection:bg-amber-100 selection:text-amber-900 flex flex-col">
        <LocaleProvider locale={locale}>
          <CartProvider>
            <WishlistProvider>
              <StorefrontOnly>
                <Header name={profile.name} logoUrl={profile.logoUrl} contactPhone={profile.contactPhone} locale={locale} />
              </StorefrontOnly>
              <main className="flex-1">
                {children}
              </main>
              <StorefrontOnly>
                <Footer name={profile.name} description={profile.description} contactPhone={profile.contactPhone} contactEmail={profile.contactEmail} />
                <Chatbot />
              </StorefrontOnly>
            </WishlistProvider>
          </CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
