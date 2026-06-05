import type { Metadata } from "next";
import { getPaymentLinkBySlug } from "@/app/actions/payments";
import { getMerchantProfile } from "@/app/actions/merchant";
import { CheckoutView } from "@/features/payments";
import type { MerchantProfile } from "@/features/merchant";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getPaymentLinkBySlug(slug);

  let merchant: MerchantProfile | null = null;
  if (result.ok) {
    const profileResult = await getMerchantProfile(result.data.merchant_wallet);
    if (profileResult.ok) merchant = profileResult.data;
  }

  return <CheckoutView result={result} slug={slug} merchant={merchant} />;
}
