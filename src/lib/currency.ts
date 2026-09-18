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

  const isFrom = lower.startsWith("from");
  const cleanStr = isFrom ? lower.replace(/^from\s*/i, "").trim() : lower;

  // Support 'k' or 'K' notation (e.g. "18k" -> 18000, "2.5k" -> 2500, "From 25k" -> "From ₹25,000")
  const kMatch = cleanStr.match(/^([0-9]+(?:\.[0-9]+)?)\s*k$/i);
  if (kMatch) {
    const kVal = Math.round(parseFloat(kMatch[1]) * 1000);
    const formatted = formatRupees(kVal);
    return isFrom ? `From ${formatted}` : formatted;
  }

  // Extract digits
  const digits = cleanStr.replace(/[^0-9]/g, "");
  if (!digits) {
    return str;
  }

  const num = Number(digits);
  if (isNaN(num)) return str;

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
