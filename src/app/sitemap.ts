import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://skmluxurybridal.com";

  const publicRoutes = [
    "",
    "/about",
    "/services",
    "/bridal-packages",
    "/jewellery-rental",
    "/gallery",
    "/testimonials",
    "/booking",
    "/faq",
    "/contact",
    "/privacy-policy",
    "/terms",
  ];

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/booking" || route === "/services" ? 0.9 : 0.8,
  }));
}
