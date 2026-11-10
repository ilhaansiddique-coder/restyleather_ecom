import { CustomerAccount } from "@/components/CustomerAccount";
import { navigationText } from "@/lib/locale";
import { getRequestLocale } from "@/lib/request-locale";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  return { title: navigationText[locale].signup, robots: { index: false } };
}

export default async function Page() {
  return <CustomerAccount mode="signup" locale={await getRequestLocale()} />;
}
