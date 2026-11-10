# ReStyleather

The repository has two npm workspaces. Run `npm run dev` from the root to start both.

| Location | What lives there |
| --- | --- |
| `frend/src/app/` | Next.js storefront, checkout, tracking, and staff dashboard pages |
| `frend/src/components/` | Reusable storefront components |
| `frend/src/context/` and `frend/src/lib/` | Cart and wishlist state, frontend types, and API calls |
| `frend/public/` | Images, logos, and other public assets |
| `frend/src/app/globals.css` and `frend/postcss.config.mjs` | Tailwind CSS, global styles, and PostCSS setup |
| `bend/src/index.ts` and `bend/src/app.ts` | Hono server entry point and API route registration |
| `bend/src/routes/` | Public storefront endpoints for catalog, tracking, health, chat, and newsletter |
| `bend/src/server/` | Versioned web and Flutter APIs, checkout rules, and authentication helpers |
| `bend/src/catalog/` | Demo product data |
| `bend/src/db/` and `bend/prisma/` | PostgreSQL client, Prisma schema, and migrations |
| `bend/seed.ts` and `bend/scripts/` | Sample data and first administrator setup |

Next.js runs at `http://localhost:3000`. Hono listens on `http://127.0.0.1:3001` by default. The frontend forwards `/api/*` to Hono, so browser calls and session cookies stay on the storefront origin. Flutter can use the same public origin or a directly exposed backend. For a separate backend host, configure `BACKEND_ORIGIN` before building the frontend. Set `BACKEND_PORT` to change the local API port and `BACKEND_HOST` if the backend needs to listen on another interface.

The storefront has customer signup, login, and an account page. These use a separate session cookie from the staff dashboard and require PostgreSQL. The EN/BN preference is saved in a browser cookie and controls the navigation, customer account screens, and product title display. The frontend bundles DM Sans, Libre Baskerville, and Hind Siliguri.

## Local setup

1. Install dependencies with `npm ci` and copy `.env.example` to `.env`. Set `DATABASE_URL` to a PostgreSQL database and `APP_ORIGIN` to the browser origin.
2. Run `npm run db:migrate`. The development command generates the Prisma client before starting Hono.
3. Optionally run `npm run db:seed` to add sample products and coupons. The seed does not truncate tables or overwrite existing products and coupons.
4. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (at least 12 characters), run `npm run admin:create`, and remove the bootstrap credentials from the environment.
5. Run `npm run dev` and open `http://localhost:3000/dashboard`.

For an existing **ReStyleather Drizzle database**, back up the database and compare the three existing tables with `bend/prisma/migrations/20261106000100_storefront/migration.sql`. If they match, run `npm exec --workspace bend -- prisma migrate resolve --applied 20261106000100_storefront`, then run `npm run db:migrate`. The second migration adds management tables and order fields without replacing the catalog or orders. Use a separate database from AkhyanBD, whose schema differs. Apply migrations before starting a production release. Run `npm run build` and `npm start` from the root to run the production build. Production sign-in requires HTTPS.

The storefront can browse sample products without PostgreSQL. Checkout and the dashboard require a database. Checkout currently accepts cash on delivery. The dashboard saves the preferred courier and whether it is enabled. Booking parcels and receiving courier tracking events require a separate provider integration.

## API

Staff can manage products, orders, and coupons and read shipping and courier settings. Administrators can also manage staff accounts and change settings. Turning off an account or resetting its password revokes its sessions.

Administrators create branches, assign staff and online orders to branches, and maintain the vendor and supplier directories. Branch managers can view and update orders and record accounts for their assigned branch. Sales executives can read their branch's orders. New online orders start unassigned and are visible to global staff until an administrator routes them. Staff can change their own password in the dashboard, which revokes their sessions and requires a new sign-in.

The Accounts tab is a manual, append-only BDT ledger. Gross profit equals recorded revenue minus refunds and cost of goods sold. Net profit also subtracts operating expenses. The report can be filtered by booking date and branch. An order does not post revenue automatically. Reconcile paid orders, COD settlements, returns, and costs before relying on the figures. This is an operating report rather than a statutory accounting system.

Run `npm run test:operations --workspace bend` with `TEST_DATABASE_URL` set to a disposable database where the migrations have been applied. The test writes fixture rows and checks branch isolation, permission boundaries, exact profit calculations, and session revocation.

Use **Store setup** in the dashboard to change the displayed name, logo, button colors, contact information, and published policies. The public URL is used for canonical product links, social previews, product structured data, and `/sitemap.xml`. Set `STOREFRONT_URL` as the fallback before the first setup. The domain still needs to be connected at the hosting provider. The homepage and category navigation still use the leather catalog template.

The Audit tab shows recent changes to staff, orders, branches, partners, store setup, and accounts. Newsletter signups are stored in PostgreSQL. Campaign delivery and unsubscribe handling require a mailing provider integration.

Web sign-in uses `POST /api/v1/auth/login`, and the dashboard uses `/api/v1/admin`. For Flutter, send `{ "email": "...", "password": "..." }` to `POST /api/v1/m/auth/login`. The response includes `user`, `token`, and `expiresAt`. Send `Authorization: Bearer <token>` on subsequent calls and store the token in secure storage. Set `FLUTTER_WEB_ORIGIN` to allow a specific Flutter web origin.

| Flutter route under `/api/v1/m` | Methods |
| --- | --- |
| `/auth/me`, `/auth/logout` | GET, POST respectively |
| `/dashboard` | GET |
| `/products`, `/products/:id` | GET/POST, GET/PATCH |
| `/orders`, `/orders/:id` | GET/POST, GET/PATCH |
| `/orders/statuses`, `/orders/:id/cancel` | GET, POST respectively |
| `/coupons`, `/coupons/:id` | GET/POST, PATCH/DELETE |
| `/staff`, `/staff/:id` | GET/POST, PATCH |
| `/admin/shipping`, `/admin/courier` | GET/PUT |

Lists use `data` and `pagination`, with `page` and `pageSize` query parameters. Product records use the leather storefront fields in `bend/prisma/schema.prisma` such as `title`, `leatherType`, and `colors`. Orders use `trackingCode`, `orderStatus`, and line items with `productId`, `quantity`, and optional `selectedColor`. Flutter should use the status keys returned by `/orders/statuses`. An existing AkhyanBD Flutter client needs model and feature mapping before switching its base URL.

`POST /api/v1/store/quote` calculates current prices, coupons, and delivery. `POST /api/v1/store/orders` accepts the same cart data with customer details. Send the quoted total as `expectedTotal` to reject a price change and reuse a UUID `requestKey` when retrying the same submission.
