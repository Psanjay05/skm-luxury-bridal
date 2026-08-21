import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact SKM Luxury Bridal Studio | Salem Location, WhatsApp & Phone",
  description:
    "Get in touch with Maha Shree at SKM Luxury Bridal Studio in Salem. Studio address, direct WhatsApp chat, phone contact, and Google Maps directions.",
  keywords: [
    "SKM bridal studio Salem address",
    "Maha Shree phone number",
    "Bridal makeup studio Salem contact",
    "Bridal artist WhatsApp Salem",
  ],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact SKM Luxury Bridal Studio | Salem Location & Phone",
    description:
      "Salem studio location near Steel Plant, WhatsApp booking hotline, and studio visit appointments.",
    url: "/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
