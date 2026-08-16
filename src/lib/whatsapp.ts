export const STUDIO_PRIMARY_PHONE = "918608194233";
export const STUDIO_SECONDARY_PHONE = "918973587806";

export interface BookingWhatsAppDetails {
  bookingReference: string;
  customerName: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  location: string;
}

export function generateBookingWhatsAppUrl(details: BookingWhatsAppDetails): string {
  const text = `Hi SKM Luxury Bridal Studio! I have submitted a booking request.

📌 Reference: ${details.bookingReference}
👤 Name: ${details.customerName}
💄 Service: ${details.service}
📅 Date: ${details.preferredDate}
⏰ Time: ${details.preferredTime}
📍 Location: ${details.location}

Please verify date availability and confirm my reservation.`;

  return `https://wa.me/${STUDIO_PRIMARY_PHONE}?text=${encodeURIComponent(text)}`;
}

export function generateContactWhatsAppUrl(name: string, message: string): string {
  const text = `Hi Maha Shree! My name is ${name}. I sent an inquiry from your SKM Luxury Bridal Studio website:

"${message}"`;

  return `https://wa.me/${STUDIO_PRIMARY_PHONE}?text=${encodeURIComponent(text)}`;
}
