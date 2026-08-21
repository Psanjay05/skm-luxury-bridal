import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bridal Makeup Packages & Pricing in Salem | HD & Airbrush Rates",
  description:
    "Explore bridal makeup packages by Maha Shree in Salem. Classic HD, Royal Muhurtham, and Luxury Airbrush packages with transparent pricing, saree draping, and jewellery rental.",
  keywords: [
    "Bridal makeup packages Salem",
    "Bridal makeup price Salem",
    "HD bridal makeover cost Salem",
    "Airbrush bridal makeup Salem",
    "Maha Shree bridal packages",
  ],
  alternates: {
    canonical: "/bridal-packages",
  },
  openGraph: {
    title: "Bridal Makeup Packages & Pricing in Salem | SKM Studio",
    description:
      "Classic HD, Royal Muhurtham, and Luxury Airbrush bridal packages with saree draping and jewellery rental in Salem.",
    url: "/bridal-packages",
  },
};

export default function BridalPackagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
