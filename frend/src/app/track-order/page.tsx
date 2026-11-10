"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { StoreImage } from "@/components/StoreImage";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Order } from "@/lib/types";
import { useCart } from "@/context/CartContext";

interface TrackingStage {
  step: number;
  key: string;
  title: string;
  description: string;
  completed: boolean;
  date: string;
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";
  const { formatPrice } = useCart();

  const [trackingCode, setTrackingCode] = useState(initialCode);
  const [order, setOrder] = useState<Pick<Order, "trackingCode" | "district" | "total" | "paymentMethod" | "orderStatus" | "items"> | null>(null);
  const [stages, setStages] = useState<TrackingStage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleTrack = useCallback(async (codeToSearch: string, signal?: AbortSignal) => {
    const code = codeToSearch.trim();
    if (!code) {
      setError("Please enter your tracking code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/orders/track?code=${encodeURIComponent(code)}`, { signal });
      const data = await res.json();
      if (signal?.aborted) return;

      if (!data.success) {
        setError(data.error || "No order found with that tracking code.");
        setOrder(null);
        setStages([]);
      } else {
        setOrder(data.order);
        setStages(data.stages || []);
      }
    } catch {
      if (!signal?.aborted) setError("Failed to fetch tracking data. Please try again.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialCode) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => void handleTrack(initialCode, controller.signal), 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [handleTrack, initialCode]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Page Header (Rule 5: Focal point) */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
          Nationwide Courier Radar
        </span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
          Track Your Leather Parcel
        </h1>
        <p className="text-xs text-stone-500 mt-2">
          See the latest order status recorded by our store.
        </p>
      </div>

      {/* Tracking Input Card */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-luxury-sm mb-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleTrack(trackingCode);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="Enter Tracking ID"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-300 text-sm font-mono text-stone-900 uppercase focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="min-h-[46px] px-8 rounded-xl btn-grad btn-grad--fit active:scale-95 text-white text-xs font-semibold tracking-wide shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? "Searching Workshop..." : "Track Parcel"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Order Results Visualizer */}
      {order && stages.length > 0 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Order Snapshot Header */}
          <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-luxury-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Package className="w-4 h-4" />
                <span>Parcel Code: {order.trackingCode}</span>
              </div>
              <h2 className="font-serif-luxury text-2xl font-bold">
                Delivery district
              </h2>
              <p className="text-xs text-stone-400 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>{order.district}</span>
              </p>
            </div>

            <div className="bg-stone-800/80 p-4 rounded-2xl border border-stone-700 space-y-1 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-stone-400">Payable at Delivery:</span>
                <span className="font-bold text-amber-400">{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-stone-400">Payment Mode:</span>
                <span className="font-semibold text-white uppercase">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-stone-400">Current Status:</span>
                <span className="font-semibold text-emerald-400 capitalize">
                  {order.orderStatus.replaceAll("_", " ")}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Timeline Stages */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-luxury-sm">
            <h3 className="font-serif-luxury text-lg font-bold text-stone-900 mb-6">
              Courier Delivery Progress
            </h3>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-stone-200 space-y-8 ml-3">
              {stages.map((stage) => (
                <div key={stage.step} className="relative">
                  {/* Status Node Dot */}
                  <div
                    className={`absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      stage.completed
                        ? "bg-amber-600 text-white ring-4 ring-amber-100"
                        : "bg-stone-200 text-stone-400"
                    }`}
                  >
                    {stage.completed ? (
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Stage Text */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <h4
                        className={`text-sm font-bold ${
                          stage.completed ? "text-stone-900" : "text-stone-400"
                        }`}
                      >
                        {stage.title}
                      </h4>
                      <span className="text-[11px] font-medium text-stone-500 font-mono">
                        {stage.date}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed max-w-xl">
                      {stage.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Items in this Parcel */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-luxury-sm space-y-4">
            <h3 className="font-serif-luxury text-base font-bold text-stone-900">
              Parcel Contents ({order.items.length} {order.items.length === 1 ? "piece" : "pieces"})
            </h3>
            <div className="divide-y divide-stone-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center gap-4">
                  <StoreImage
                    src={item.image}
                    variant="thumbnail"
                    sizes="56px"
                    alt={item.title}
                    className="w-14 h-14 object-cover rounded-xl border border-stone-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-stone-900 truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Color: {item.selectedColor || "Artisan Standard"} • Quantity: {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-stone-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Need help with your delivery? */}
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-amber-800 flex-shrink-0" />
              <div>
                <strong className="block text-stone-900">Questions about your rider or address?</strong>
                <span className="text-stone-600">Savar Tannery Dispatch Team: +880 1725-293963</span>
              </div>
            </div>
            <a
              href="https://wa.me/8801725293963"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl btn-grad btn-grad--fit text-white font-semibold text-center whitespace-nowrap"
            >
              WhatsApp Support
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-stone-500">Loading order tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
