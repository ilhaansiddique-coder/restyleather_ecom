import "./env";
import { serve } from "@hono/node-server";
import { app } from "./app";
import { prisma } from "./db/prisma";

const port = Number(process.env.BACKEND_PORT ?? 3001);
const hostname = process.env.BACKEND_HOST ?? "127.0.0.1";

const server = serve({ fetch: app.fetch, port, hostname }, (info) => {
  console.log("Hono listening at http://" + hostname + ":" + info.port);
});

function stop() {
  server.close(() => void prisma.$disconnect());
}

process.once("SIGINT", stop);
process.once("SIGTERM", stop);
