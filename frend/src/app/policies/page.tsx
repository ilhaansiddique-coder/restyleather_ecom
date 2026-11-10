import { getStoreProfile, policyLabels } from "@/lib/store-profile";

export const metadata = { title: "Store policies" };

export default async function PoliciesPage() {
  const profile = await getStoreProfile();
  const policies = (Object.keys(policyLabels) as (keyof typeof policyLabels)[]).filter((key) => profile[key]);
  return <article className="mx-auto max-w-3xl space-y-7 px-5 py-12">
    <h1 className="text-3xl font-bold">Store policies</h1>
    {policies.map((key) => <section id={key} key={key} className="space-y-2">
      <h2 className="text-xl font-semibold">{policyLabels[key]}</h2>
      <p className="whitespace-pre-wrap break-words">{profile[key]}</p>
    </section>)}
    {!policies.length && <p>Contact <a className="underline" href={"mailto:" + profile.contactEmail}>{profile.contactEmail}</a> for policy information.</p>}
  </article>;
}
