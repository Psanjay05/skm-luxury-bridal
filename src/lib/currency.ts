/**
 * Currency Formatting & Sanitization Utilities
 * Formats directly in Indian Rupees (INR) using Intl.NumberFormat('en-IN').
 * Stored prices are already in whole Rupees — NEVER divide by 100 (subunit division).
 */

export function sanitizePriceInput(input: string | number): string {
  if (typeof input === "number") {
    return formatRupees(input);
  }

  const str = String(input).trim();
  if (!str) return "From ₹9,999";

  const lower = str.toLowerCase();
  if (lower === "contact us" || lower === "contact for quote") {
    return "Contact Us";
  }

  // Extract digits
  const digits = str.replace(/[^0-9]/g, "");
  if (!digits) {
    return str;
  }

  const num = Number(digits);
  if (isNaN(num)) return str;

  const isFrom = lower.startsWith("from");
  const formatted = formatRupees(num);

  return isFrom ? `From ${formatted}` : formatted;
}

export function formatRupees(amount: number): string {
  // Stored price is already in Rupees. Format directly without subunit division!
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parseRupeesNumber(input: string | number): number {
  if (typeof input === "number") return input;
  const digits = String(input).replace(/[^0-9]/g, "");
  return digits ? Number(digits) : 0;
}
