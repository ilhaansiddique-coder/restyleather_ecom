"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Award,
  Heart,
  ShoppingBag,
  Check,
  ChevronRight,
  Share2,
  PackageCheck,
  Sparkles,
} from "lucide-react";
import { Product, Review } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";
import { useWishlist } from "@/context/WishlistContext";
import { ProductCard } from "@/components/ProductCard";
import { StoreImage } from "@/components/StoreImage";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { addItem, formatPrice } = useCart();
  const locale = useLocale();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewAuthor, setNewReviewAuthor] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${slug}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.product);
          setReviews(data.reviews || []);
          setRelated(data.related || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-8xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-amber-600 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-sm text-stone-600 font-medium">Fetching Savar atelier craftsmanship details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif-luxury text-2xl font-bold text-stone-900 mb-2">Piece Not Found</h2>
        <p className="text-xs text-stone-500 mb-6">The requested handcrafted product might be archived or out of season.</p>
        <Link
          href="/shop"
          className="px-6 py-2.5 rounded-xl btn-grad btn-grad--fit text-white text-xs font-semibold"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const selectedColor = product.colors[selectedColorIndex] || { name: "Natural", hex: "#8B4513" };
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setIsAdding(true);
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        title: product.title,
        bengaliTitle: product.bengaliTitle,
        price: product.price,
        quantity,
        selectedColor: selectedColor.name,
        image: product.images[0] || "",
        leatherType: product.leatherType,
      },
      true
    );
    setTimeout(() => setIsAdding(false), 800);
  };

  const handleBuyNow = () => {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        title: product.title,
        bengaliTitle: product.bengaliTitle,
        price: product.price,
        quantity,
        selectedColor: selectedColor.name,
        image: product.images[0] || "",
        leatherType: product.leatherType,
      },
      false
    );
    router.push("/checkout");
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewText.trim()) return;

    const dummyReview: Review = {
      id: Date.now(),
      productId: product.id,
      author: newReviewAuthor.trim(),
      city: "Dhaka, Bangladesh",
      rating: newReviewRating,
      comment: newReviewText.trim(),
      verified: true,
      createdAt: new Date().toISOString(),
    };

    setReviews([dummyReview, ...reviews]);
    setReviewSubmitted(true);
    setNewReviewAuthor("");
    setNewReviewText("");
  };

  const discountPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Navigation (Rule 4: Aligned grid) */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6">
        <Link href="/" className="hover:text-stone-900 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <Link href="/shop" className="hover:text-stone-900 transition-colors">
          Catalog
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <Link
          href={`/shop?category=${product.category}`}
          className="capitalize hover:text-stone-900 transition-colors"
        >
          {product.category.replace("-", " & ")}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-stone-900 font-semibold truncate max-w-[200px] sm:max-w-none">
          {product.title}
        </span>
      </nav>

      {/* Main Product Showcase (2-Column Desktop Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 pb-16">
        {/* Gallery Column */}
        <div className="space-y-4">
          {/* Main Stage Image */}
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-white border border-stone-200 shadow-luxury">
            <StoreImage
              src={product.images[activeImageIndex] || product.images[0]}
              variant="gallery"
              sizes="(min-width: 1400px) 640px, (min-width: 1024px) 45vw, calc(100vw - 2rem)"
              loading="eager"
              alt={product.title}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {discountPercent && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-amber-600 text-white shadow-sm">
                Save {discountPercent}% Special
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-sm ${
                wishlisted
                  ? "bg-rose-50 text-rose-600 border border-rose-200"
                  : "bg-white/90 backdrop-blur-sm text-stone-600 hover:text-rose-600"
              }`}
              aria-label="Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlisted ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImageIndex === idx
                      ? "border-amber-700 ring-2 ring-amber-700/30 scale-105"
                      : "border-stone-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <StoreImage src={img} variant="thumbnail" sizes="80px" alt={`${product.title}, photo ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Artisan Leather Credentials */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3.5">
            <Sparkles className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-stone-700 leading-relaxed">
              <strong className="text-amber-950 font-bold block mb-0.5">
                Authentic Bengal Cowhide Certification
              </strong>
              Individually hand-selected hide from Savar Tannery Industrial Estate. Edge-sealed with pure beeswax. Will darken into a rich, lustrous patina over years of use.
            </div>
          </div>
        </div>

        {/* Product Details & Purchase Controls */}
        <div className="flex flex-col space-y-6">
          {/* Header & Title */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                {product.category.replace("-", " & ")}
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-xs text-stone-500 font-mono">SKU: {product.sku}</span>
            </div>

            <h1 className="font-serif-luxury text-2xl sm:text-4xl font-bold text-stone-900 leading-tight">
              {locale === "bn" && product.bengaliTitle ? product.bengaliTitle : product.title}
            </h1>
            <p lang={locale === "bn" ? "en" : "bn"} className="font-sans text-sm text-stone-500 font-medium mt-1">
              {locale === "bn" ? product.title : product.bengaliTitle}
            </p>

            {/* Rating Stars & Reviews */}
            <div className="flex items-center gap-3 mt-3 text-xs">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-bold text-stone-800">{product.rating}</span>
              <span className="text-stone-400">({reviews.length || product.reviewCount} verified reviews)</span>
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                100% In Stock
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-stone-100/80 border border-stone-200 flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-stone-900 font-serif-luxury">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-sm text-stone-400 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Inclusive of all taxes • Cash on Delivery available nationwide
              </p>
            </div>

            {discountPercent && (
              <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold">
                Save ৳{(product.compareAtPrice! - product.price).toLocaleString()}
              </span>
            )}
          </div>

          {/* Leather Description (Rule 3: Max readable width & Rule 8: 16px body) */}
          <p className="text-stone-700 text-sm leading-relaxed max-w-[62ch]">
            {product.description}
          </p>

          {/* Available Leather Hides / Color Swatches */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5">
              <span>Selected Shade: <strong className="text-amber-800">{selectedColor.name}</strong></span>
              <span className="text-stone-400 font-normal">Pure drum-dyed</span>
            </div>
            <div className="flex items-center gap-3">
              {product.colors.map((c, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedColorIndex(idx)}
                  className={`group relative flex items-center gap-2 p-1.5 pr-3 rounded-xl border transition-all ${
                    selectedColorIndex === idx
                      ? "border-amber-700 bg-amber-50/50 ring-1 ring-amber-700"
                      : "border-stone-200 hover:border-stone-300 bg-white"
                  }`}
                >
                  <span
                    className="w-6 h-6 rounded-lg border border-black/10 shadow-xs"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-xs font-semibold text-stone-800">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Stepper & Add to Bag (Rule 16: Primary filled CTA with Rule 17: Descriptive copy) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              {/* Stepper */}
              <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-white h-12 shadow-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-full flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-sm text-stone-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-full flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  +
                </button>
              </div>

              {/* Primary Add to Bag Button (Min 48px height) */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 min-h-[48px] rounded-xl btn-grad btn-grad--fit active:scale-95 text-white text-sm font-semibold tracking-wide shadow-luxury flex items-center justify-center gap-2"
              >
                {isAdding ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added to Your Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Add to Bag • {formatPrice(product.price * quantity)}
                  </>
                )}
              </button>
            </div>

            {/* Fast Cash on Delivery Shortcut */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full min-h-[44px] rounded-xl btn-grad btn-grad--fit text-white text-xs font-semibold tracking-wide shadow-sm flex items-center justify-center gap-2"
            >
              <PackageCheck className="w-4 h-4 text-amber-400" />
              Order via Cash on Delivery (ক্যাশ অন ডেলিভারি)
            </button>
          </div>

          {/* Delivery & Security Assurances */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-stone-200 text-xs">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/80">
              <Truck className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold text-stone-900">Dhaka & 64 Districts</strong>
                <span className="text-stone-500 text-[11px]">৳70 Dhaka • ৳130 Nationwide</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/80">
              <RotateCcw className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold text-stone-900">7-Day Exchange</strong>
                <span className="text-stone-500 text-[11px]">Hassle-free size/model swap</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/80">
              <Award className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold text-stone-900">Artisan Warranty</strong>
                <span className="text-stone-500 text-[11px]">6-month free stitching repair</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Technical Specifications Table */}
      <section className="py-12 border-t border-stone-200">
        <h2 className="font-serif-luxury text-2xl font-bold text-stone-900 mb-6">
          Artisan Specifications & Hide Anatomy
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-luxury-sm">
            <table className="w-full text-xs text-left">
              <tbody className="divide-y divide-stone-100">
                <tr className="bg-stone-50">
                  <td className="py-3 px-4 font-bold text-stone-800 w-1/3">Leather Tier</td>
                  <td className="py-3 px-4 text-stone-700">{product.leatherType}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-stone-800">Tannery Origin</td>
                  <td className="py-3 px-4 text-stone-700">Hemayetpur Tannery Estate, Savar, Dhaka</td>
                </tr>
                <tr className="bg-stone-50">
                  <td className="py-3 px-4 font-bold text-stone-800">Dimensions</td>
                  <td className="py-3 px-4 text-stone-700">{product.dimensions || "Standard ergonomic dimensions"}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-stone-800">Warranty Coverage</td>
                  <td className="py-3 px-4 text-stone-700">{product.warranty}</td>
                </tr>
                <tr className="bg-stone-50">
                  <td className="py-3 px-4 font-bold text-stone-800">Hardware & Thread</td>
                  <td className="py-3 px-4 text-stone-700">Solid antiqued brass / Bonded waxed German nylon</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-luxury-sm space-y-3">
            <h3 className="font-semibold text-stone-900 text-sm">Key Architectural Features</h3>
            <ul className="space-y-2 text-xs text-stone-600">
              {product.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-12 border-t border-stone-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="font-serif-luxury text-2xl font-bold text-stone-900">
              Customer Reviews ({reviews.length})
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Verified buyers across Dhaka, Chittagong, Sylhet, and beyond.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400" />
              ))}
            </div>
            <span className="text-xl font-bold text-stone-900">{product.rating}</span>
            <span className="text-xs text-stone-400">out of 5.0</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Review List */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-white border border-stone-200 shadow-luxury-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900">{rev.author}</span>
                    <span className="text-[11px] text-stone-400">({rev.city})</span>
                    {rev.verified && (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>
            ))}
          </div>

          {/* Write a Review Box */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-luxury-sm h-fit">
            <h3 className="font-bold text-stone-900 text-sm mb-3">Add Your Experience</h3>
            {reviewSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                Thank you! Your verified feedback has been recorded for our Savar workshop artisans.
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={newReviewAuthor}
                    onChange={(e) => setNewReviewAuthor(e.target.value)}
                    placeholder="e.g. Asif Mahmud"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label htmlFor="review-rating" className="block text-xs font-semibold text-stone-700 mb-1">Rating</label>
                  <select
                    id="review-rating"
                    value={newReviewRating}
                    onChange={(e) => setNewReviewRating(Number(e.target.value))}
                    className="store-select w-full"
                  >
                    <option value={5}>5 Stars - Outstanding Artisanal Quality</option>
                    <option value={4}>4 Stars - Very Good Handcraft</option>
                    <option value={3}>3 Stars - Satisfactory</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Your Review</label>
                  <textarea
                    rows={3}
                    required
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Share how the leather feels, stitch quality, or everyday utility..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl btn-grad btn-grad--fit text-white text-xs font-semibold"
                >
                  Submit Review
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Related Handcrafted Goods */}
      {related.length > 0 && (
        <section className="py-12 border-t border-stone-200">
          <h2 className="font-serif-luxury text-2xl font-bold text-stone-900 mb-6">
            Complementary Artisanal Pieces
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} imageSizes="(min-width: 1400px) 320px, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, calc(100vw - 2rem)" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
