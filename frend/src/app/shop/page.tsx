"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Filter, SlidersHorizontal, Search, RotateCcw, ChevronDown, Check } from "lucide-react";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";

function ShopContent() {
  const searchParams = useSearchParams();
  const { wishlistIds } = useWishlist();

  const category = searchParams.get("category") || "all";
  const searchTerm = searchParams.get("search") || "";
  const onlyWishlist = searchParams.get("filter") === "wishlist";
  const [sort, setSort] = useState("newest");
  const [selectedLeather, setSelectedLeather] = useState("all");
  const [priceMax, setPriceMax] = useState(15000);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Keep the input responsive while the router catches up with the latest keystroke.
    const currentSearch = new URLSearchParams(window.location.search).get("search") || "";
    if (searchInput.current && searchTerm === currentSearch && searchInput.current.value !== searchTerm) {
      searchInput.current.value = searchTerm;
    }
  }, [searchTerm, isMobileFilterOpen]);

  const categories = [
    { id: "all", label: "All Collections", count: "12" },
    { id: "wallets", label: "Wallets & Holders", count: "4" },
    { id: "bags", label: "Executive Bags", count: "2" },
    { id: "footwear", label: "Cordwain Footwear", count: "1" },
    { id: "belts", label: "Bridle Belts", count: "1" },
    { id: "jackets-gloves", label: "Jackets & Gloves", count: "2" },
    { id: "accessories", label: "Lifestyle Accessories", count: "2" },
  ];

  const leatherTypes = [
    { id: "all", label: "All Leather Types" },
    { id: "Full-Grain", label: "100% Full-Grain Cowhide" },
    { id: "Pull-Up", label: "Waxed Pull-Up Cowhide" },
    { id: "Vegetable-Tanned", label: "Vegetable Tanned Hide" },
    { id: "Calfskin", label: "Aniline Calfskin" },
  ];

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category !== "all") params.set("category", category);
        if (searchTerm.trim()) params.set("search", searchTerm.trim());
        if (sort) params.set("sort", sort);
        params.set("maxPrice", priceMax.toString());

        const res = await fetch(`/api/products?${params.toString()}`, { signal: controller.signal });
        const data = await res.json();
        if (!controller.signal.aborted) setProducts(data.success ? data.products : []);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error(err);
          setProducts([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProducts();
    return () => controller.abort();
  }, [category, searchTerm, sort, priceMax]);

  // Client-side filtering for leather type and wishlist
  const filteredProducts = products.filter((p) => {
    if (onlyWishlist && !wishlistIds.includes(p.id)) return false;
    if (selectedLeather !== "all") {
      const match = p.leatherType.toLowerCase().includes(selectedLeather.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  function updateShopParam(key: "category" | "search" | "filter", value: string) {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
    if (url.href === window.location.href) return;
    if (key === "search") window.history.replaceState(null, "", url);
    else window.history.pushState(null, "", url);
  }

  const handleResetFilters = () => {
    setSelectedLeather("all");
    setPriceMax(15000);
    setSort("newest");
    if (window.location.search) window.history.pushState(null, "", "/shop");
  };

  return (
    <div className="store-shell py-8 sm:py-12">
      {/* Page Header (Rule 5: Clear focal point & Rule 1: 8pt rhythm) */}
      <div className="mb-8 rounded-[1.5rem] border border-stone-200 bg-[#efedf8] px-5 py-8 sm:px-9 sm:py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="store-kicker mb-2 text-amber-800">
              The collection
            </div>
            <h1 className="text-3xl font-normal text-stone-950 sm:text-5xl">
              The leather shop
            </h1>
            <p className="text-sm text-stone-600 mt-2 max-w-[65ch]">
              Discover full-grain leather bags, wallets, footwear, and pieces made for everyday use.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-800 shadow-sm"
            >
              <Filter className="w-4 h-4 text-amber-700" />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium hidden sm:inline">Sort:</span>
              <select
                aria-label="Sort products"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="store-select"
              >
                <option value="newest">Newest Additions</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Customer Ratings</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => {
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => updateShopParam("category", cat.id === "all" ? "" : cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                  active
                    ? "bg-amber-700 text-white shadow-sm"
                    : "bg-white border border-stone-200 text-stone-700 hover:border-amber-300 hover:text-amber-800"
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className={`lg:block ${isMobileFilterOpen ? "block" : "hidden"} space-y-6`}>
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-luxury-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-700" />
                Refine Selection
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-stone-500 hover:text-amber-800 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                Search Catalog
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  ref={searchInput}
                  defaultValue={searchTerm}
                  onChange={(e) => updateShopParam("search", e.target.value)}
                  placeholder="e.g. passport, briefcase"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                />
              </div>
            </div>

            {/* Leather Grain Filter */}
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                Leather Grain Type
              </label>
              <div className="space-y-1.5">
                {leatherTypes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedLeather(t.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                      selectedLeather === t.id
                        ? "bg-amber-50 font-bold text-amber-900 border border-amber-200"
                        : "text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <span>{t.label}</span>
                    {selectedLeather === t.id && <Check className="w-3.5 h-3.5 text-amber-700" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                <span>Maximum Price</span>
                <span className="text-amber-800 font-mono">৳{priceMax.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="400"
                max="15000"
                step="200"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-amber-700 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-stone-500 mt-1">
                <span>৳400</span>
                <span>৳15,000+</span>
              </div>
            </div>

            {/* Saved Wishlist Toggle */}
            <div className="pt-2 border-t border-stone-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyWishlist}
                  onChange={(e) => updateShopParam("filter", e.target.checked ? "wishlist" : "")}
                  className="rounded text-amber-700 focus:ring-amber-600 w-4 h-4"
                />
                <span className="text-xs font-semibold text-stone-800">
                  Show Wishlist Items Only ({wishlistIds.length})
                </span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-6">
            <span>
              Showing <strong className="text-stone-900 font-bold">{filteredProducts.length}</strong> handcrafted pieces
            </span>
            {onlyWishlist && (
              <span className="text-rose-600 font-semibold">Filtering by your saved wishlist</span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-stone-200 animate-pulse space-y-4">
                  <div className="aspect-[4/3] bg-stone-200 rounded-xl" />
                  <div className="h-4 bg-stone-200 rounded w-3/4" />
                  <div className="h-3 bg-stone-200 rounded w-1/2" />
                  <div className="h-8 bg-stone-200 rounded w-full" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 shadow-luxury-sm">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-stone-900 text-lg mb-1">No matching leather pieces</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6">
                Try widening your price range, searching for another keyword, or resetting filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-xl btn-grad btn-grad--fit text-white text-xs font-semibold tracking-wide shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} imageSizes="(min-width: 1424px) 328px, (min-width: 1280px) 25vw, (min-width: 1024px) 36vw, 50vw" />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-stone-500">Loading catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
