"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StoreImage } from "@/components/StoreImage";
import { StoreDrawer } from "@/components/StoreDrawer";
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    subtotal,
    deliveryFee,
    freeDeliveryThreshold,
    discount,
    total,
    couponCode,
    applyCoupon,
    removeCoupon,
    formatPrice,
  } = useCart();

  const [inputCode, setInputCode] = useState("");
  const [couponError, setCouponError] = useState("");

  const progressPercent = Math.min(100, Math.round((subtotal / Math.max(1, freeDeliveryThreshold)) * 100));
  const amountToFreeShipping = Math.max(0, freeDeliveryThreshold - subtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const res = await applyCoupon(inputCode);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setInputCode("");
    }
  };

  return (
    <StoreDrawer id="store-cart" label="Your Artisan Bag" side="right" open={isCartOpen} onDismiss={() => setIsCartOpen(false)}>
        <div className="flex h-full flex-col">
          {/* Drawer Header */}
          <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-semibold text-stone-900 text-lg">Your Artisan Bag</h2>
                <p className="text-xs text-stone-500">
                  {items.length} {items.length === 1 ? "handcrafted item" : "handcrafted items"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-6 py-3.5 bg-amber-50/60 border-b border-amber-100">
            <div className="flex items-center justify-between text-xs font-medium text-stone-800 mb-1.5">
              <span>
                {amountToFreeShipping > 0 ? (
                  <>
                    Add <strong className="text-amber-800 font-bold">{formatPrice(amountToFreeShipping)}</strong> for <strong>FREE Nationwide Delivery</strong>
                  </>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    🎉 You have unlocked 100% FREE Nationwide Shipping!
                  </span>
                )}
              </span>
              <span className="text-stone-500">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-amber-200/50 overflow-hidden">
              <div
                className="h-full bg-amber-700 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 divide-y divide-stone-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-stone-900 text-base mb-1">Your bag is empty</h3>
                <p className="text-xs text-stone-500 max-w-xs mb-6">
                  Discover genuine leather wallets, briefcases, and footwear handcrafted in Savar.
                </p>
                <Link
                  href="/shop"
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-3 rounded-xl btn-grad btn-grad--fit text-white text-xs font-semibold tracking-wide shadow-sm"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                  <StoreImage
                    src={item.image}
                    variant="thumbnail"
                    sizes="80px"
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-xl border border-stone-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={() => setIsCartOpen(false)}
                        className="text-sm font-semibold text-stone-900 hover:text-amber-800 transition-colors line-clamp-1"
                      >
                        {item.title}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-stone-500 mt-0.5">
                      Color: <span className="font-medium text-stone-700">{item.selectedColor}</span>
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-stone-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout Actions */}
          {items.length > 0 && (
            <div className="p-6 border-t border-stone-200 bg-stone-50/80 space-y-4">
              {/* Promo Coupon Form */}
              {couponCode ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon <strong>{couponCode}</strong> applied</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-rose-600 hover:underline font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="Promo code (e.g. ARTISAN10)"
                      className="flex-1 px-3 py-2 rounded-lg border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-600 uppercase"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-lg btn-grad btn-grad--fit text-white text-xs font-medium"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>
                  )}
                </form>
              )}

              {/* Price Calculation Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="font-semibold text-stone-900">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase text-[11px]">Free</span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between text-base font-bold text-stone-900">
                  <span>Total Due</span>
                  <span className="text-amber-800">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Primary Action Button (Rule 16: One filled button per section & Rule 17: Clear action copy) */}
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full min-h-[48px] rounded-xl btn-grad btn-grad--fit active:scale-[0.99] text-white flex items-center justify-center gap-2 text-sm font-semibold tracking-wide shadow-luxury"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>Cash on Delivery Available across 64 Districts</span>
              </div>
            </div>
          )}
        </div>
    </StoreDrawer>
  );
}
