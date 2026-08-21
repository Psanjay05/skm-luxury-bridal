import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Bridal Makeup Appointment | Maha Shree Studio Salem",
  description:
    "Reserve your wedding, reception, or engagement makeup date with Maha Shree at SKM Luxury Bridal Studio Salem. Instant date availability check and booking confirmation.",
  keywords: [
    "Book bridal makeup Salem",
    "Wedding makeup appointment Salem",
    "Bridal studio Salem booking",
    "Muhurtham makeup slot booking Salem",
  ],
  alternates: {
    canonical: "/booking",
  },
  openGraph: {
    title: "Book Bridal Makeup Appointment | SKM Studio Salem",
    description:
      "Reserve your bridal makeover date with Maha Shree. Instant availability check for Salem weddings.",
    url: "/booking",
  },
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
