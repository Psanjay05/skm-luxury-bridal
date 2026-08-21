"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingSchema, BookingInput } from "@/lib/validations/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  MessageCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";
import { trackEvent } from "@/lib/gtag";

const SERVICE_OPTIONS = [
  { name: "Royal HD Makeover Package", price: "₹25,000", tag: "Most Popular" },
  { name: "Classic Bridal Package", price: "₹18,000", tag: "Essential" },
  { name: "Luxury Airbrush Grand Package", price: "₹35,000", tag: "Waterproof 18h" },
  { name: "Luxury HD Bridal Makeup", price: "₹9,999", tag: "HD Finish" },
  { name: "Airbrush Bridal Makeup", price: "₹12,999", tag: "Airbrush" },
  { name: "Reception / Engagement Makeup", price: "₹7,999", tag: "Evening Glam" },
  { name: "Saree Draping & Hair Styling", price: "₹2,500", tag: "Box Pleating" },
  { name: "Jewellery Rental Service", price: "From ₹1,200", tag: "Temple Gold" },
];

const TIME_SLOT_PRESETS = [
  { label: "Early Morning Muhurtham (4:00 AM – 7:30 AM)", time: "04:30" },
  { label: "Morning Session (8:00 AM – 11:30 AM)", time: "08:30" },
  { label: "Afternoon Engagement / Mehendi (12:00 PM – 3:30 PM)", time: "12:30" },
  { label: "Evening Reception Glam (5:00 PM – 8:30 PM)", time: "17:30" },
];

