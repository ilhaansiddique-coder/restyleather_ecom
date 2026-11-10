import { Hono } from "hono";
import { chat } from "./routes/chat";
import { health } from "./routes/health";
import { homeCatalog } from "./routes/home-catalog";
import { listProducts } from "./routes/list-products";
import { newsletter } from "./routes/newsletter";
import { productDetail } from "./routes/product-detail";
import { trackOrder } from "./routes/track-order";
import { versionedApi } from "./server/versioned-api";
import { loadStoreProfile } from "./server/store-profile";

export const app = new Hono();

app.get("/api/health", health);
app.get("/api/products", (c) => listProducts(c.req.raw));
app.get("/api/products/:slug", (c) => productDetail(c.req.param("slug")));
app.get("/api/home-catalog", homeCatalog);
app.get("/api/store-profile", async (c) => c.json(await loadStoreProfile()));
app.get("/api/orders/track", (c) => trackOrder(c.req.raw));
app.post("/api/orders", (c) => {
  const request = c.req.raw;
  return versionedApi.fetch(new Request(new URL("/api/v1/store/orders", request.url), request));
});
app.post("/api/chat", (c) => chat(c.req.raw));
app.post("/api/newsletter", (c) => newsletter(c.req.raw));
app.route("/", versionedApi);

app.onError((error, c) => {
  console.error("Backend request failed", error.name);
  return c.json({ success: false, error: "Request failed." }, 500);
});
