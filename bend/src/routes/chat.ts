interface ChatResponse {
  reply: string;
  suggestedAction?: {
    type: "view_product" | "track_order" | "link";
    label: string;
    target: string;
  };
}

function chatResponse(data: ChatResponse) {
  return Response.json(data);
}

export async function chat(request: Request) {
  try {
    const body = await request.json();
    const message = body && typeof body === "object" && "message" in body ? body.message : undefined;
    if (!message || typeof message !== "string") {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const lower = message.toLowerCase().trim();

    // Check for order tracking
    const trackingMatch = message.match(/BD-\d{5}/i);
    if (trackingMatch) {
      const code = trackingMatch[0].toUpperCase();
      return chatResponse({
        reply: `I see tracking code ${code}! You can track its live courier status directly using our real-time tracker.`,
        suggestedAction: {
          type: "track_order",
          label: `Track Parcel ${code}`,
          target: `/track-order?code=${code}`,
        },
      });
    }

    if (lower.includes("track") || lower.includes("status") || lower.includes("order") || lower.includes("কুরিয়ার")) {
      return chatResponse({
        reply: "You can track your genuine leather parcel anytime with your tracking code (e.g. BD-78291). We ship via Steadfast and Pathao express courier across all 64 districts.",
        suggestedAction: {
          type: "track_order",
          label: "Open Order Tracker",
          target: "/track-order",
        },
      });
    }

    // Leather quality / Full-grain vs Top-grain
    if (lower.includes("full grain") || lower.includes("top grain") || lower.includes("grain") || lower.includes("fake") || lower.includes("pure") || lower.includes("চামড়া") || lower.includes("আসল")) {
      return chatResponse({
        reply: "Every single piece from our workshop is made from 100% pure Bangladeshi cowhide. We only use Full-Grain and Top-Grain layers—never bonded faux leather or split PU. Full-grain preserves the natural pores and develops a rich patina over the years rather than cracking.",
        suggestedAction: {
          type: "link",
          label: "Read Our Tannery Heritage",
          target: "/craftsmanship",
        },
      });
    }

    // Wallets & Passport holders
    if (lower.includes("wallet") || lower.includes("card") || lower.includes("passport") || lower.includes("টাকা") || lower.includes("ওয়ালেট")) {
      return chatResponse({
        reply: "Our two most beloved leather pieces are the Paige Cowhide Passport Holder (৳1,450) and the Classic Pull-Up Bifold Wallet (৳850). Both feature deep currency slots that easily hold 1000 Taka notes without bending.",
        suggestedAction: {
          type: "view_product",
          label: "View Paige Passport Holder",
          target: "/product/paige-leather-passport-holder",
        },
      });
    }

    // Bags & Briefcases
    if (lower.includes("bag") || lower.includes("briefcase") || lower.includes("laptop") || lower.includes("office") || lower.includes("ব্যাগ")) {
      return chatResponse({
        reply: "For office executives and lawyers, our Hemayetpur Executive Briefcase (৳5,850) features a dedicated padded 15.6-inch laptop pocket and solid brass buckles. For travel, the Savar Weekender Duffel (৳7,450) includes a separate shoe compartment.",
        suggestedAction: {
          type: "view_product",
          label: "View Hemayetpur Briefcase",
          target: "/product/hemayetpur-artisan-executive-briefcase",
        },
      });
    }

    // Footwear & Shoes
    if (lower.includes("shoe") || lower.includes("derby") || lower.includes("oxford") || lower.includes("জুতা") || lower.includes("boot")) {
      return chatResponse({
        reply: "Our Bengal Heritage Derby shoes (৳4,650) are handcrafted using genuine Goodyear-welted construction with hand-burnished aniline calfskin. They are fully resoleable and come with a 6-month resoling guarantee.",
        suggestedAction: {
          type: "view_product",
          label: "Explore Footwear",
          target: "/shop?category=footwear",
        },
      });
    }

    // Delivery & Shipping
    if (lower.includes("delivery") || lower.includes("shipping") || lower.includes("charge") || lower.includes("সময়") || lower.includes("ডেলিভারি")) {
      return chatResponse({
        reply: "We deliver across all 64 districts in Bangladesh. Choose your district at checkout to see your delivery fee.",
      });
    }

    // Payment / Cash on Delivery / bKash
    if (lower.includes("cod") || lower.includes("cash on delivery") || lower.includes("bkash") || lower.includes("nagad") || lower.includes("টাকা দিব")) {
      return chatResponse({
        reply: "Cash on delivery is available across Bangladesh. You can inspect the leather in front of the delivery rider before paying.",
      });
    }

    // Leather Care & Maintenance
    if (lower.includes("care") || lower.includes("clean") || lower.includes("oil") || lower.includes("polish") || lower.includes("যত্ন")) {
      return chatResponse({
        reply: "To care for your full-grain leather: 1) Keep it dry and well-ventilated (never wrap in airtight plastic). 2) Condition once every 4–6 months with a pea-sized amount of natural beeswax or leather balm. 3) If it gets wet in monsoon rain, let it air dry naturally away from direct heaters.",
      });
    }

    // Showroom / Location / Savar
    if (lower.includes("location") || lower.includes("address") || lower.includes("shop") || lower.includes("store") || lower.includes("দোকান") || lower.includes("শোরুম")) {
      return chatResponse({
        reply: "You are welcome to visit our physical locations! 📍 Atelier & Showroom: Shop 4/33, Level 4 (Lift 3), Eastern Plaza Shopping Complex, Hatirpool, Dhaka. 📍 Master Tannery Workshop: 2nd Gate, Tannery Industrial Estate, Hemayetpur, Savar, Dhaka.",
      });
    }

    // Discount / Coupon
    if (lower.includes("discount") || lower.includes("coupon") || lower.includes("offer") || lower.includes("ছাড়")) {
      return chatResponse({
        reply: "Exclusive for you: Use promo code ARTISAN10 at checkout to receive an instant 10% discount on your order!",
        suggestedAction: {
          type: "link",
          label: "Shop Handcrafted Collection",
          target: "/shop",
        },
      });
    }

    // Default friendly artisan response
    return chatResponse({
      reply: "Assalamu Alaikum! I am Karigor AI, your master leather concierge. How can I assist you today? I can help you pick the ideal full-grain leather wallet, briefcase, or footwear, track an active parcel, or explain our Savar tannery process.",
      suggestedAction: {
        type: "link",
        label: "Browse All Collections",
        target: "/shop",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { reply: "Our workshop concierge is temporarily catching breath. Please call or WhatsApp us at +880 1725-293963." },
      { status: 500 }
    );
  }
}
