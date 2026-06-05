import type { Metadata } from "next";
import { getPaymentLinkBySlug } from "@/app/actions/payments";
import { CheckoutView } from "@/features/payments";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getPaymentLinkBySlug(slug);
  return <CheckoutView result={result} slug={slug} />;
}
