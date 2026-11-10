import { fileURLToPath } from "node:url";
import { config } from "dotenv";

config({ path: fileURLToPath(new URL("../../.env", import.meta.url)), quiet: true });

if (process.argv.includes("--production")) process.env.NODE_ENV = "production";
