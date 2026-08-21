import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Maha Shree | Lead Bridal Artist & SKM Luxury Bridal Studio Salem",
  description:
    "Meet Maha Shree, certified bridal makeup artist with 3+ years experience and 500+ brides transformed across Salem and Tamil Nadu. Learn our artistry philosophy.",
  keywords: [
    "About Maha Shree",
    "Makeup artist bio Salem",
    "Certified bridal MUA Salem",
    "SKM Luxury Bridal history Salem",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Maha Shree | SKM Luxury Bridal Studio Salem",
    description:
      "Certified bridal makeup artist with 3+ years experience and 500+ transformed brides in Salem.",
    url: "/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
