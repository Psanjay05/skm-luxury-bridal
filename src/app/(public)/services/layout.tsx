import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bridal Beauty Services in Salem | Makeup, Hair, Saree Draping & Jewellery",
  description:
    "Full range of bridal artistry services by Maha Shree in Salem: Muhurtham HD Makeup, Reception Styling, Saree Pre-Pleating, Flower Jada, and Antique Jewellery Sets.",
  keywords: [
    "Bridal services Salem",
    "Saree pleating Salem",
    "Flower jada Salem",
    "Engagement makeup Salem",
    "South Indian bridal styling Salem",
  ],
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Bridal Beauty Services in Salem | SKM Luxury Bridal Studio",
    description:
      "Bridal Makeup, Hairstyling, Saree Draping, and Jewellery Rental services by Maha Shree in Salem.",
    url: "/services",
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
