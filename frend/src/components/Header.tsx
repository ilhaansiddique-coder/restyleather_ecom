"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  Search,
  Heart,
  Menu,
  X,
  PhoneCall,
  ShieldCheck,
  Package,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { SearchModal } from "@/components/SearchModal";
import { CartDrawer } from "@/components/CartDrawer";
import { StoreDrawer } from "@/components/StoreDrawer";
import { LanguageToggle } from "@/components/LanguageToggle";
import { customerRequest } from "@/lib/customer-api";
import { navigationText, type Locale } from "@/lib/locale";

export function Header({ name, logoUrl, contactPhone, locale }: { name: string; logoUrl: string; contactPhone: string; locale: Locale }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "all";
  const isWishlist = pathname === "/shop" && searchParams.get("filter") === "wishlist";
  const { itemCount, isCartOpen, setIsCartOpen, currency, setCurrency, subtotal, formatPrice } = useCart();
  const { wishlistCount } = useWishlist();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const t = navigationText[locale];
  const bn = locale === "bn";

  useEffect(() => {
    let current = true;
    customerRequest("me").then((result) => { if (current) setSignedIn(Boolean(result.user)); })
      .catch(() => { if (current) setSignedIn(false); });
    return () => { current = false; };
  }, [pathname]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 80rem)");
    function closeOnDesktop() {
      if (desktop.matches) setIsMobileMenuOpen(false);
    }
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  const navLinks = [
    { label: t.shop, href: "/shop" },
    { label: t.wallets, href: "/shop?category=wallets" },
    { label: t.bags, href: "/shop?category=bags" },
    { label: t.footwear, href: "/shop?category=footwear" },
    { label: t.belts, href: "/shop?category=belts" },
    { label: t.craft, href: "/craftsmanship" },
    { label: t.tracking, href: "/track-order" },
  ];

  function isCurrentLink(href: string) {
    if (href.startsWith("/shop?")) {
      return pathname === "/shop" && !isWishlist && href === "/shop?category=" + category;
    }
    return pathname === href && (href !== "/shop" || (!isWishlist && category === "all"));
  }

  return (
    <>
      {/* Top Announcement Bar (Multi-touch informational strip) */}
      <div className="bg-stone-950 py-1.5 text-xs text-stone-200">
        <div className="store-shell flex items-center justify-between gap-2">
          <div className="hidden md:flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-stone-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              {bn ? "১০০% ফুল-গ্রেইন গরুর চামড়া" : "100% full-grain cowhide"}
            </span>
            <span className="flex items-center gap-1.5 text-stone-300">
              <Package className="w-3.5 h-3.5 text-amber-500" />
              {t.delivery}
            </span>
          </div>

          <div className="text-center md:text-left flex-1 md:flex-initial text-amber-400 font-medium">
            <span>{bn ? "ডেলিভারি চার্জ চেকআউটে দেখুন" : "See delivery fees at checkout"}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageToggle locale={locale} />
            <a
              href={"tel:" + contactPhone.replace(/[^+\d]/g, "")}
              className="hidden sm:flex items-center gap-1 text-stone-300 hover:text-white transition-colors"
            >
              <PhoneCall className="w-3 h-3 text-amber-500" />
              <span>{contactPhone}</span>
            </a>

            {/* Currency Switcher */}
            <div className="flex items-center gap-1 bg-stone-800 px-2 py-0.5 rounded text-[11px] font-semibold text-stone-300">
              <button
                type="button"
                onClick={() => setCurrency("BDT")}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  currency === "BDT" ? "bg-amber-600 text-white" : "hover:text-white"
                }`}
              >
                BDT (৳)
              </button>
              <span className="text-stone-600">|</span>
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  currency === "USD" ? "bg-amber-600 text-white" : "hover:text-white"
                }`}
              >
                USD ($)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Brand Header */}
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-md">
        <div className="store-shell">
          <div className="flex h-16 items-center justify-between gap-1 sm:h-20 sm:gap-4">
            {/* Mobile Menu Trigger */}
            <div className="flex items-center xl:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2.5 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors"
                aria-label={t.menu}
                aria-expanded={isMobileMenuOpen}
                aria-haspopup="dialog"
                aria-controls="mobile-store-navigation"
              >
                <Menu className="w-6 h-6" aria-hidden />
              </button>
            </div>

            {/* Brand Logo & Tagline */}
            <div className="flex items-center">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 group">
                <div className="size-9 shrink-0 overflow-hidden rounded-lg sm:size-11">
                  <Image
                    src={logoUrl}
                    alt={name + " logo"}
                    width={44}
                    height={44}
                    className="w-full h-full object-contain"
                    priority
                    unoptimized
                  />
                </div>
                <div>
                  <span className="hidden min-[460px]:inline font-serif-luxury text-lg font-normal text-stone-950 group-hover:text-amber-800 sm:text-xl">
                    {name}
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links (Rule 4: Clean horizontal rhythm & Rule 10: Font weight) */}
            <nav aria-label={t.menu} className="hidden xl:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = isCurrentLink(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative rounded-md px-2.5 py-2 text-xs font-semibold transition-colors ${
                      isActive
                        ? "text-amber-800 bg-amber-50/70"
                        : "text-stone-700 hover:text-amber-800 hover:bg-stone-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Action Tools: Search, Wishlist, Cart */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href={signedIn ? "/account" : "/login"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-grad btn-grad--fit inline-flex min-h-10 shrink-0 items-center whitespace-nowrap rounded-lg px-2.5 text-xs font-semibold text-white sm:px-3 sm:text-sm"
              >
                {signedIn ? t.account : t.login}
              </Link>
              {/* Search Trigger */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-700 hover:bg-stone-100 transition-colors"
                aria-label={t.search}
                title={t.search}
              >
                <Search className="w-5 h-5 stroke-[1.75]" />
              </button>

              {/* Wishlist Link */}
              <Link
                href="/shop?filter=wishlist"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-current={isWishlist ? "page" : undefined}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center text-stone-700 hover:bg-stone-100 transition-colors"
                aria-label={t.wishlist}
                title={t.wishlist}
              >
                <Heart className="w-5 h-5 stroke-[1.75]" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Bag Trigger (Rule 18: Finger-friendly touch target min 44px) */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="flex items-center gap-2.5 h-11 px-3.5 sm:px-4 rounded-xl btn-grad btn-grad--fit text-white shadow-sm active:scale-95"
                aria-label={t.bag}
                aria-haspopup="dialog"
                aria-controls="store-cart"
                aria-expanded={isCartOpen}
              >
                <div className="relative flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2.5 w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-none">
                  <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">
                    {t.bag}
                  </span>
                  <span className="text-xs font-bold text-stone-100">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

      </header>

      <StoreDrawer id="mobile-store-navigation" label={bn ? "স্টোর মেনু" : "Store menu"} side="left" open={isMobileMenuOpen} onDismiss={() => setIsMobileMenuOpen(false)}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-4 py-3">
            <h2 className="text-lg font-semibold">{bn ? "স্টোর মেনু" : "Store menu"}</h2>
            <button type="button" onClick={() => setIsMobileMenuOpen(false)}
              aria-label={bn ? "মেনু বন্ধ করুন" : "Close menu"}
              className="grid size-11 shrink-0 place-items-center rounded-xl hover:bg-stone-100">
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <nav aria-label={t.menu} className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-4 pb-6 pt-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-current={isCurrentLink(link.href) ? "page" : undefined}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-stone-800 hover:bg-amber-50 hover:text-amber-800 aria-[current=page]:bg-amber-50 aria-[current=page]:text-amber-800 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <p className="pt-3 border-t border-stone-100 text-xs text-stone-700">{t.support}: {contactPhone}</p>
          </nav>
        </div>
      </StoreDrawer>

      {/* Global Modals & Drawers */}
      {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}
      <CartDrawer />
    </>
  );
}
