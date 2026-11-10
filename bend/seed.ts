import { prisma } from "./src/db/prisma";

async function seed() {
  const initialProducts = [
    {
      slug: "paige-leather-passport-holder",
      title: "Paige Cowhide Passport & Travel Holder",
      bengaliTitle: "পেইজ ১০০% পিওর কাউহাইড পাসপোর্ট ও ট্রাভেল ওয়ালেট",
      category: "wallets",
      price: 1450,
      compareAtPrice: 1750,
      description: "Restocked with redefined finest leather by Urbaland atelier! Crafted from 100% pure cowhide full-grain dye leather. Highly durable, scratch-resistant, and develops a rich patina over time. Designed specifically for the modern voyager with passport slots, boarding pass sleeve, and dedicated card slots.",
      leatherType: "100% Pure Cowhide Full-Grain Dye Leather",
      images: [
      "/product-images/paige-cowhide-passport-holder.webp",
      "/product-images/paige-cowhide-passport-holder-detail.webp"
      ],
      colors: [
        { name: "Tan Brown", hex: "#8B4513" },
        { name: "Deep Chocolate", hex: "#3B2219" },
        { name: "Classic Black", hex: "#1A1A1A" }
      ],
      dimensions: "5.0 inch (L) × 3.5 inch (W)",
      warranty: "6-Month Artisan Stitch & Color Warranty on Regular Use",
      features: [
        "1–2 Full Passport Compartments",
        "1 Dedicated Boarding Pass Quick-Slot",
        "3 RFID-Protected Card Slots",
        "Hand-burnished wax-sealed edges",
        "Embossed Urbaland heritage seal"
      ],
      inStock: true,
      featured: true,
      rating: "4.9",
      reviewCount: 42,
      sku: "URB-PH-201"
    },
    {
      slug: "hemayetpur-artisan-executive-briefcase",
      title: "Hemayetpur Executive Leather Briefcase",
      bengaliTitle: "হেমায়েতপুর এক্সিকিউটিভ ফুল-গ্রেইন ল্যাপটপ ব্রিফকেস",
      category: "bags",
      price: 5850,
      compareAtPrice: 6900,
      description: "Handcrafted in our Savar Tannery workshop using thick, vegetable-tanned full-grain cowhide. Built to endure decades of professional commutes. Features a reinforced 15.6-inch laptop compartment, antique solid brass buckles, and a detachable padded shoulder strap.",
      leatherType: "Savar Tannery Full-Grain Vegetable-Tanned Cowhide (2.2mm)",
      images: [
      "/product-images/hemayetpur-executive-briefcase.webp",
      "/product-images/hemayetpur-executive-briefcase-detail.webp"
      ],
      colors: [
        { name: "Cognac Amber", hex: "#A0522D" },
        { name: "Rich Walnut", hex: "#4A2E1B" },
        { name: "Midnight Black", hex: "#1E1E1E" }
      ],
      dimensions: "16.0 inch (L) × 12.0 inch (H) × 4.5 inch (D)",
      warranty: "1-Year Full Hardware & Stitching Guarantee",
      features: [
        "Padded 15.6-inch laptop sleeve with magnetic catch",
        "Heavy-duty solid brass hardware & rivets",
        "Luggage pass-through trolley strap on back",
        "Saddle-stitched with bonded German thread",
        "Double gusset interior organization"
      ],
      inStock: true,
      featured: true,
      rating: "5.0",
      reviewCount: 29,
      sku: "LBD-BC-101"
    },
    {
      slug: "bengal-heritage-oxford-derby-shoes",
      title: "Bengal Heritage Burnished Derby Shoes",
      bengaliTitle: "বেঙ্গল হেরিটেজ হ্যান্ড-লাস্টেড প্রিমিয়াম ডার্বি শু",
      category: "footwear",
      price: 4650,
      compareAtPrice: 5400,
      description: "Step into authentic Bangladeshi cordwaining. Each shoe is individually lasted over wooden lasts and hand-burnished for rich, dimensional color depth. Goodyear-welted design with stacked leather heel and anti-slip rubber traction pad.",
      leatherType: "Hand-Burnished Aniline Calfskin & Top-Grain Cowhide",
      images: [
      "/product-images/bengal-goodyear-welted-derby.webp",
      "/product-images/bengal-goodyear-welted-derby-detail.webp"
      ],
      colors: [
        { name: "Burnished Oxblood", hex: "#632023" },
        { name: "Chestnut Brown", hex: "#6A381F" },
        { name: "Sleek Black", hex: "#111111" }
      ],
      dimensions: "Sizes Available: 39, 40, 41, 42, 43, 44 (EU)",
      warranty: "6-Month Free Resoling & Heel Maintenance Service",
      features: [
        "Goodyear-welted resoleable sole construction",
        "Breathable moisture-wicking full leather lining",
        "Ergonomic latex arch cushioning for 10-hour comfort",
        "Hand-painted edge burnish by master shoemakers"
      ],
      inStock: true,
      featured: true,
      rating: "4.8",
      reviewCount: 36,
      sku: "TAS-FW-501"
    },
    {
      slug: "vintage-pull-up-bifold-gents-wallet",
      title: "Classic Vintage Pull-Up Bifold Wallet",
      bengaliTitle: "ক্লাসিক ভিন্টেজ পুল-আপ লেদার জেন্টস ওয়ালেট",
      category: "wallets",
      price: 850,
      compareAtPrice: 1150,
      description: "The definitive everyday wallet for Bangladeshi gentlemen. Made from oil-rich pull-up cowhide that reveals lighter tones when flexed. Generous bill compartment that comfortably fits 1000 Taka notes without creasing.",
      leatherType: "Oil-Waxed Pull-Up Cowhide Leather",
      images: [
      "/product-images/dhaka-rfid-bifold-wallet.webp",
      "/product-images/dhaka-rfid-bifold-wallet-detail.webp"
      ],
      colors: [
        { name: "Rustic Tan", hex: "#9E5B32" },
        { name: "Dark Roast", hex: "#2C1D11" },
        { name: "Charcoal Black", hex: "#1C1C1C" }
      ],
      dimensions: "9.3 cm (H) × 11.5 cm (Folded Width) × 23.5 cm (Open)",
      warranty: "6-Month Stitching & Lining Guarantee",
      features: [
        "Two full-width currency dividers (BDT 1000 compatible)",
        "6 precision card slots + 2 hidden receipt pockets",
        "1 clear ID / National NID window",
        "Slim silhouette that prevents pocket bulge"
      ],
      inStock: true,
      featured: true,
      rating: "4.9",
      reviewCount: 54,
      sku: "LBD-WL-301"
    },
    {
      slug: "artisan-bridle-leather-casual-formal-belt",
      title: "Artisan Full-Grain Bridle Belt (38mm)",
      bengaliTitle: "আর্টিসান ফুল-গ্রেইন ব্রাইডল চামড়ার বেল্ট (৩৮মিমি)",
      category: "belts",
      price: 1250,
      compareAtPrice: 1600,
      description: "Single-strip solid cowhide leather, cut 4mm thick from the prime bend of the hide. No bonded scraps or paper filler. Finished with a heavy antiqued brass roller buckle that will never snap or peel.",
      leatherType: "Single-Piece Full-Grain Bridle Cowhide (4.0mm thickness)",
      images: [
      "/product-images/savar-bridle-belt-40mm.webp",
      "/product-images/savar-bridle-belt-40mm-detail.webp"
      ],
      colors: [
        { name: "Cognac Brown", hex: "#8F4B18" },
        { name: "Espresso Brown", hex: "#3A2417" },
        { name: "Matte Black", hex: "#181818" }
      ],
      dimensions: "Width: 38mm (1.5 inch) | Lengths: 32 to 44 inches waist",
      warranty: "Lifetime Breakage Warranty on Leather Hide",
      features: [
        "100% single cut cowhide with no layering or filler",
        "Solid brass roller buckle with screw rivets (removable/trimmable)",
        "Beveled, waxed, and burnished edge coat",
        "5 teardrop prong holes for precision fit"
      ],
      inStock: true,
      featured: false,
      rating: "4.9",
      reviewCount: 22,
      sku: "URB-BL-401"
    },
    {
      slug: "urbaland-leather-id-card-lanyard-holder",
      title: "Urbaland Leather ID & Badge Holder with Lanyard",
      bengaliTitle: "আর্বাল্যান্ড ১০০% পিওর কাউহাইড আইডি কার্ড হোল্ডার ও লেইনিয়ার্ড",
      category: "accessories",
      price: 450,
      compareAtPrice: 490,
      description: "Urbaland’s iconic office accessory restocked in redefined vintage leather. Keep your corporate office badge, university ID, or transit pass protected in style. Includes matching leather lanyard with 360-degree zinc alloy swivel clasp.",
      leatherType: "100% Pure Cowhide Full-Grain Dye Leather",
      images: [
      "/product-images/leather-id-lanyard.webp",
      "/product-images/leather-id-lanyard-detail.webp"
      ],
      colors: [
        { name: "Chocolate Brown", hex: "#4A2A1A" },
        { name: "Vintage Tan", hex: "#9C5C33" },
        { name: "Classic Black", hex: "#1F1F1F" }
      ],
      dimensions: "4.5 inch (H) × 2.9 inch (W) | Strap: 18 inch drop",
      warranty: "6-Month Stitching Warranty",
      features: [
        "Ultra-clear scratch-resistant acrylic ID window",
        "Back card slot for credit card or emergency cash",
        "Detachable full leather neck lanyard",
        "Reinforced top eyelet"
      ],
      inStock: true,
      featured: false,
      rating: "4.8",
      reviewCount: 48,
      sku: "URB-ID-104"
    },
    {
      slug: "savar-artisan-weekender-duffel-bag",
      title: "Savar Tannery Weekender Duffel Bag",
      bengaliTitle: "সাভার ট্যানারি ক্রাফটেড উইকেন্ডার ট্রাভেল ডাফেল ব্যাগ",
      category: "bags",
      price: 7450,
      compareAtPrice: 8900,
      description: "Engineered for weekend escapes from Dhaka to Sylhet, Cox’s Bazar, or international journeys. Built with full-grain heavy hide that only gets better with every trip. Includes an independent ventilated side compartment for footwear or laundry.",
      leatherType: "Heavyweight Full-Grain Cowhide with Water-Repellent Wax Finish",
      images: [
      "/product-images/eastern-plaza-travel-duffel.webp",
      "/product-images/eastern-plaza-travel-duffel-detail.webp"
      ],
      colors: [
        { name: "Bourbon Tan", hex: "#9E6038" },
        { name: "Dark Walnut", hex: "#382315" }
      ],
      dimensions: "21.0 inch (L) × 11.5 inch (H) × 10.0 inch (W) - Cabin Size Compliant",
      warranty: "1-Year Comprehensive Warranty",
      features: [
        "Dedicated side shoe tunnel with ventilation brass grommets",
        "Heavy gauge YKK two-way main zip closure",
        "Removable padded leather shoulder strap with brass snaphooks",
        "Reinforced base with 5 protective solid brass feet"
      ],
      inStock: true,
      featured: true,
      rating: "5.0",
      reviewCount: 18,
      sku: "LBD-DF-701"
    },
    {
      slug: "leather-biker-gloves-padded-protection",
      title: "Full-Finger Biker Gloves with Impact Cushioning",
      bengaliTitle: "ফুল-ফিঙ্গার লেদার বাইকার গ্লাভস প্যাডেড প্রটেকশনসহ",
      category: "jackets-gloves",
      price: 1550,
      compareAtPrice: 1850,
      description: "Modeled after The Leather BD’s famous LB-4009 biker gear. Crafted with pliable supple goatskin and cowhide for exceptional tactile handlebar control. Padded knuckle and palm protection with adjustable Velcro wrist strap.",
      leatherType: "Supple Drum-Dyed Cowhide & Textured Palm Grip",
      images: [
      "/product-images/leather-biker-gloves.webp",
      "/product-images/leather-biker-gloves-detail.webp"
      ],
      colors: [
        { name: "Onyx Black", hex: "#151515" },
        { name: "Distressed Tan", hex: "#7F4E27" }
      ],
      dimensions: "Sizes: M, L, XL (Palm Circumference 19cm - 24cm)",
      warranty: "6-Month Seam & Stitching Guarantee",
      features: [
        "Ergonomic high-density foam knuckle & palm cushioning",
        "Touchscreen compatible index finger & thumb tips",
        "Adjustable wrist cinch strap for dust and wind seal",
        "Micro-perforated finger vents for breathability in humid Dhaka weather"
      ],
      inStock: true,
      featured: false,
      rating: "4.8",
      reviewCount: 31,
      sku: "LBD-GL-4009"
    },
    {
      slug: "artisan-vintage-biker-leather-jacket",
      title: "Bengal Aviator Full-Grain Leather Jacket",
      bengaliTitle: "বেঙ্গল এভিয়েটর ১০০% পিওর ফুল-গ্রেইন লেদার জ্যাকেট",
      category: "jackets-gloves",
      price: 12500,
      compareAtPrice: 14500,
      description: "Our signature outerwear piece. Tailored from hand-selected 1.1mm nappa cowhide with a buttery, supple hand feel. Lined with smooth Japanese cupro satin, featuring antiqued heavy metal zips and throat latch.",
      leatherType: "100% Genuine Full-Grain Nappa Cowhide (1.1mm)",
      images: [
      "/product-images/leather-biker-jacket.webp",
      "/product-images/leather-biker-jacket-detail.webp"
      ],
      colors: [
        { name: "Vintage Cognac", hex: "#7E4724" },
        { name: "Obsidian Black", hex: "#171717" }
      ],
      dimensions: "Sizes: S, M, L, XL, XXL (Custom Tailoring Available)",
      warranty: "2-Year Comprehensive Leather & Hardware Warranty",
      features: [
        "Supple full-grain nappa hide that molds to your body",
        "Heavy-duty antiqued brass asymmetrical zip closure",
        "Zippered handwarmer pockets & hidden inner passport pocket",
        "Gusseted bi-swing back shoulders for uninhibited movement"
      ],
      inStock: true,
      featured: true,
      rating: "5.0",
      reviewCount: 15,
      sku: "TAS-JK-801"
    },
    {
      slug: "minimalist-pull-tab-leather-card-sleeve",
      title: "Slim Pull-Tab Minimalist Card Wallet",
      bengaliTitle: "স্লিম পুল-ট্যাব মিনিমালিস্ট লেদার কার্ড ওয়ালেট",
      category: "wallets",
      price: 650,
      compareAtPrice: 850,
      description: "Designed for the modern cashless professional. Holds up to 8 cards with an intuitive ribbon pull-tab for instant card ejection. Dedicated quick-draw front slot for your primary bKash/debit card.",
      leatherType: "Vegetable-Tanned Cowhide Leather",
      images: [
      "/product-images/artisan-leather-card-holder.webp",
      "/product-images/artisan-leather-card-holder-detail.webp"
      ],
      colors: [
        { name: "Caramel Tan", hex: "#A86532" },
        { name: "Forest Olive", hex: "#3A4B38" },
        { name: "Nightfall Black", hex: "#222222" }
      ],
      dimensions: "10.0 cm (H) × 7.2 cm (W) × 0.6 cm (Ultra Slim)",
      warranty: "6-Month Stitching Guarantee",
      features: [
        "Smart elastic pull-tab for effortless card access",
        "Front quick-access slot for transport or contactless card",
        "Central cash pocket for folded Bangladeshi bank notes",
        "Beveled edge stained by hand"
      ],
      inStock: true,
      featured: false,
      rating: "4.7",
      reviewCount: 39,
      sku: "URB-CS-108"
    },
    {
      slug: "artisan-hand-stitched-leather-watch-strap",
      title: "Artisan Saddle-Stitched Horween-Style Watch Strap",
      bengaliTitle: "আর্টিসান স্যাডল-স্টিচড প্রিমিয়াম লেদার ওয়াচ স্ট্র্যাপ",
      category: "accessories",
      price: 750,
      compareAtPrice: 950,
      description: "Upgrade your luxury timepiece or smart watch. Hand-stitched with waxed linen thread and burnished with natural beeswax. Compatible with Seiko, Tissot, Apple Watch (with adapter), and classic horology pieces.",
      leatherType: "Vegetable-Tanned Cowhide (Waxed Finish)",
      images: [
      "/product-images/leather-watch-strap.webp",
      "/product-images/leather-watch-strap-detail.webp"
      ],
      colors: [
        { name: "Vintage Tan", hex: "#9E5A28" },
        { name: "Chocolate Brown", hex: "#3D2418" },
        { name: "Jet Black", hex: "#1C1C1C" }
      ],
      dimensions: "Lug Width: 20mm or 22mm (Tapered to 18mm/20mm)",
      warranty: "6-Month Artisan Warranty",
      features: [
        "Quick-release stainless steel spring bars (no tools required)",
        "Hypoallergenic soft calfskin backing",
        "Brushed 316L stainless steel buckle",
        "Hand-saddle stitched with natural cream wax thread"
      ],
      inStock: true,
      featured: false,
      rating: "4.9",
      reviewCount: 27,
      sku: "TAS-WS-602"
    },
    {
      slug: "refillable-artisan-leather-journal-notebook",
      title: "Handcrafted Refillable Leather Travel Journal",
      bengaliTitle: "হ্যান্ডক্রাফটেড রিফিলেবল লেদার ট্রাভেল জার্নাল ও ডায়রি",
      category: "accessories",
      price: 950,
      compareAtPrice: 1200,
      description: "Encapsulate your thoughts, travel memories, or architectural sketches. Bound in raw unlined pull-up cowhide that scratches and heals naturally. Closed with an antique brass button stud and wrap-around leather thong.",
      leatherType: "100% Genuine Pull-Up Cowhide Leather",
      images: [
      "/product-images/vintage-leather-journal-cover.webp",
      "/product-images/vintage-leather-journal-cover-detail.webp"
      ],
      colors: [
        { name: "Heritage Brown", hex: "#8A4D27" },
        { name: "Rustic Espresso", hex: "#321E14" }
      ],
      dimensions: "8.5 inch (H) × 5.5 inch (W) - A5 Refill Standard",
      warranty: "Lifetime Leather Cover Guarantee",
      features: [
        "Contains 200 pages of 120gsm fountain-pen friendly unruled paper",
        "Easily refillable with standard A5 notebook inserts",
        "Leather pen loop holds your favorite writing instrument",
        "Hand-cut bookmark ribbon with leather leaf accent"
      ],
      inStock: true,
      featured: false,
      rating: "4.9",
      reviewCount: 24,
      sku: "URB-JN-902"
    }
  ];

  for (const product of initialProducts) {
    await prisma.product.upsert({ where: { slug: product.slug }, create: product, update: {} });
  }
  if (process.argv.includes("--products-only")) {
    console.log("Sample products are available.");
    return;
  }
  for (const [code, percent] of [["ARTISAN10", 10], ["HERITAGE15", 15]] as const) {
    await prisma.coupon.upsert({ where: { code }, create: { code, percent }, update: {} });
  }
  console.log("Sample products and coupons are available.");
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
