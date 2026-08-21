import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bridal Jewellery Rental in Salem | Antique Temple Gold Sets & Ottiyanam",
  description:
    "Rent premium bridal jewellery in Salem. Antique matte-finish temple harams, choker sets, jhumkas, maang tikka, vanki, and hip belts (ottiyanam) at affordable daily rental rates.",
  keywords: [
    "Jewellery rental Salem",
    "Bridal jewellery rent Salem",
    "Temple jewellery rental Salem",
    "Antique bridal sets rent Salem",
    "Ottiyanam rental Salem",
  ],
  alternates: {
    canonical: "/jewellery-rental",
  },
  openGraph: {
    title: "Bridal Jewellery Rental in Salem | SKM Luxury Bridal Studio",
    description:
      "Antique temple gold harams, chokers, jhumkas, and ottiyanam for rent in Salem at affordable rates.",
    url: "/jewellery-rental",
  },
};

export default function JewelleryRentalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
