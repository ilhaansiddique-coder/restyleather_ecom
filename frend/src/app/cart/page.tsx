"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StoreImage } from "@/components/StoreImage";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  Truck,
  RotateCcw,
  Award,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
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

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
        </div>
        <h1 className="font-serif-luxury text-3xl font-bold text-stone-900 mb-2">
          Your Artisan Bag is Empty
        </h1>
        <p className="text-sm text-stone-500 max-w-md mx-auto mb-8">
          You haven&apos;t added any genuine leather pieces yet. Explore our handcrafted briefcases, wallets, and shoes from Savar.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl btn-grad btn-grad--fit text-white text-xs font-semibold tracking-wide shadow-luxury"
        >
          <span>Explore Handcrafted Collection</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Page Header (Rule 5: Single focal point & Rule 1: 8pt rhythm) */}
      <div className="border-b border-stone-200 pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
            Review Selection
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
            Shopping Bag ({items.length} {items.length === 1 ? "Item" : "Items"})
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-stone-500 hover:text-rose-600 transition-colors flex items-center gap-1 self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear All Items
        </button>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 shadow-luxury-sm">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-800 mb-2">
          <span>
            {amountToFreeShipping > 0 ? (
              <>
                Add <strong className="text-amber-900">{formatPrice(amountToFreeShipping)}</strong> more to receive <strong>FREE Nationwide Delivery</strong>
              </>
            ) : (
              <span className="text-emerald-800 font-bold">
                🎉 Congratulations! You have unlocked 100% FREE Nationwide Courier Delivery!
              </span>
            )}
          </span>
          <span className="text-amber-900 font-mono">{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-amber-200/60 overflow-hidden">
          <div
            className="h-full bg-amber-700 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-luxury-sm divide-y divide-stone-100 overflow-hidden">
            {items.map((item) => (
              <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                <StoreImage
                  src={item.image}
                  variant="thumbnail"
                  sizes="96px"
                  alt={item.title}
                  className="w-24 h-24 object-cover rounded-xl border border-stone-200 flex-shrink-0"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        href={`/product/${item.slug}`}
                        className="font-semibold text-stone-900 hover:text-amber-800 transition-colors text-base"
                      >
                        {item.title}
                      </Link>
                      <p className="text-xs text-stone-500">{item.bengaliTitle}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-stone-600">
                    Leather Shade: <strong className="text-stone-800">{item.selectedColor}</strong>
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                    {/* Stepper */}
                    <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center font-bold text-xs text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors"
                        aria-label="Increase"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-bold text-stone-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      {item.quantity > 1 && (
                        <p className="text-[11px] text-stone-400">
                          {formatPrice(item.price)} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              href="/shop"
              className="text-xs font-semibold text-amber-800 hover:text-amber-900"
            >
              ← Continue Browsing Collection
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-luxury-sm space-y-6">
            <h2 className="font-serif-luxury text-xl font-bold text-stone-900 pb-3 border-b border-stone-100">
              Order Summary
            </h2>

            {/* Voucher Coupon Section */}
            <div>
              {couponCode ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span>Coupon <strong>{couponCode}</strong> applied</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-rose-600 hover:underline font-semibold text-xs"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Promo Voucher
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="e.g. ARTISAN10"
                      className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 uppercase focus:outline-none focus:border-amber-600"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl btn-grad btn-grad--fit text-white text-xs font-semibold"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>
                  )}
                  <p className="text-[10px] text-stone-400">
                    Try &ldquo;ARTISAN10&rdquo; for 10% off your order
                  </p>
                </form>
              )}
            </div>

            {/* Financial Summary */}
            <div className="space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Artisan Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Nationwide Courier Delivery</span>
                <span className="font-bold text-stone-900">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase text-[11px]">Free</span>
                  ) : (
                    formatPrice(deliveryFee)
                  )}
                </span>
              </div>
              <div className="pt-3 border-t border-stone-200 flex justify-between text-lg font-bold text-stone-900 font-serif-luxury">
                <span>Total Amount</span>
                <span className="text-amber-800">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Primary Action Button (Rule 16: One filled primary button per view) */}
            <Link
              href="/checkout"
              className="w-full min-h-[50px] rounded-xl btn-grad btn-grad--fit active:scale-95 text-white flex items-center justify-center gap-2 text-sm font-semibold tracking-wide shadow-luxury"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="space-y-2 text-[11px] text-stone-500 pt-2 border-t border-stone-100">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                <span>Cash on Delivery across all 64 districts</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                <span>7-Day on-spot unboxing exchange guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                <span>6-Month free artisan stitch & zip warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
