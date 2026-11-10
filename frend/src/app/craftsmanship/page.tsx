import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Award,
  Sparkles,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "Our Craftsmanship & Savar Tannery Heritage | Heritage Leather BD",
  description: "The poetry of Bengal leathercraft. Learn how our artisans cut, saddle-stitch, and burnish 100% full-grain cowhides at Savar Tannery Estate and Eastern Plaza Atelier.",
};

export default function CraftsmanshipPage() {
  const steps = [
    {
      step: "01",
      title: "Raw Hide Selection",
      bengali: "১০০% পিওর ফুল-গ্রেইন কাউহাইড বাছাই",
      description:
        "We source solely from the top 10% of prime Bangladeshi cattle hides. Only full-grain and top-grain layers are accepted—the strongest fibrous layers of the skin. We reject split leather and bonded scraps that peel after a few months.",
      image: "/craftsmanship/hide-selection.webp",
    },
    {
      step: "02",
      title: "Vegetable & Pull-up Tanning",
      bengali: "প্রাকৃতিক ভেজিটেবল ও অ্যানিলিন ট্যানিং",
      description:
        "Tanned with organic vegetable barks and drum-dyed with rich oils and waxes. This pull-up treatment allows the leather to 'breathe'. As you flex or carry the leather, natural oils disperse to create a multidimensional, vintage color transition.",
      image: "/craftsmanship/vegetable-tanning.webp",
    },
    {
      step: "03",
      title: "Hand-Cutting & Saddle Stitching",
      bengali: "হাতে কাটা ও স্যাডল-স্টিচ সেলাই",
      description:
        "Every panel is meticulously cut by hand with scalpel precision. Our master cordwainers use traditional two-needle saddle stitching with bonded German waxed thread. Unlike machine lockstitches, if one stitch ever snaps, the seam will never unravel.",
      image: "/craftsmanship/saddle-stitching.webp",
    },
    {
      step: "04",
      title: "Natural Beeswax Edge Burnishing",
      bengali: "প্রাকৃতিক মোম ও আয়রন ক্রিসিং ফিনিশিং",
      description:
        "The raw edges of our wallets, belts, and briefcases are beveled, sanded, and hand-rubbed with natural organic beeswax using hardwood slickers. This seals moisture out and ensures the edge never frays or separates.",
      image: "/craftsmanship/edge-burnishing.webp",
    },
  ];

  return (
    <div className="bg-[#FAF7F2] min-h-screen">
      {/* Editorial Hero Header (Rule 24: Legibility overlay & Rule 6: Luxury serif) */}
      <section className="relative min-h-[440px] flex items-center bg-stone-950 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/craftsmanship/workbench.webp"
            fill
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
            alt="Artisan workbench with leather tools"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Savar Tannery Estate • Eastern Plaza Atelier
            </span>
            <h1 className="font-serif-luxury text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              The Poetry of Bengal Leathercraft
            </h1>
            <p className="text-stone-300 text-base leading-relaxed max-w-[62ch]">
              Founded in 2020 in Dhaka, Bangladesh. We believe that genuine leather should not be a disposable commodity. By cutting and stitching by hand, we prevent wastage of money and build goods meant to be passed down through generations.
            </p>
          </div>
        </div>
      </section>

      {/* Tannery Credo & Philosophy */}
      <section className="py-16 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
            Our Core Principle
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-4xl font-bold text-stone-900">
            &ldquo;We make leather goods to prevent wastage of money.&rdquo;
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            In an era of synthetic fast fashion where plastic PU accessories crack after one rainy season, our Savar tannery workshop crafts goods that outlive fast trends. Each piece begins with pure cowhide, vegetable tanning extracts, and the timeless artistry of Bangladeshi cordwainers.
          </p>
        </div>
      </section>

      {/* 4-Step Craftsmanship Process */}
      <section className="py-12 bg-white border-y border-stone-200">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
              The Workshop Method
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-4xl font-bold text-stone-900 mt-1">
              From Raw Hide to Finished Heirloom
            </h2>
          </div>

          <div className="space-y-16">
            {steps.map((step, idx) => (
              <div
                key={step.step}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center ${
                  idx % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={`space-y-4 ${idx % 2 === 1 ? "lg:order-2" : ""}`}>
                  <span className="text-3xl font-extrabold text-amber-700 font-serif-luxury">
                    {step.step}
                  </span>
                  <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-900">
                    {step.title}
                  </h3>
                  <p className="text-xs font-semibold text-amber-800">{step.bengali}</p>
                  <p className="text-sm text-stone-600 leading-relaxed max-w-[55ch]">
                    {step.description}
                  </p>
                </div>

                <div className={`${idx % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-stone-200 shadow-luxury">
                    <Image
                      src={step.image}
                      width={1600}
                      height={1200}
                      sizes="(min-width: 1400px) 640px, (min-width: 1024px) 50vw, 100vw"
                      loading="lazy"
                      alt={step.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Physical Showrooms & Workshop Locations */}
      <section className="py-20 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
            Visit Our Ateliers
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-4xl font-bold text-stone-900 mt-1">
            Experience Leather in Person
          </h2>
          <p className="text-xs text-stone-500 mt-2">
            Touch the grain, smell the vegetable-tanned hides, and meet our master artisans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Savar Master Workshop */}
          <div className="p-8 rounded-3xl bg-white border border-stone-200 shadow-luxury-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-xl font-bold text-stone-900">
              Savar Master Tannery & Workshop
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Momotaz Market, Tannery Industrial Estate 2nd Gate, Abdur Rahim Road, Hemayetpur, Savar, Dhaka 1340, Bangladesh.
            </p>
            <div className="pt-2 border-t border-stone-100 space-y-2 text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>Sunday – Thursday: 10:00 AM – 4:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-700" />
                <span>+880 1725-293963</span>
              </div>
            </div>
          </div>

          {/* Eastern Plaza Atelier Showroom */}
          <div className="p-8 rounded-3xl bg-white border border-stone-200 shadow-luxury-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-xl font-bold text-stone-900">
              Eastern Plaza Flagship Atelier
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Shop No: 4/33, Level 4 (Lift : 3), Eastern Plaza Shopping Complex, Hatirpool, Dhaka 1205, Bangladesh.
            </p>
            <div className="pt-2 border-t border-stone-100 space-y-2 text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>Open Every Day: 11:00 AM – 8:30 PM (Except Tuesday)</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-700" />
                <span>01779-396906</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 min-h-[48px] px-8 rounded-xl btn-grad btn-grad--fit text-white text-xs font-semibold tracking-wide shadow-luxury"
          >
            <span>Browse Handcrafted Pieces</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
