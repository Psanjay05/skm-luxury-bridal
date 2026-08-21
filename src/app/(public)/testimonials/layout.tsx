import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bride Reviews & Testimonials | SKM Luxury Bridal Studio Salem",
  description:
    "Read genuine feedback and 5-star reviews from 500+ brides across Salem who chose Maha Shree for their wedding, engagement, and reception looks.",
  keywords: [
    "Bridal makeup reviews Salem",
    "SKM luxury bridal testimonials",
    "Maha Shree customer reviews",
    "Best bridal makeup artist Salem rating",
  ],
  alternates: {
    canonical: "/testimonials",
  },
  openGraph: {
    title: "Bride Reviews & Testimonials | SKM Luxury Bridal Studio Salem",
    description:
      "5-star reviews and real bride stories from Muhurtham and Reception makeovers in Salem.",
    url: "/testimonials",
  },
};

export default function TestimonialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
