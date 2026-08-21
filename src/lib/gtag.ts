/**
 * Google Analytics 4 (GA4) Helper for SKM Luxury Bridal Studio
 */

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || "G-SKMBRIDAL26";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

// Track pageviews
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Track specific conversion events
export type GTagEvent =
  | "booking_submit"
  | "whatsapp_click"
  | "package_builder_quote"
  | "gallery_view_item"
  | "jewellery_rental_click"
  | "call_studio_click";

export const trackEvent = (
  eventName: GTagEvent | string,
  parameters: Record<string, unknown> = {}
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, parameters);
  }
};
