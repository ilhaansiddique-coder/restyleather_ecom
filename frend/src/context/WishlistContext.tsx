"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/lib/types";

interface WishlistContextType {
  wishlistIds: number[];
  toggleWishlist: (product: Product) => void;
  isWishlisted: (id: number) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem("heritage_wishlist");
        const ids: unknown = saved ? JSON.parse(saved) : null;
        if (Array.isArray(ids)) setWishlistIds(ids.filter((id): id is number => typeof id === "number"));
      } catch {
        // Ignore unavailable or invalid browser storage.
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleWishlist = (product: Product) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(product.id);
      const next = exists ? prev.filter((id) => id !== product.id) : [...prev, product.id];
      try {
        localStorage.setItem("heritage_wishlist", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const isWishlisted = (id: number) => wishlistIds.includes(id);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        toggleWishlist,
        isWishlisted,
        wishlistCount: wishlistIds.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
