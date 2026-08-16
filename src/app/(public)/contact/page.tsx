"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, ContactInput } from "@/lib/validations/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  Car,
  ExternalLink,
  PhoneCall,
  Sparkles,
} from "lucide-react";

export default function ContactPage() {
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      message: "",
      website_hp: "",
    },
  });

  const onSubmit = async (data: ContactInput) => {
    setSubmitError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setSuccess(true);
        reset();
      } else {
        setSubmitError(json.error || "Something went wrong. Please WhatsApp us at +91 8608194233.");
      }
    } catch (err) {
      console.error("[CONTACT_SUBMIT_ERROR]", err);
      setSubmitError("Network connection error. Please try again.");
    }
  };

  const googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=Steel+Plant+Road+Salem+Tamil+Nadu+India";

  return (
    <div className="min-h-screen pt-28 pb-20 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs uppercase tracking-[0.2em] font-semibold">
            <Sparkles size={14} /> Direct Studio Connection
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-foreground">
            Contact SKM Luxury Bridal Studio
          </h1>
          <div className="w-16 h-1 bg-primary mx-auto mb-4" />
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Have questions about bridal makeover packages, jewellery rental sets, or trial sessions?
            Reach out to lead makeup artist <strong className="text-foreground">Maha Shree</strong> directly.
          </p>
        </div>

        {/* Quick Contact Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <a
            href="https://wa.me/918608194233"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-4 rounded-xl bg-card border border-emerald-500/30 hover:border-emerald-500 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <PhoneCall size={20} />
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-emerald-600 tracking-wider block">WhatsApp Direct</span>
                <span className="text-sm font-semibold text-foreground">+91 86081 94233</span>
              </div>
            </div>
            <ExternalLink size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
          </a>

          <a
            href="tel:+918973587806"
            className="flex items-center justify-between p-4 rounded-xl bg-card border border-primary/30 hover:border-primary hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Phone size={20} />
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-primary tracking-wider block">Studio Hotline</span>
                <span className="text-sm font-semibold text-foreground">+91 89735 87806</span>
              </div>
            </div>
            <ExternalLink size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
          </a>

          <a
            href="https://www.instagram.com/maha_unique_brides_23"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-4 rounded-xl bg-card border border-pink-500/30 hover:border-pink-500 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-500/10 text-pink-600 flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-pink-600 tracking-wider block">Official Instagram</span>
                <span className="text-sm font-semibold text-foreground">@maha_unique_brides_23</span>
              </div>
            </div>
            <ExternalLink size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
          </a>
        </div>

        {/* Main Grid: Details + Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* Left Column: Studio Details & Timing */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="bg-card shadow-md border border-border p-6 sm:p-8 rounded-2xl space-y-6">
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Studio Address & Info
              </h2>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm mb-1">Studio Address</h4>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    4/39 Alagusamuthiram<br />
                    Near Steel Plant, Salem<br />
                    Tamil Nadu, PIN 636013
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                  <Clock size={22} />
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm mb-1">Studio & Consultation Hours</h4>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    Monday – Sunday: 9:00 AM – 8:00 PM<br />
                    <span className="text-primary text-xs font-semibold">
                      * Wedding Day On-Location Services Available 24/7 (Early Morning Muhurtham)
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                  <Mail size={22} />
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm mb-1">Direct Email</h4>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Mahashreesanjeevi48@gmail.com
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button asChild className="w-full bg-primary text-primary-foreground font-semibold text-xs uppercase tracking-wider py-5 gap-2">
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                    <MapPin size={16} /> Open in Google Maps
                  </a>
                </Button>
              </div>
            </div>

            {/* Travel Radius Card */}
            <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <Car size={16} /> Outstation Travel Service
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground">
                We Travel to Your Wedding Venue
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Maha Shree and our bridal styling team travel across Salem, Erode, Coimbatore, Namakkal, Dharmapuri, Trichy, Chennai, and anywhere in South India.
              </p>
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-7 bg-card shadow-md border border-border p-6 sm:p-8 rounded-2xl"
          >
            <div className="mb-6 space-y-1">
              <span className="text-xs uppercase font-bold tracking-widest text-primary">Inquiry Form</span>
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Send Us a Direct Message
              </h2>
              <p className="text-xs text-muted-foreground">
                Fill out the details below, and Maha Shree will contact you promptly.
              </p>
            </div>

            {success ? (
              <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
                <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="font-heading text-2xl font-bold text-foreground">Message Sent Successfully!</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Thank you for writing to SKM Luxury Bridal Studio. Maha Shree will reach out via WhatsApp or phone shortly.
                </p>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setSuccess(false)}
                    className="text-xs font-semibold"
                  >
                    Send Another Message
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Honeypot hidden input */}
                <input type="text" {...register("website_hp")} tabIndex={-1} className="hidden" aria-hidden="true" />

                {submitError && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-semibold">Full Name *</Label>
                  <Input id="name" placeholder="e.g. Priyadharshini" {...register("name")} className="bg-background" />
                  {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-semibold">Phone / WhatsApp *</Label>
                    <Input id="phone" placeholder="+91 98765 43210" {...register("phone")} className="bg-background" />
                    {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold">Email Address (Optional)</Label>
                    <Input id="email" type="email" placeholder="bride@example.com" {...register("email")} className="bg-background" />
                    {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-xs font-semibold">Your Message or Event Details *</Label>
                  <textarea
                    id="message"
                    {...register("message")}
                    rows={4}
                    placeholder="Tell us about your wedding date, required services (HD makeup, hair styling, jewellery rental), or consultation questions..."
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  {errors.message && <p className="text-destructive text-xs">{errors.message.message}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-6 text-xs uppercase tracking-widest shadow-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending Inquiry..." : "Send Message to Maha Shree"}
                </Button>
              </form>
            )}
          </motion.div>
        </div>

        {/* Embedded Interactive Map Card */}
        <div className="bg-card border border-primary/20 rounded-3xl overflow-hidden shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-primary block mb-1">Interactive Studio Map</span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                Visit SKM Luxury Bridal Studio in Salem
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Located near Steel Plant, Alagusamuthiram, Salem. Easy access from Salem Main Junction & Bypass.
              </p>
            </div>
            <Button asChild variant="outline" className="border-primary/30 text-xs font-semibold gap-2 shrink-0">
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} /> Get Driving Directions
              </a>
            </Button>
          </div>

          <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-border/80 bg-muted">
            <iframe
              title="SKM Luxury Bridal Studio Salem Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62493.58572186711!2d78.06456073125001!3d11.775833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3babedfa20400001%3A0x6335fa79d031bf94!2sSalem%20Steel%20Plant%2C%20Salem%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale contrast-125 opacity-90 hover:grayscale-0 transition-all duration-500"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
