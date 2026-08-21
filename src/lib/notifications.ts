import nodemailer from "nodemailer";

export const STUDIO_PRIMARY_PHONE = "918608194233";
export const STUDIO_SECONDARY_PHONE = "918973587806";
export const STUDIO_EMAIL = process.env.NOTIFICATION_EMAIL_TO || "Mahashreesanjeevi48@gmail.com";
export const STUDIO_NAME = "SKM Luxury Bridal Studio";
export const STUDIO_ARTIST = "Maha Shree";
export const STUDIO_LOCATION = "4/39 Alagusamuthiram, Near Steel Plant, Salem, Tamil Nadu";

export interface BookingNotificationPayload {
  bookingReference: string;
  customerName: string;
  phone: string;
  email?: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  location: string;
  message?: string;
}

export interface ContactNotificationPayload {
  name: string;
  phone: string;
  email?: string;
  message: string;
}

// Create Nodemailer Transporter if SMTP credentials exist in environment
function getEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  return null;
}

/**
 * Sends automated Email & Webhook notifications for a new booking appointment.
 */
export async function sendBookingNotification(booking: BookingNotificationPayload) {
  const dateFormatted = new Date(booking.preferredDate).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const whatsappAdminText = `👑 *NEW BRIDAL BOOKING ALERT* 👑

📌 *Booking Ref:* ${booking.bookingReference}
👤 *Bride Name:* ${booking.customerName}
📞 *Phone:* +${booking.phone.replace(/[^0-9]/g, "")}
📧 *Email:* ${booking.email || "Not provided"}
💄 *Service:* ${booking.service}
📅 *Event Date:* ${dateFormatted}
⏰ *Time:* ${booking.preferredTime}
📍 *Venue:* ${booking.location}
📝 *Notes:* ${booking.message || "None"}

🔗 Open Admin to manage: https://skm-luxury-bridal.vercel.app/admin/bookings`;

  const whatsappAdminUrl = `https://wa.me/${STUDIO_PRIMARY_PHONE}?text=${encodeURIComponent(whatsappAdminText)}`;

  // 1. Send Email Notification to Studio Admin
  try {
    const transporter = getEmailTransporter();
    if (transporter) {
      // Email to Studio
      await transporter.sendMail({
        from: `"${STUDIO_NAME}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: STUDIO_EMAIL,
        subject: `👑 New Booking: ${booking.customerName} (${booking.service}) - ${booking.bookingReference}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0c870; border-radius: 12px; overflow: hidden; background: #faf9f6;">
            <div style="background: #1a1610; color: #d4af37; padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">SKM LUXURY BRIDAL STUDIO</h1>
              <p style="margin: 6px 0 0; color: #ffffff; font-size: 14px;">Salem, Tamil Nadu | Lead Artist: Maha Shree</p>
            </div>
            <div style="padding: 24px; color: #222222; line-height: 1.6;">
              <h2 style="color: #8b6b15; margin-top: 0;">New Appointment Request Received!</h2>
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr style="border-bottom: 1px solid #e5e5e5;"><td style="padding: 8px 0; font-weight: bold; width: 140px;">Booking Ref:</td><td style="color: #8b6b15; font-weight: bold;">${booking.bookingReference}</td></tr>
                <tr style="border-bottom: 1px solid #e5e5e5;"><td style="padding: 8px 0; font-weight: bold;">Bride Name:</td><td>${booking.customerName}</td></tr>
                <tr style="border-bottom: 1px solid #e5e5e5;"><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td><a href="tel:${booking.phone}">+${booking.phone}</a></td></tr>
                <tr style="border-bottom: 1px solid #e5e5e5;"><td style="padding: 8px 0; font-weight: bold;">Service / Package:</td><td>${booking.service}</td></tr>
                <tr style="border-bottom: 1px solid #e5e5e5;"><td style="padding: 8px 0; font-weight: bold;">Event Date:</td><td>${dateFormatted}</td></tr>
                <tr style="border-bottom: 1px solid #e5e5e5;"><td style="padding: 8px 0; font-weight: bold;">Time Slot:</td><td>${booking.preferredTime}</td></tr>
                <tr style="border-bottom: 1px solid #e5e5e5;"><td style="padding: 8px 0; font-weight: bold;">Venue / Location:</td><td>${booking.location}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Special Notes:</td><td>${booking.message || "None"}</td></tr>
              </table>
              <div style="margin-top: 24px; text-align: center;">
                <a href="${whatsappAdminUrl}" style="background: #25D366; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 8px;">Open in WhatsApp</a>
                <a href="https://skm-luxury-bridal.vercel.app/admin/bookings" style="background: #1a1610; color: #d4af37; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View in Admin Portal</a>
              </div>
            </div>
            <div style="background: #f0ebe1; padding: 12px; text-align: center; font-size: 12px; color: #666666;">
              SKM Luxury Bridal Studio • 4/39 Alagusamuthiram, Salem • +91 8608194233
            </div>
          </div>
        `,
      });

      // Confirmation Email to Bride if email provided
      if (booking.email) {
        await transporter.sendMail({
          from: `"${STUDIO_NAME}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
          to: booking.email,
          subject: `✨ Booking Request Confirmed: ${booking.bookingReference} - SKM Luxury Bridal Studio`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0c870; border-radius: 12px; overflow: hidden; background: #faf9f6;">
              <div style="background: #1a1610; color: #d4af37; padding: 24px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">SKM LUXURY BRIDAL STUDIO</h1>
                <p style="margin: 6px 0 0; color: #ffffff; font-size: 14px;">Bespoke Bridal Artistry by Maha Shree</p>
              </div>
              <div style="padding: 24px; color: #222222; line-height: 1.6;">
                <h2 style="color: #8b6b15; margin-top: 0;">Dear ${booking.customerName},</h2>
                <p>Thank you for choosing <strong>SKM Luxury Bridal Studio</strong> for your special day! We have received your booking request.</p>
                <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; margin: 16px 0;">
                  <p style="margin: 0 0 8px; font-size: 14px;"><strong>Reference Number:</strong> <span style="color: #8b6b15; font-weight: bold;">${booking.bookingReference}</span></p>
                  <p style="margin: 0 0 8px; font-size: 14px;"><strong>Package / Service:</strong> ${booking.service}</p>
                  <p style="margin: 0 0 8px; font-size: 14px;"><strong>Event Date:</strong> ${dateFormatted}</p>
                  <p style="margin: 0 0 8px; font-size: 14px;"><strong>Timing:</strong> ${booking.preferredTime}</p>
                  <p style="margin: 0; font-size: 14px;"><strong>Venue:</strong> ${booking.location}</p>
                </div>
                <p>Lead artist <strong>Maha Shree</strong> will contact you via WhatsApp (+91 8608194233) shortly to verify event schedule, trial sessions, and block your auspicious wedding date.</p>
                <div style="margin-top: 24px; text-align: center;">
                  <a href="https://wa.me/${STUDIO_PRIMARY_PHONE}?text=${encodeURIComponent(`Hi Maha Shree! My booking reference is ${booking.bookingReference} (${booking.customerName}).`)}" style="background: #25D366; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Connect with Maha Shree on WhatsApp</a>
                </div>
              </div>
              <div style="background: #f0ebe1; padding: 12px; text-align: center; font-size: 12px; color: #666666;">
                SKM Luxury Bridal Studio • Salem, Tamil Nadu • Phone: +91 8608194233 / +91 8973587806
              </div>
            </div>
          `,
        });
      }
    }
  } catch (emailErr) {
    console.warn("[NOTIFICATION_EMAIL_SKIPPED]", emailErr);
  }

  // 2. Optional Webhook (for external services e.g. Discord, Telegram, or CRM webhooks)
  if (process.env.NOTIFICATION_WEBHOOK_URL) {
    try {
      await fetch(process.env.NOTIFICATION_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "NEW_BOOKING",
          data: booking,
          whatsappUrl: whatsappAdminUrl,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (webhookErr) {
      console.warn("[NOTIFICATION_WEBHOOK_SKIPPED]", webhookErr);
    }
  }

  return {
    whatsappAdminUrl,
    whatsappAdminText,
  };
}

/**
 * Sends automated Email & Webhook notifications for a contact message inquiry.
 */
export async function sendMessageNotification(contact: ContactNotificationPayload) {
  const whatsappAdminText = `💬 *NEW CLIENT INQUIRY* 💬

👤 *Name:* ${contact.name}
📞 *Phone:* +${contact.phone.replace(/[^0-9]/g, "")}
📧 *Email:* ${contact.email || "Not provided"}
📝 *Message:* "${contact.message}"

🔗 Reply on WhatsApp: https://wa.me/${contact.phone.replace(/[^0-9]/g, "")}`;

  const whatsappAdminUrl = `https://wa.me/${STUDIO_PRIMARY_PHONE}?text=${encodeURIComponent(whatsappAdminText)}`;

  try {
    const transporter = getEmailTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: `"${STUDIO_NAME}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: STUDIO_EMAIL,
        subject: `💬 New Message from ${contact.name} - SKM Luxury Bridal Studio`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0c870; border-radius: 12px; overflow: hidden; background: #faf9f6;">
            <div style="background: #1a1610; color: #d4af37; padding: 20px; text-align: center;">
              <h2 style="margin: 0;">New Website Inquiry</h2>
            </div>
            <div style="padding: 24px; color: #222;">
              <p><strong>From:</strong> ${contact.name}</p>
              <p><strong>Phone:</strong> <a href="tel:${contact.phone}">+${contact.phone}</a></p>
              <p><strong>Email:</strong> ${contact.email || "Not provided"}</p>
              <p><strong>Message:</strong></p>
              <blockquote style="background: #ffffff; border-left: 4px solid #d4af37; margin: 12px 0; padding: 12px; font-style: italic;">
                ${contact.message}
              </blockquote>
              <div style="margin-top: 20px; text-align: center;">
                <a href="https://wa.me/91${contact.phone.replace(/[^0-9]/g, "")}" style="background: #25D366; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reply via WhatsApp</a>
              </div>
            </div>
          </div>
        `,
      });
    }
  } catch (err) {
    console.warn("[MESSAGE_EMAIL_SKIPPED]", err);
  }

  return { whatsappAdminUrl };
}
