"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, ContactInput } from "@/lib/validations/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, CheckCircle2, AlertCircle } from "lucide-react";

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

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <span className="text-primary font-medium tracking-[0.2em] uppercase text-sm mb-4 block">
            Get In Touch
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4 text-foreground">
            Contact SKM Luxury Bridal Studio
          </h1>
          <div className="w-16 h-1 bg-primary mx-auto mb-6" />
          <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
            Have questions about bridal makeup, hair styling, or jewellery rental? Reach out to lead makeup artist Maha Shree directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Details */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="bg-card shadow-md border border-border p-8 rounded-lg space-y-6">
              <h2 className="font-heading text-2xl font-bold mb-6 text-foreground">
                Studio Address & Info
              </h2>
              
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-full bg-primary/10 text-primary mt-1">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Studio Address</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    4/39 Alagusamuthiram<br />
                    Near Steel Plant, Salem<br />
                    Tamil Nadu, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-full bg-primary/10 text-primary mt-1">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Phone & WhatsApp</h4>
                  <p className="text-muted-foreground text-sm">
                    +91 8608194233<br />
                    +91 8973587806
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-full bg-primary/10 text-primary mt-1">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Direct Email</h4>
                  <p className="text-muted-foreground text-sm">
                    Mahashreesanjeevi48@gmail.com
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card shadow-md border border-border p-8 rounded-lg"
          >
            <h2 className="font-heading text-2xl font-bold mb-6 text-foreground">
              Send Us a Message
            </h2>

            {success ? (
              <div className="p-6 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground">Message Sent Successfully!</h3>
                <p className="text-muted-foreground text-sm">
                  Thank you for writing to us. Lead artist Maha Shree will respond to your message shortly.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSuccess(false)}
                  className="mt-2 text-xs"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Honeypot hidden input */}
                <input type="text" {...register("website_hp")} tabIndex={-1} className="hidden" aria-hidden="true" />

                {submitError && (
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" placeholder="Your name" {...register("name")} className="bg-background" />
                  {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone / WhatsApp *</Label>
                    <Input id="phone" placeholder="+91 98765 43210" {...register("phone")} className="bg-background" />
                    {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address (Optional)</Label>
                    <Input id="email" type="email" placeholder="bride@example.com" {...register("email")} className="bg-background" />
                    {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Your Message *</Label>
                  <textarea
                    id="message"
                    {...register("message")}
                    rows={4}
                    placeholder="Tell us about your event date, required services, or inquiries..."
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  {errors.message && <p className="text-destructive text-xs">{errors.message.message}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-6 text-sm uppercase tracking-wider"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending Inquiry..." : "Send Message"}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
