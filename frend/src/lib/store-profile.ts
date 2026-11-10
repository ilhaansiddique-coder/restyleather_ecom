import { cache } from "react";
import { catalogRequest } from "./storefront-catalog";

type StoreProfile = {
  name: string;
  description: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  domain: string;
  primaryColor: string;
  accentColor: string;
  shippingPolicy: string;
  returnPolicy: string;
  privacyPolicy: string;
};

const fallback: StoreProfile = {
  name: "ReStyleather", description: "Handcrafted leather goods from Bangladesh.", logoUrl: "/logo.webp",
  contactEmail: "info@theleatherbd.com", contactPhone: "+8801725293963", domain: "",
  primaryColor: "#1c1364", accentColor: "#f15a25", shippingPolicy: "", returnPolicy: "", privacyPolicy: "",
};

export const getStoreProfile = cache(async () => await catalogRequest<StoreProfile>("/api/store-profile") ?? fallback);

export const policyLabels = {
  shippingPolicy: "Shipping policy",
  returnPolicy: "Returns policy",
  privacyPolicy: "Privacy policy",
} as const;
