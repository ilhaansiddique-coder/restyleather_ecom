"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { StoreImage } from "@/components/StoreImage";
import { Search, X, ArrowRight, CornerDownLeft } from "lucide-react";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";

interface SearchModalProps {
  onClose: () => void;
}

export function SearchModal({ onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<{ term: string; products: Product[] }>();
  const term = query.trim();
  const loading = Boolean(term && search?.term !== term);
  const results = term && search?.term === term ? search.products : [];
  const inputRef = useRef<HTMLInputElement>(null);
  const { formatPrice } = useCart();
  const bn = useLocale() === "bn";

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!term) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      let products: Product[] = [];
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(term)}`, { signal: controller.signal });
        const data = await res.json();
        if (data.success) products = data.products.slice(0, 6);
      } catch {
        // An unavailable catalog leaves the result list empty.
      } finally {
        if (!controller.signal.aborted) setSearch({ term, products });
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-luxury-lg border border-stone-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="flex items-center px-5 border-b border-stone-200">
          <Search className="w-5 h-5 text-stone-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={bn ? "পণ্য খুঁজুন" : "Search products"}
            placeholder={bn ? "ব্যাগ, ওয়ালেট, জুতা বা বেল্ট খুঁজুন…" : "Search bags, wallets, shoes, or belts…"}
            className="w-full py-4 text-base text-stone-900 placeholder-stone-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-stone-400 hover:text-stone-600 rounded-lg mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-medium px-2 py-1 rounded bg-stone-100 text-stone-600 hover:bg-stone-200"
          >
            ESC
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-5 py-3 bg-stone-50 border-b border-stone-100 flex items-center gap-2 overflow-x-auto text-xs text-stone-600">
          <span className="text-stone-400 font-medium">Quick links:</span>
          {["Passport Holder", "Executive Briefcase", "Derby Shoes", "Pull-Up Wallet", "Bridle Belt"].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setQuery(tag)}
              className="px-2.5 py-1 rounded-full bg-white border border-stone-200 hover:border-amber-400 hover:text-amber-800 transition-colors whitespace-nowrap"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-4">
          {loading && (
            <div className="py-8 text-center text-sm text-stone-500">
              {bn ? "পণ্য খোঁজা হচ্ছে…" : "Searching catalog…"}
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-stone-700 font-medium mb-1">{bn ? "কোনো পণ্য পাওয়া যায়নি:" : "No products found for"} &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-stone-500">{bn ? "ওয়ালেট, ব্যাগ বা জুতা লিখে খুঁজুন।" : "Try searching for wallet, bag, or shoes."}</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider px-2 mb-2">
                Handcrafted Matches ({results.length})
              </div>
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-stone-50 transition-colors group"
                >
                  <StoreImage
                    src={product.images[0]}
                    variant="thumbnail"
                    sizes="56px"
                    alt={product.title}
                    className="w-14 h-14 object-cover rounded-lg border border-stone-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-stone-900 group-hover:text-amber-800 transition-colors truncate">
                      {bn && product.bengaliTitle ? product.bengaliTitle : product.title}
                    </h4>
                    <p className="text-xs text-stone-500 truncate">{product.leatherType}</p>
                    <span className="text-xs font-bold text-stone-800">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <div className="text-stone-400 group-hover:text-amber-700 transition-colors pr-2">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
              <div className="pt-3 border-t border-stone-100 text-center">
                <Link
                  href={`/shop?search=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900"
                >
                  {bn ? "সব ফলাফল দেখুন" : "View all results"} <CornerDownLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {!query && (
            <div className="py-8 text-center">
              <p className="text-sm text-stone-600 mb-1">
                Type any keyword to search genuine leather goods
              </p>
              <p className="text-xs text-stone-400">
                Crafted in Bangladesh from 100% full-grain cowhide hides
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
