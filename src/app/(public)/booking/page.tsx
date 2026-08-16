"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingSchema, BookingInput } from "@/lib/validations/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, MessageCircle, AlertCircle, RefreshCw } from "lucide-react";

export default function BookingPage() {
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: "",
      phone: "",
      service: "",
      preferredDate: "",
      preferredTime: "",
      location: "",
      message: "",
      email: "",
      website_hp: "",
    },
  });

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
        reset();
      } else {
        setSubmitError(
          json.error || "Failed to submit booking request. Please try again or call us."
        );
      }
    } catch (err) {
      console.error("[BOOKING_SUBMIT_ERROR]", err);
      setSubmitError("Network connection error. Please check your internet connection and try again.");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <span className="text-primary font-medium tracking-[0.2em] uppercase text-sm mb-4 block">
            Reserve Your Special Day
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl mb-4 font-bold text-foreground">
            Book Your Consultation
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Let us craft your exquisite bridal look. Fill out the details below to check date availability and receive a custom package quote.
          </p>
        </div>

        {successRef ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-primary/30 p-8 rounded-lg text-center space-y-6 shadow-xl"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <CheckCircle2 size={36} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-bold text-foreground">
                Booking Request Received!
              </h2>
              <p className="text-muted-foreground text-sm">
                Thank you for choosing SKM Luxury Bridal Studio. Our team will verify date availability and contact you within 24 hours.
              </p>
              <div className="mt-4 p-4 rounded-md bg-muted/50 border border-border inline-block">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Booking Reference Number
                </p>
                <p className="text-2xl font-bold font-mono text-primary mt-1">{successRef}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <a
                href={`https://wa.me/918608194233?text=Hi%20SKM%20Bridal%20Studio,%20I%20just%20submitted%20a%20booking%20request%20with%20reference%20${successRef}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                  <MessageCircle size={18} /> Connect on WhatsApp
                </Button>
              </a>
              <Button
                variant="outline"
                onClick={() => setSuccessRef(null)}
                className="w-full sm:w-auto gap-2"
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
            className="bg-card shadow-lg border border-border p-6 sm:p-10 rounded-lg"
          >
            {submitError && (
              <div className="mb-6 p-4 rounded-md bg-destructive/10 border border-destructive/20 flex items-start gap-3 text-destructive text-sm">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <div>{submitError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Honeypot hidden input */}
              <input type="text" {...register("website_hp")} tabIndex={-1} className="hidden" aria-hidden="true" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    placeholder="Enter your full name"
                    {...register("customerName")}
                    className="bg-background"
                  />
                  {errors.customerName && (
                    <p className="text-destructive text-xs">{errors.customerName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (WhatsApp) *</Label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address (Optional)</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="service">Desired Service Package *</Label>
                  <select
                    id="service"
                    {...register("service")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select a bridal package</option>
                    <option value="Royal Bridal Package">Royal Bridal Package</option>
                    <option value="Luxury HD Bridal Makeup">Luxury HD Bridal Makeup</option>
                    <option value="Airbrush Bridal Makeup">Airbrush Bridal Makeup</option>
                    <option value="Reception / Engagement Makeup">Reception / Engagement Makeup</option>
                    <option value="Saree Draping & Hair Styling">Saree Draping & Hair Styling</option>
                    <option value="Jewellery Rental Service">Jewellery Rental Service</option>
                    <option value="Custom Combo Package">Custom Combo Package</option>
                  </select>
                  {errors.service && (
                    <p className="text-destructive text-xs">{errors.service.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="preferredDate">Event Date *</Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    {...register("preferredDate")}
                    className="bg-background"
                  />
                  {errors.preferredDate && (
                    <p className="text-destructive text-xs">{errors.preferredDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredTime">Time Slot *</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="location">Event Location / Venue *</Label>
                  <Input
                    id="location"
                    placeholder="City / Hall Name"
                    {...register("location")}
                    className="bg-background"
                  />
                  {errors.location && (
                    <p className="text-destructive text-xs">{errors.location.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Special Notes / Preferences</Label>
                <textarea
                  id="message"
                  {...register("message")}
                  rows={3}
                  placeholder="Share details about your wedding theme, function timings, or specific preferences..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {errors.message && (
                  <p className="text-destructive text-xs">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-6 text-base tracking-wide"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting Booking Request..." : "Submit Booking Request"}
              </Button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
