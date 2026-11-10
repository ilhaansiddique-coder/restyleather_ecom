"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { StoreImage } from "@/components/StoreImage";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  PackageCheck,
  Banknote,
  AlertCircle,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

const BANGLADESH_DIVISIONS: Record<string, string[]> = {
  Dhaka: [
    "Dhaka",
    "Gazipur",
    "Narayanganj",
    "Tangail",
    "Narsingdi",
    "Faridpur",
    "Manikganj",
    "Munshiganj",
    "Kishoreganj",
    "Madaripur",
    "Gopalganj",
    "Rajbari",
    "Shariatpur",
  ],
  Chattogram: [
    "Chattogram",
    "Cox's Bazar",
    "Cumilla",
    "Feni",
    "Brahmanbaria",
    "Noakhali",
    "Chandpur",
    "Lakshmipur",
    "Khagrachhari",
    "Rangamati",
    "Bandarban",
  ],
  Sylhet: ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
  Rajshahi: ["Rajshahi", "Bogura", "Pabna", "Sirajganj", "Naogaon", "Natore", "Chapai Nawabganj", "Joypurhat"],
  Khulna: ["Khulna", "Jashore", "Kushtia", "Satkhira", "Bagerhat", "Jhenaidah", "Chuadanga", "Meherpur", "Narail", "Magura"],
  Barishal: ["Barishal", "Patuakhali", "Bhola", "Pirojpur", "Barguna", "Jhalokathi"],
  Rangpur: ["Rangpur", "Dinajpur", "Kurigram", "Gaibandha", "Nilphamari", "Panchagarh", "Thakurgaon", "Lalmonirhat"],
  Mymensingh: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"],
};

