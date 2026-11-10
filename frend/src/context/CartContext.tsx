"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem } from "@/lib/types";

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">, openDrawer?: boolean) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  couponCode: string;
  discount: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  subtotal: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  total: number;
  itemCount: number;
  currency: "BDT" | "USD";
  setCurrency: (c: "BDT" | "USD") => void;
  formatPrice: (amountInBdt: number) => string;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const BDT_TO_USD_RATE = 0.0083; // 1 BDT ~ 0.0083 USD (1 USD ~ 120 BDT)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [shipping, setShipping] = useState({ dhakaFee: 70, freeThreshold: 3000 });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [currency, setCurrency] = useState<"BDT" | "USD">("BDT");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const restore = window.setTimeout(() => {
      try {
        const savedCart = localStorage.getItem("heritage_cart");
        const saved: unknown = savedCart ? JSON.parse(savedCart) : null;
        if (Array.isArray(saved)) setItems(saved);
      } catch {
        // Ignore unavailable or invalid browser storage.
      } finally {
        setHydrated(true);
      }
    }, 0);
    const controller = new AbortController();
    fetch("/api/v1/store/shipping", { signal: controller.signal })
      .then(async (response) => {
        if (response.ok && !controller.signal.aborted) setShipping((await response.json()).data);
      })
      .catch(() => {});
    return () => {
      window.clearTimeout(restore);
      controller.abort();
    };
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("heritage_cart", JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, hydrated]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  const addItem = (item: Omit<CartItem, "id">, openDrawer = true) => {
    const cartItemId = `${item.productId}-${item.selectedColor}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === cartItemId);
      if (existing) {
        return prev.map((i) =>
          i.id === cartItemId ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, { ...item, id: cartItemId }];
    });

    showToast(`Added "${item.title}" to your artisan bag!`);
    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    showToast("Item removed from your cart.");
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const applyCoupon = async (code: string) => {
    try {
      const response = await fetch("/api/v1/store/coupons/" + encodeURIComponent(code.trim()));
      const result = await response.json();
      if (!response.ok) return { success: false, message: result.error ?? "Invalid coupon." };
      setCouponCode(result.data.code);
      setDiscountPercent(result.data.percent);
      const message = result.data.percent + "% discount applied.";
      showToast(message);
      return { success: true, message };
    } catch {
      return { success: false, message: "Could not check the coupon. Please try again." };
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setDiscountPercent(0);
    showToast("Coupon removed.");
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = Math.round((subtotal * discountPercent) / 100);
  const deliveryFee = subtotal >= shipping.freeThreshold || subtotal === 0 ? 0 : shipping.dhakaFee;
  const total = Math.max(0, subtotal - discount + deliveryFee);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const formatPrice = (amountInBdt: number) => {
    if (currency === "USD") {
      const usdVal = (amountInBdt * BDT_TO_USD_RATE).toFixed(2);
      return `$${usdVal}`;
    }
    return `৳${amountInBdt.toLocaleString("en-BD")}`;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        couponCode,
        discount,
        applyCoupon,
        removeCoupon,
        subtotal,
        deliveryFee,
        freeDeliveryThreshold: shipping.freeThreshold,
        total,
        itemCount,
        currency,
        setCurrency,
        formatPrice,
        toastMessage,
        showToast,
      }}
    >
      {children}
      {/* Toast Notification with Soft Luxury Styling (Rule 23 & 16) */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-stone-900 text-stone-100 px-5 py-3.5 rounded-xl shadow-luxury-lg border border-stone-800 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-sm font-medium tracking-wide">{toastMessage}</span>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
