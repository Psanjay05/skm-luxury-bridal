"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const bookingSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  service: z.string().min(1, "Please select a service"),
  preferredDate: z.string().min(1, "Date is required"),
  preferredTime: z.string().min(1, "Time is required"),
  location: z.string().min(1, "Location is required"),
  message: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function BookingPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
  });

  const onSubmit = async (data: BookingFormValues) => {
    const res = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      alert("Booking request submitted! We will contact you within 24 hours.");
    } else {
      alert("Something went wrong. Please call us directly at +91 8608194233.");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <span className="text-primary font-medium tracking-[0.2em] uppercase text-sm mb-4 block">
            Reserve Your Date
          </span>
          <h1 className="font-heading text-5xl mb-4">Book a Consultation</h1>
          <p className="text-muted-foreground">
            Let us make your dream look a reality. Fill out the form below to secure our services for your special day.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card shadow-sm border border-border p-8 rounded-sm"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="customerName">Full Name</Label>
                <Input id="customerName" {...register("customerName")} className="bg-background" />
                {errors.customerName && <p className="text-destructive text-sm">{errors.customerName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (WhatsApp)</Label>
                <Input id="phone" {...register("phone")} className="bg-background" />
                {errors.phone && <p className="text-destructive text-sm">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="service">Desired Service</Label>
                <select 
                  id="service" 
                  {...register("service")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select a service</option>
                  <option value="Bridal Makeup">Bridal Makeup</option>
                  <option value="Reception Makeup">Reception Makeup</option>
                  <option value="Engagement Makeup">Engagement Makeup</option>
                  <option value="Jewellery Rental">Jewellery Rental</option>
                </select>
                {errors.service && <p className="text-destructive text-sm">{errors.service.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Venue / Location</Label>
                <Input id="location" {...register("location")} className="bg-background" />
                {errors.location && <p className="text-destructive text-sm">{errors.location.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="preferredDate">Preferred Date</Label>
                <Input id="preferredDate" type="date" {...register("preferredDate")} className="bg-background" />
                {errors.preferredDate && <p className="text-destructive text-sm">{errors.preferredDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredTime">Preferred Time</Label>
                <Input id="preferredTime" type="time" {...register("preferredTime")} className="bg-background" />
                {errors.preferredTime && <p className="text-destructive text-sm">{errors.preferredTime.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Additional Message or Requirements</Label>
              <textarea 
                id="message" 
                {...register("message")}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none uppercase tracking-widest text-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting Request..." : "Submit Booking Request"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
