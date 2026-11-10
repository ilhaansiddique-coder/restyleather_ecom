import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { ProductRail } from "@/components/ProductRail";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { HeroImageCarousel } from "@/components/HeroImageCarousel";
import { TrustBadges } from "@/components/TrustBadges";
import { loadHomeCatalog } from "@/lib/home-catalog";
import { getRequestLocale } from "@/lib/request-locale";

export const dynamic = "force-dynamic";

const collections = [
  { name: "Bags", bn: "ব্যাগ", slug: "bags" },
  { name: "Wallets", bn: "ওয়ালেট", slug: "wallets" },
  { name: "Footwear", bn: "জুতা", slug: "footwear" },
  { name: "Belts", bn: "বেল্ট", slug: "belts" },
  { name: "Jackets & Gloves", bn: "জ্যাকেট ও গ্লাভস", slug: "jackets-gloves" },
  { name: "Accessories", bn: "অ্যাক্সেসরিজ", slug: "accessories" },
  { name: "All Collections", bn: "সব কালেকশন", slug: "all" },
];

export default async function HomePage() {
  const [catalog, locale] = await Promise.all([loadHomeCatalog(), getRequestLocale()]);
  const bn = locale === "bn";
  const rankedProducts = catalog?.bestsellers ?? [];
  const starterPicks = catalog?.featuredProducts.length ? catalog.featuredProducts : catalog?.newArrivals ?? [];
  const bestSellerCards = rankedProducts.length ? rankedProducts : starterPicks;

  return <>
    <section aria-labelledby="home-hero-title" className="store-shell py-5 sm:py-8">
      <div className="grid overflow-hidden rounded-2xl bg-[#1C1364] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex min-w-0 flex-col justify-center px-6 py-9 text-white sm:px-10 sm:py-12 xl:px-14">
          <p className="store-kicker mb-5 flex items-center gap-3 text-amber-300">
            <span aria-hidden className="h-px w-7 bg-[#F15A25]" />
            {bn ? "বাংলাদেশে হাতে তৈরি" : "Handcrafted in Bangladesh"}
          </p>
          <h1 id="home-hero-title" className="max-w-[15ch] text-[clamp(2.125rem,4.2vw,4.25rem)] font-normal">
            {bn ? "সময়ের সাথে আরও সুন্দর চামড়া" : "Leather that gets better with age."}
          </h1>
          <p className="mt-5 max-w-[37ch] text-base leading-relaxed text-white/85 sm:text-lg">
            {bn ? "প্রতিদিনের ব্যবহারের জন্য ফুল-গ্রেইন চামড়ার ব্যাগ, ওয়ালেট ও আরও অনেক কিছু।" : "Full-grain leather bags, wallets, and accessories for everyday use."}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/shop" className="btn-grad store-hero-button ring-1 ring-white/40">
              {bn ? "কালেকশন দেখুন" : "Shop the collection"}
              <ArrowUpRight className="size-4 shrink-0" aria-hidden />
            </Link>
            <Link href="/craftsmanship" className="inline-flex min-h-11 items-center text-sm font-semibold underline decoration-white/45 underline-offset-5 hover:text-amber-200">
              {bn ? "আমাদের কারুকাজ" : "Our craftsmanship"}
            </Link>
          </div>
        </div>
        <HeroImageCarousel bangla={bn} />
      </div>
    </section>

    <TrustBadges bangla={bn} />

    <section className="store-shell py-14 sm:py-20">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4 sm:mb-9">
        <div>
          <h2 className="mt-2 text-3xl font-normal sm:text-5xl">{bn ? "ক্যাটাগরি দেখুন" : "Shop by category"}</h2>
        </div>
        <Link href="/shop" className="store-text-link">{bn ? "সব পণ্য" : "Shop all"}</Link>
      </div>
      <CategoryCarousel bangla={bn} labels={collections.map((item) => bn ? item.bn : item.name)}>
        {collections.map((item) => (

            <Link key={item.slug} href={item.slug === "all" ? "/shop" : `/shop?category=${item.slug}`} className="group relative isolate block aspect-[4/5] overflow-hidden rounded-xl bg-stone-950 text-white focus-visible:outline-offset-[-4px]">
              <Image
                src={`/category-images/${item.slug}.webp`}
                fill
                sizes="(min-width: 1200px) 320px, (min-width: 1024px) 29vw, (min-width: 640px) 36vw, min(63vw, 320px)"
                alt=""
                className="object-cover"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-2/5 bg-linear-to-t from-stone-950/95 to-transparent group-data-[active=true]/poster:block" />
              <span className="absolute inset-x-3 bottom-3 hidden items-center justify-between gap-2 group-data-[active=true]/poster:flex sm:inset-x-5 sm:bottom-5">
                <span className="font-serif-luxury text-lg group-hover:underline group-hover:underline-offset-4 sm:text-2xl">
                  {bn ? item.bn : item.name}
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-amber-300 sm:size-5" aria-hidden />
              </span>
            </Link>

        ))}
      </CategoryCarousel>
    </section>

    {!catalog && <p className="store-shell py-6 text-sm text-stone-700" role="status">
      {bn ? "এই মুহূর্তে পণ্যের তালিকা লোড করা যাচ্ছে না। পরে আবার চেষ্টা করুন।" : "The product catalog is temporarily unavailable. Please try again shortly."}
    </p>}

    {catalog && <>
      <ProductRail bangla={bn} title={bn ? "নতুন পণ্য" : "New Arrivals"} products={catalog.newArrivals ?? []} empty={bn ? "নতুন পণ্য এখনো যোগ করা হয়নি।" : "New products will appear here as they’re added."} />
      <ProductRail bangla={bn} title={bn ? "নির্বাচিত পণ্য" : "Featured"} products={catalog.featuredProducts} empty={bn ? "নির্বাচিত পণ্য এখনো যোগ করা হয়নি।" : "No products are featured yet."} />
      <ProductRail
        bangla={bn}
        title={bn ? "সর্বাধিক বিক্রিত" : "Best Sellers"}
        products={bestSellerCards}
        description={!rankedProducts.length && bestSellerCards.length
          ? (bn ? "বিক্রির তালিকা তৈরি হওয়া পর্যন্ত আমাদের বাছাই করা পণ্য দেখুন।" : "Explore our picks while the sales rankings are being established.")
          : undefined}
        empty={bn ? "এখনো কোনো পণ্য যোগ করা হয়নি।" : "No products have been added yet."}
      />
    </>}
    <section className="store-shell py-14 sm:py-20">
      <div className="grid overflow-hidden border-y border-stone-200 md:grid-cols-2">
        <Image src="/craftsmanship/edge-burnishing.webp" width={1600} height={1200} sizes="(min-width: 1440px) 680px, (min-width: 768px) 50vw, 100vw" alt={bn ? "চামড়ার কাজের কাছ থেকে" : "A close look at the materials behind our leather goods"} className="h-64 w-full object-cover md:h-full md:min-h-80" />
        <div className="flex flex-col justify-center px-6 py-10 sm:px-12 sm:py-14">
          <h2 className="mt-3 text-3xl font-normal sm:text-4xl">{bn ? "প্রতিটি সেলাইয়ে যত্ন" : "Craft and materials"}</h2>
          <p className="mt-4 max-w-[38ch] text-stone-600">{bn ? "উপকরণ নির্বাচন থেকে শেষ সেলাই পর্যন্ত আমাদের কাজের গল্প জানুন।" : "Get to know the hides, tools, and hands behind the pieces you carry."}</p>
          <Link href="/craftsmanship" className="store-text-link mt-6 self-start">{bn ? "আমাদের গল্প" : "Read our story"}</Link>
        </div>
      </div>
    </section>
  </>;
}
