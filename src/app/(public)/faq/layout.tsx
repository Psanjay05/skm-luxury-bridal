import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bridal Makeup & Jewellery FAQs | SKM Studio Salem",
  description:
    "Frequently asked questions about bridal makeup trials, pricing, advance booking, sweat-proof HD finish, saree pre-pleating, and jewellery rental policies in Salem.",
  keywords: [
    "Bridal makeup FAQ Salem",
    "Wedding makeup questions Salem",
    "Jewellery rental deposit FAQ Salem",
    "Bridal trial makeup Salem FAQ",
  ],
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "Bridal Makeup & Jewellery FAQs | SKM Studio Salem",
    description:
      "Answers to common questions about bridal makeup trials, booking deposits, and jewellery rental in Salem.",
    url: "/faq",
  },
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
