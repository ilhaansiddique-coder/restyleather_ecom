CREATE TABLE "StoreProfile" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL,
    "accentColor" TEXT NOT NULL,
    "shippingPolicy" TEXT NOT NULL,
    "returnPolicy" TEXT NOT NULL,
    "privacyPolicy" TEXT NOT NULL,
    CONSTRAINT "StoreProfile_pkey" PRIMARY KEY ("id")
);