export default function CheckoutPage() {
  const { items, couponCode, removeCoupon, clearCart, formatPrice } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [division, setDivision] = useState("Dhaka");
  const [district, setDistrict] = useState("Dhaka");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<{
    trackingCode: string;
    total: number;
    district: string;
    customerName: string;
  } | null>(null);

  const quoteKey = JSON.stringify({ items, district, couponCode: couponCode || undefined });
  const [pricing, setPricing] = useState<{ key: string; subtotal: number; discount: number; deliveryFee: number; total: number }>();
  const [quoteError, setQuoteError] = useState<{ key: string; message: string }>();
  const [quoteRevision, setQuoteRevision] = useState(0);
  const submission = useRef<{ payload: string; key: string } | null>(null);
  const currentPrice = pricing?.key === quoteKey ? pricing : undefined;
  const { subtotal, discount, deliveryFee, total } = currentPrice ?? { subtotal: 0, discount: 0, deliveryFee: 0, total: 0 };

  useEffect(() => {
    if (!items.length) return;
    const controller = new AbortController();
    fetch("/api/v1/store/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: quoteKey,
      signal: controller.signal,
    }).then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not price your order.");
      if (!controller.signal.aborted) {
        setPricing({ key: quoteKey, ...result.data });
        setQuoteError(undefined);
      }
    }).catch((error) => {
      if (!controller.signal.aborted) setQuoteError({ key: quoteKey, message: error.message });
    });
    return () => controller.abort();
  }, [quoteKey, items.length, quoteRevision]);

  const handleDivisionChange = (newDivision: string) => {
    setDivision(newDivision);
    const districtsInDiv = BANGLADESH_DIVISIONS[newDivision] || [];
    setDistrict(districtsInDiv[0] || "Dhaka");
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Inline validation (Rule 20 from handbook: Clear, informative error states)
    if (!customerName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 11 || !cleanPhone.startsWith("01")) {
      setErrorMessage("Please enter a valid 11-digit Bangladeshi mobile number starting with 01 (e.g. 017XXXXXXXX).");
      return;
    }

    if (!address.trim()) {
      setErrorMessage("Please enter your delivery street, house, and area details.");
      return;
    }

    if (items.length === 0) {
      setErrorMessage("Your bag is empty. Please add a product before checking out.");
      return;
    }

    if (!currentPrice) return;
    setLoading(true);

    try {
      const details = { customerName, phone, email, address, district, division, items, couponCode: couponCode || undefined, notes };
      const payload = JSON.stringify(details);
      if (submission.current?.payload !== payload) submission.current = { payload, key: crypto.randomUUID() };
      const res = await fetch("/api/v1/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...details,
          requestKey: submission.current.key,
          expectedTotal: currentPrice.total,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setErrorMessage(data.error || "Failed to place order. Please try again.");
        if (res.status === 409) {
          setPricing(undefined);
          setQuoteRevision((value) => value + 1);
        }
        return;
      }

      setConfirmedOrder({
        trackingCode: data.trackingCode,
        total: data.order.total,
        district,
        customerName,
      });

      clearCart();
      removeCoupon();
    } catch {
      setErrorMessage("Network error occurred. Please call or WhatsApp us at +880 1725-293963.");
    } finally {
      setLoading(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-luxury-lg space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9 stroke-[2]" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
              Order Confirmed & Sent to Savar Workshop
            </span>
            <h1 className="font-serif-luxury text-3xl font-bold text-stone-900 mt-1">
              Shukriya, {confirmedOrder.customerName}!
            </h1>
            <p className="text-xs text-stone-500 mt-2">
              Your genuine leather piece is now being hand-selected and prepared for courier dispatch.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700">Parcel Tracking ID:</span>
              <span className="text-base font-bold text-amber-900 font-mono tracking-wider">
                {confirmedOrder.trackingCode}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>Destination:</span>
              <span className="font-semibold text-stone-900">{confirmedOrder.district} District</span>
            </div>
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>Total Payable Amount:</span>
              <span className="font-bold text-stone-900">{formatPrice(confirmedOrder.total)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>Payment Type:</span>
              <span className="font-semibold text-stone-900 uppercase">
                Cash on Delivery (অন স্পট চেক)
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href={`/track-order?code=${confirmedOrder.trackingCode}`}
              className="w-full min-h-[48px] rounded-xl btn-grad btn-grad--fit text-white flex items-center justify-center gap-2 text-xs font-semibold tracking-wide shadow-luxury"
            >
              <span>Track Live Parcel Status</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/shop"
              className="w-full min-h-[44px] rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 flex items-center justify-center text-xs font-semibold transition-all"
            >
              Continue Browsing Collection
            </Link>
          </div>

          <p className="text-[11px] text-stone-400">
            A confirmation receipt has been dispatched. Our team may call your mobile to confirm rider dispatch.
          </p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif-luxury text-2xl font-bold text-stone-900 mb-2">No Items to Checkout</h2>
        <p className="text-xs text-stone-500 mb-6">Your shopping bag is empty. Please select your desired leather piece first.</p>
        <Link
          href="/shop"
          className="px-6 py-2.5 rounded-xl btn-grad btn-grad--fit text-white text-xs font-semibold"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header (Rule 5: Visual hierarchy & Rule 4: Clear left alignment) */}
      <div className="border-b border-stone-200 pb-6 mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
          Complete Your Order
        </span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
          Express Checkout & Delivery
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Cash on Delivery available nationwide across all 64 districts in Bangladesh.
        </p>
      </div>

      {quoteError?.key === quoteKey && <div role="alert" className="mb-4 rounded-xl bg-rose-50 p-4 text-sm text-red-700">
        <p>{quoteError.message}</p>
        {couponCode && <button type="button" onClick={removeCoupon} className="mt-2 underline">Remove coupon</button>}
      </div>}
      {errorMessage && (
        <div className="mb-8 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-800 font-medium animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Columns: Customer & Shipping Details (Rule 20: Explicit labels & helpful hints) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Customer Contact Information */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-luxury-sm space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="font-bold text-stone-900 text-base">Customer & Contact Info</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Full Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Asif Chowdhury"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Bangladeshi Mobile Number <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 font-mono"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Courier rider will call before doorstep delivery.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Email Address <span className="text-stone-400 font-normal">(Optional for tracking receipt)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="asif@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>

            {/* Step 2: Shipping Destination */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-luxury-sm space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="font-bold text-stone-900 text-base">Delivery Address (64 Districts)</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="shipping-division" className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Division <span className="text-rose-600">*</span>
                  </label>
                  <select
                    id="shipping-division"
                    value={division}
                    onChange={(e) => handleDivisionChange(e.target.value)}
                    className="store-select w-full"
                  >
                    {Object.keys(BANGLADESH_DIVISIONS).map((div) => (
                      <option key={div} value={div}>
                        {div} Division
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="shipping-district" className="block text-xs font-semibold text-stone-800 mb-1.5">
                    District <span className="text-rose-600">*</span>
                  </label>
                  <select
                    id="shipping-district"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="store-select w-full"
                  >
                    {(BANGLADESH_DIVISIONS[division] || []).map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-amber-800 font-medium mt-1">
                    {currentPrice ? "Delivery: " + formatPrice(deliveryFee) : "Calculating delivery…"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Detailed Street Address <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House number, Flat, Road / Sector, Area, Thana / Landmark"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Special Courier Instructions <span className="text-stone-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Please call before arriving or deliver between 2 PM - 6 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>

            {/* Step 3: Payment Method Selection */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-luxury-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="font-bold text-stone-900 text-base">Payment Method</h2>
              </div>

              <p className="flex items-center gap-2 text-sm"><Banknote className="size-5 text-amber-700" /> Cash on delivery</p>
            </div>
          </div>

          {/* Right Column: Order Summary & Confirm Button (Rule 16: Primary action) */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-luxury-sm space-y-5 sticky top-28">
              <h3 className="font-serif-luxury text-lg font-bold text-stone-900 pb-3 border-b border-stone-100">
                Order Review ({items.length} {items.length === 1 ? "piece" : "pieces"})
              </h3>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto divide-y divide-stone-100 pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center gap-3">
                    <StoreImage
                      src={item.image}
                      variant="thumbnail"
                      sizes="48px"
                      alt={item.title}
                      className="w-12 h-12 rounded-lg object-cover border border-stone-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-stone-900 truncate">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        Qty: {item.quantity} • {item.selectedColor}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-stone-900">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              {currentPrice ? <div className="space-y-1.5 text-xs text-stone-600 border-t border-stone-100 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>
                    Delivery ({district === "Dhaka" ? "Dhaka City" : `${district} Courier`})
                  </span>
                  <span className="font-semibold text-stone-900">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase text-[11px]">Free</span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between text-base font-bold text-stone-900 font-serif-luxury">
                  <span>Total Due</span>
                  <span className="text-amber-800">{formatPrice(total)}</span>
                </div>
              </div> : <p role="status" className="text-sm text-stone-600">{quoteError?.key === quoteKey ? "Order pricing unavailable." : "Calculating your total…"}</p>}

              {/* Primary Action Button (Rule 17: Descriptive button copy) */}
              <button
                type="submit"
                disabled={loading || !currentPrice}
                className="w-full min-h-[50px] rounded-xl btn-grad btn-grad--fit disabled:opacity-50 active:scale-95 text-white flex items-center justify-center gap-2 text-xs font-bold tracking-wide shadow-luxury"
              >
                {loading ? (
                  <span>Recording Order with Savar Workshop...</span>
                ) : (
                  <>
                    <PackageCheck className="w-4 h-4" />
                    <span>Confirm Order{currentPrice ? " (" + formatPrice(total) + ")" : ""}</span>
                  </>
                )}
              </button>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-stone-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Atelier Guarantee</span>
                </div>
                <p>
                  You only pay after opening and inspecting the package. 7-day exchange and 6-month stitch warranty included.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
