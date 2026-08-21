import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bridal Portfolio & Real Bride Makeovers | SKM Studio Salem",
  description:
    "View real bride transformations, before & after makeovers, temple jewellery styling, and silk saree draping by lead artist Maha Shree in Salem.",
  keywords: [
    "Bridal makeup photos Salem",
    "Real brides Salem",
    "Before after bridal makeup",
    "South Indian bridal looks Salem",
  ],
  alternates: {
    canonical: "/gallery",
  },
  openGraph: {
    title: "Bridal Portfolio & Real Bride Makeovers | SKM Studio Salem",
    description:
      "Real bride makeovers, before/after photos, and temple jewellery styling by Maha Shree in Salem.",
    url: "/gallery",
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
