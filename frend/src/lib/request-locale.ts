import { cookies } from "next/headers";
import { localeCookie, type Locale } from "./locale";

export async function getRequestLocale(): Promise<Locale> {
  return (await cookies()).get(localeCookie)?.value === "bn" ? "bn" : "en";
}
