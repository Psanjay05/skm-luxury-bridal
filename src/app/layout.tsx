import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://skm-luxury-bridal.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SKM Luxury Bridal Studio | Premier Bridal Makeup Artist in Salem",
    template: "%s | SKM Luxury Bridal Studio",
  },
  description:
    "Salem's premier luxury bridal makeup studio by Maha Shree. Specialized in HD & Airbrush Bridal Makeup, Hair Styling, Saree Box Pleating, and Antique Jewellery Rental.",
  keywords: [
    "Bridal makeup artist in Salem",
    "Bridal makeup Salem",
    "Makeup artist Salem Tamil Nadu",
    "Bridal makeup studio Salem",
    "Jewellery rental Salem",
    "Bridal hairstyling Salem",
    "Saree draping Salem",
    "Maha Shree bridal makeup",
    "HD bridal makeover Salem",
  ],
  authors: [{ name: "Maha Shree", url: siteUrl }],
  creator: "Maha Shree",
  publisher: "SKM Luxury Bridal Studio",
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SKM Luxury Bridal Studio | Premier Bridal Makeup Artist in Salem",
    description:
      "Transforming brides into timeless masterpieces. HD & Airbrush Makeup, Saree Box Pleating, Antique Jewellery Rental by Maha Shree in Salem.",
    url: siteUrl,
    siteName: "SKM Luxury Bridal Studio",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/portfolio/bridal-close-up-portrait.jpg",
        width: 1200,
        height: 630,
        alt: "SKM Luxury Bridal Makeup by Maha Shree Salem",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SKM Luxury Bridal Studio | Maha Shree Salem",
    description:
      "HD & Airbrush Bridal Makeup, Antique Jewellery Rental, Saree Pre-Pleating in Salem, Tamil Nadu.",
    images: ["/images/portfolio/bridal-close-up-portrait.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["BeautySalon", "LocalBusiness"],
  name: "SKM Luxury Bridal Studio",
  image: `${siteUrl}/images/portfolio/bridal-close-up-portrait.jpg`,
  description:
    "Premier luxury bridal studio in Salem specializing in HD & Airbrush Bridal Makeup, Hair Styling, Saree Pre-Pleating, and Antique Jewellery Rental by Maha Shree.",
  url: siteUrl,
  telephone: ["+91 8608194233", "+91 8973587806"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "4/39 Alagusamuthiram, Near Steel Plant",
    addressLocality: "Salem",
    addressRegion: "Tamil Nadu",
    postalCode: "636030",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "11.6643",
    longitude: "78.1460",
  },
  priceRange: "₹₹-₹₹₹",
  founder: {
    "@type": "Person",
    name: "Maha Shree",
    jobTitle: "Lead Bridal Makeup Artist",
  },
  sameAs: [
    "https://www.instagram.com/maha_unique_brides_23",
    "https://wa.me/918608194233",
    "https://wa.me/918973587806",
  ],
};

import { LanguageProvider } from "@/context/LanguageContext";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <GoogleAnalytics />
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
