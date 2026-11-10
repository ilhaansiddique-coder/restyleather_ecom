export type Locale = "en" | "bn";
export const localeCookie = "resty_locale";

export const navigationText = {
  en: {
    shop: "Shop all", wallets: "Wallets & cards", bags: "Leather bags", footwear: "Footwear", belts: "Belts",
    craft: "Our craft", tracking: "Track order", login: "Sign in", signup: "Sign up", account: "My account",
    menu: "Toggle navigation", search: "Search products", wishlist: "View wishlist", bag: "My bag",
    support: "Store support", delivery: "Cash on delivery across 64 districts", language: "Language",
  },
  bn: {
    shop: "সব পণ্য", wallets: "ওয়ালেট ও কার্ড হোল্ডার", bags: "চামড়ার ব্যাগ", footwear: "জুতা", belts: "বেল্ট",
    craft: "আমাদের কারুকাজ", tracking: "অর্ডার ট্র্যাক করুন", login: "লগইন", signup: "সাইন আপ", account: "আমার অ্যাকাউন্ট",
    menu: "মেনু খুলুন বা বন্ধ করুন", search: "পণ্য খুঁজুন", wishlist: "পছন্দের তালিকা", bag: "আমার ব্যাগ",
    support: "স্টোর সহায়তা", delivery: "৬৪ জেলায় ক্যাশ অন ডেলিভারি", language: "ভাষা",
  },
} satisfies Record<Locale, Record<string, string>>;
