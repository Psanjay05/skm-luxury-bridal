/**
 * UPI Deep Link Generator for SKM Luxury Bridal Studio
 * Supports Google Pay, PhonePe, Paytm, BHIM, etc.
 */

export interface UpiPaymentOptions {
  payeeVpa?: string; // Default: 8608194233@upi / 8608194233@okaxis
  payeeName?: string; // Default: Maha Shree SKM Luxury Bridal
  amount?: number | string; // e.g. 5000 for advance deposit
  transactionNote?: string; // e.g. "Advance for Booking SKM-2026-12345"
  transactionRef?: string; // e.g. "SKM-2026-12345"
}

export const DEFAULT_STUDIO_VPA = process.env.NEXT_PUBLIC_STUDIO_UPI_VPA || "8608194233@upi";
export const DEFAULT_STUDIO_PAYEE_NAME = "Maha Shree SKM Luxury Bridal";
export const DEFAULT_ADVANCE_DEPOSIT = 5000;

/**
 * Generates an interoperable UPI URL scheme:
 * upi://pay?pa=...&pn=...&am=...&tn=...&cu=INR
 */
export function generateUpiDeepLink(options: UpiPaymentOptions = {}): string {
  const {
    payeeVpa = DEFAULT_STUDIO_VPA,
    payeeName = DEFAULT_STUDIO_PAYEE_NAME,
    amount = DEFAULT_ADVANCE_DEPOSIT,
    transactionNote = "SKM Luxury Bridal Booking Advance",
    transactionRef = "",
  } = options;

  const params = new URLSearchParams();
  params.set("pa", payeeVpa);
  params.set("pn", payeeName);
  if (amount) params.set("am", amount.toString());
  params.set("cu", "INR");
  if (transactionNote) params.set("tn", transactionNote);
  if (transactionRef) params.set("tr", transactionRef);

  return `upi://pay?${params.toString()}`;
}

/**
 * Formats a WhatsApp message containing the direct UPI deep link and backup text
 */
export function formatUpiWhatsAppMessage(booking: {
  customerName: string;
  bookingReference?: string;
  preferredDate: string | Date;
  service?: string;
  advanceAmount?: number;
}): string {
  const ref = booking.bookingReference ?? "SKM-BOOKING";
  const dateFormatted = new Date(booking.preferredDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const amount = booking.advanceAmount || DEFAULT_ADVANCE_DEPOSIT;

  const upiLink = generateUpiDeepLink({
    payeeVpa: DEFAULT_STUDIO_VPA,
    payeeName: DEFAULT_STUDIO_PAYEE_NAME,
    amount,
    transactionNote: `Advance for ${ref}`,
    transactionRef: ref,
  });

  return `👑 *SKM Luxury Bridal Studio — Advance Payment Request*\n\n` +
    `Dear ${booking.customerName},\n` +
    `To officially block and guarantee your wedding makeover date (*${dateFormatted}*) for *${booking.service || "Bridal Service"}*, please remit the advance booking deposit.\n\n` +
    `💰 *Advance Deposit Amount:* ₹${amount.toLocaleString("en-IN")}\n` +
    `🏷️ *Booking Reference:* ${ref}\n\n` +
    `📲 *1-Tap Instant UPI Payment:* \n${upiLink}\n\n` +
    `💳 *Manual Payment Info:*\n` +
    `• UPI ID: \`${DEFAULT_STUDIO_VPA}\`\n` +
    `• Google Pay / PhonePe Number: *+91 86081 94233*\n` +
    `• Payee Name: *${DEFAULT_STUDIO_PAYEE_NAME}*\n\n` +
    `Kindly share the payment screenshot here once done to receive your formal confirmation receipt! ✨`;
}