function BookingFormContent() {
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get("service") || "";

  const [serviceOptions, setServiceOptions] = useState(SERVICE_OPTIONS);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [availabilityData, setAvailabilityData] = useState<{
    availability: "available" | "limited" | "fully_booked";
    message: string;
  } | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: "",
      phone: "",
      service: serviceParam,
      preferredDate: "",
      preferredTime: "",
      location: "",
      message: "",
      email: "",
      website_hp: "",
    },
  });

  const currentService = watch("service");
  const currentDate = watch("preferredDate");
  const currentTime = watch("preferredTime");
  const currentName = watch("customerName");
  const currentLocation = watch("location");

  useEffect(() => {
    async function loadLiveServices() {
      try {
        const res = await fetch("/api/services", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache, no-store" },
        });
        const json = await res.json();
        if (res.ok && json.success && Array.isArray(json.data) && json.data.length > 0) {
          const dbServices: Array<{ title: string; price: string }> = json.data;
          setServiceOptions((prev) =>
            prev.map((opt) => {
              const match = dbServices.find(
                (s) => s.title.toLowerCase().trim() === opt.name.toLowerCase().trim()
              );
              return match ? { ...opt, price: match.price } : opt;
            })
          );
        }
      } catch (err) {
        console.warn("[BOOKING_PAGE] Failed to load live services:", err);
      }
    }
    loadLiveServices();
  }, []);

  useEffect(() => {
    if (serviceParam) {
      setValue("service", serviceParam);
    }
  }, [serviceParam, setValue]);

  useEffect(() => {
    if (!currentDate) {
      setAvailabilityData(null);
      return;
    }
    async function checkDateAvailability() {
      setCheckingAvailability(true);
      try {
        const res = await fetch(`/api/bookings/availability?date=${encodeURIComponent(currentDate)}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache, no-store" },
        });
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          setAvailabilityData(json.data);
        } else {
          setAvailabilityData({
            availability: "available",
            message: "✅ Date open for reservation",
          });
        }
      } catch (err) {
        console.error("[DATE_AVAILABILITY_ERROR]", err);
      } finally {
        setCheckingAvailability(false);
      }
    }
    checkDateAvailability();
  }, [currentDate]);

  const onSubmit = async (data: BookingInput) => {
    setSubmitError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setSuccessRef(json.data?.bookingReference || "SKM-BOOKING-CONFIRMED");
        trackEvent("booking_submit", {
          service: data.service,
          date: data.preferredDate,
          location: data.location,
        });
        reset();
      } else {
        setSubmitError(
          json.error || "Failed to submit booking request. Please try again or connect via WhatsApp."
        );
      }
    } catch (err) {
      console.error("[BOOKING_SUBMIT_ERROR]", err);
      setSubmitError("Network connection error. Please check your internet connection and try again.");
    }
  };

  const generateWhatsAppDirectLink = () => {
    trackEvent("whatsapp_click", {
      source: "booking_page_urgent",
      service: currentService,
      date: currentDate,
    });
    const text = encodeURIComponent(
      `Hello Maha Shree, I would like to check booking availability at SKM Luxury Bridal Studio:\n• Name: ${currentName || "Prospective Bride"}\n• Service: ${currentService || "Bridal Package"}\n• Date: ${currentDate || "To be discussed"}\n• Time: ${currentTime || "Muhurtham / Reception"}\n• Venue: ${currentLocation || "Salem / Outstation"}\nPlease let me know if this slot is available!`
    );
    return `https://wa.me/918608194233?text=${text}`;
  };

  return (
    <>
      {successRef ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-primary/30 p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-2xl"
        >
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <CheckCircle2 size={44} />
          </div>
          <div className="space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-primary">Reservation Request Received</span>
            <h2 className="text-3xl font-heading font-bold text-foreground">
              Thank You for Choosing Maha Shree!
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
              We have received your appointment request. Lead artist Maha Shree will review slot availability and reach out to you within 24 hours.
            </p>
            <div className="mt-4 p-5 rounded-2xl bg-muted/60 border border-border inline-block">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Your Booking Reference Code
              </p>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-primary mt-1">{successRef}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center pt-4">
            <a
              href={`https://wa.me/918608194233?text=${encodeURIComponent(
                `Hi Maha Shree, I just submitted an appointment request on your website with reference ${successRef}. Looking forward to connecting!`
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold py-6 px-6">
                <MessageCircle size={18} /> Connect with Maha Shree on WhatsApp
              </Button>
            </a>
            <a href="tel:+918608194233">
              <Button variant="outline" className="w-full sm:w-auto gap-2 py-6 border-primary/30 text-foreground hover:bg-primary/10">
                <PhoneCall size={16} className="text-primary" /> Call +91 8608194233
              </Button>
            </a>
            <Button
              variant="ghost"
              onClick={() => setSuccessRef(null)}
              className="w-full sm:w-auto gap-2 py-6 text-muted-foreground"
            >
              <RefreshCw size={16} /> Submit Another Booking
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Quick WhatsApp Alternative Banner */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                <PhoneCall size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Need Urgent Date Verification?</h4>
                <p className="text-xs text-muted-foreground">Chat directly with Maha Shree for urgent wedding dates and muhurtham slot checks.</p>
              </div>
            </div>
            <a
              href={generateWhatsAppDirectLink()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider shrink-0 transition-colors shadow-sm"
            >
              <MessageCircle size={15} /> Instant WhatsApp Check
            </a>
          </div>

          <div className="bg-card shadow-xl border border-border p-6 sm:p-10 rounded-3xl">
            {submitError && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3 text-destructive text-sm">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <div>{submitError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Honeypot hidden input */}
              <input type="text" {...register("website_hp")} tabIndex={-1} className="hidden" aria-hidden="true" />

              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  1. Bride / Client Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="customerName" className="text-xs font-semibold">Full Name *</Label>
                    <Input
                      id="customerName"
                      placeholder="e.g. Mahalakshmi S."
                      {...register("customerName")}
                      className="bg-background"
                    />
                    {errors.customerName && (
                      <p className="text-destructive text-xs">{errors.customerName.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold">WhatsApp Mobile Number *</Label>
                    <Input
                      id="phone"
                      placeholder="+91 98765 43210"
                      {...register("phone")}
                      className="bg-background"
                    />
                    {errors.phone && (
                      <p className="text-destructive text-xs">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold">Email Address (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="bride@example.com"
                    {...register("email")}
                    className="bg-background"
                  />
                  {errors.email && (
                    <p className="text-destructive text-xs">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Service Selection */}
              <div className="space-y-4 pt-2 border-t border-border">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  2. Choose Bridal Package or Service
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {serviceOptions.map((opt) => {
                    const isSelected = currentService === opt.name;
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setValue("service", opt.name, { shouldValidate: true })}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-primary/10 border-primary shadow-sm"
                            : "bg-background border-border/80 hover:bg-muted/40"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary inline-block mb-1">
                            {opt.tag}
                          </span>
                          <span className="text-xs font-semibold text-foreground block">{opt.name}</span>
                        </div>
                        <span className="text-xs font-bold font-heading text-primary">{opt.price}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1.5 pt-2">
                  <Label htmlFor="service" className="text-xs font-semibold">Or Custom Service Title *</Label>
                  <Input
                    id="service"
                    placeholder="Selected package or custom requirements"
                    {...register("service")}
                    className="bg-background"
                  />
                  {errors.service && (
                    <p className="text-destructive text-xs">{errors.service.message}</p>
                  )}
                </div>
              </div>

              {/* Date, Timing & Venue */}
              <div className="space-y-4 pt-2 border-t border-border">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  3. Wedding Date & Event Venue
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="preferredDate" className="text-xs font-semibold flex items-center gap-1">
                      <Calendar size={13} /> Event Date *
                    </Label>
                    <Input
                      id="preferredDate"
                      type="date"
                      {...register("preferredDate")}
                      className="bg-background"
                    />
                    {checkingAvailability && (
                      <p className="text-[11px] text-muted-foreground animate-pulse">
                        Verifying Muhurtham date availability...
                      </p>
                    )}
                    {availabilityData && (
                      <div
                        className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border ${
                          availabilityData.availability === "available"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                            : availabilityData.availability === "limited"
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-600"
                        }`}
                      >
                        {availabilityData.message}
                      </div>
                    )}
                    {errors.preferredDate && (
                      <p className="text-destructive text-xs">{errors.preferredDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="preferredTime" className="text-xs font-semibold flex items-center gap-1">
                      <Clock size={13} /> Time Slot *
                    </Label>
                    <Input
                      id="preferredTime"
                      type="time"
                      {...register("preferredTime")}
                      className="bg-background"
                    />
                    {errors.preferredTime && (
                      <p className="text-destructive text-xs">{errors.preferredTime.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="location" className="text-xs font-semibold flex items-center gap-1">
                      <MapPin size={13} /> Venue / City *
                    </Label>
                    <Input
                      id="location"
                      placeholder="e.g. Salem, Mahal Name"
                      {...register("location")}
                      className="bg-background"
                    />
                    {errors.location && (
                      <p className="text-destructive text-xs">{errors.location.message}</p>
                    )}
                  </div>
                </div>

                {/* Quick Time Presets */}
                <div className="space-y-2">
                  <span className="text-[11px] text-muted-foreground font-medium block">
                    Quick Select Typical Muhurtham / Reception Slots:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {TIME_SLOT_PRESETS.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => setValue("preferredTime", slot.time, { shouldValidate: true })}
                        className="text-[11px] px-3 py-1 rounded-full bg-secondary/50 hover:bg-primary/10 hover:text-primary border border-border transition-colors"
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Special Notes */}
              <div className="space-y-2 pt-2 border-t border-border">
                <Label htmlFor="message" className="text-xs font-semibold">Special Notes / Saree Draping / Jewellery Requests</Label>
                <textarea
                  id="message"
                  {...register("message")}
                  rows={3}
                  placeholder="Mention if you require saree box pleating, antique jewellery rental set, family guest makeup count, or studio trial session..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {errors.message && (
                  <p className="text-destructive text-xs">{errors.message.message}</p>
                )}
              </div>

              {/* Visible Muhurtham Cancellation & Reschedule Policy */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 font-heading font-bold text-foreground text-xs uppercase tracking-wider text-primary">
                  <ShieldCheck size={16} /> Muhurtham Slot Lock & Cancellation Terms
                </div>
                <ul className="space-y-1.5 list-disc pl-4 text-[11px] leading-relaxed">
                  <li>
                    <strong className="text-foreground">Exclusive Slot Lock:</strong> An advance booking deposit (₹5,000) reserves your exclusive Muhurtham date and prevents any competing bride bookings for Maha Shree.
                  </li>
                  <li>
                    <strong className="text-foreground">Reschedule Policy:</strong> Free rescheduling is permitted up to 30 days prior to your wedding date, subject to slot availability.
                  </li>
                  <li>
                    <strong className="text-foreground">Cancellation:</strong> Cancellations made within 15 days of the event are non-refundable due to blocked peak muhurtham dates.
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-6 text-sm uppercase tracking-widest shadow-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting Booking..." : "Submit Reservation Request"}
              </Button>

              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={14} className="text-primary" /> No Immediate Payment Required
                </span>
                <span>•</span>
                <span>Direct Verification with Maha Shree</span>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </>
  );
}

export default function BookingPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs uppercase tracking-[0.2em] font-semibold">
            <Sparkles size={14} /> Official Booking Portal
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
            Reserve Your Wedding Date
          </h1>
          <div className="w-16 h-1 bg-primary mx-auto mb-3" />
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Lock your special day with certified MUA <strong className="text-foreground">Maha Shree</strong>.
            Fill out your wedding ceremony details below for instant slot verification.
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Loading booking form...</div>}>
          <BookingFormContent />
        </Suspense>
      </div>
    </div>
  );
}
