"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { testimonialSchema, TestimonialInput } from "@/lib/validations/testimonial";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote, Plus, CheckCircle2, AlertCircle } from "lucide-react";

interface TestimonialItem {
  _id?: string;
  customerName: string;
  review: string;
  rating: number;
  isFeatured?: boolean;
}

const FALLBACK_TESTIMONIALS: TestimonialItem[] = [
  {
    customerName: "Priya & Karthik",
    review: "Maha Shree ma'am created the absolute bridal look of my dreams! The HD makeup lasted all day through heat and tears without cracking or getting shiny.",
    rating: 5,
  },
  {
    customerName: "Ananya R.",
    review: "The saree draping precision and hair styling for my Muhurtham were flawless. Every relative complimented my look. SKM is the best in Salem!",
    rating: 5,
  },
  {
    customerName: "Kavya & Sundar",
    review: "Renting jewellery from SKM Bridal was seamless and elegant. Premium temple jewellery sets in pristine condition at fair prices.",
    rating: 5,
  },
  {
    customerName: "Deepika S.",
    review: "I took the Royal Airbrush Bridal Package. Truly felt like royalty on my reception night! Highly recommend Maha Shree for all brides.",
    rating: 5,
  },
];

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(FALLBACK_TESTIMONIALS);
  const [_loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TestimonialInput>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      customerName: "",
      review: "",
      rating: 5,
      isFeatured: false,
    },
  });

  const currentRating = watch("rating") || 5;

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const res = await fetch("/api/testimonials");
        const json = await res.json();
        if (res.ok && json.success && json.data && json.data.length > 0) {
          setTestimonials(json.data);
        }
      } catch (err) {
        console.error("[FETCH_TESTIMONIALS_ERROR]", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTestimonials();
  }, []);

  const onSubmit = async (data: TestimonialInput) => {
    setSubmitError(null);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setSubmitted(true);
        reset();
      } else {
        setSubmitError(json.error || "Failed to submit review. Please try again.");
      }
    } catch (err) {
      console.error("[SUBMIT_TESTIMONIAL_ERROR]", err);
      setSubmitError("Network connection error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <span className="text-primary font-medium tracking-[0.2em] uppercase text-sm mb-4 block">
            Client Stories & Feedback
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4 text-foreground">
            Words of Happiness from Our Brides
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-base">
            Read authentic reviews and experiences shared by brides who chose SKM Luxury Bridal Studio for their wedding makeover.
          </p>

          <div className="mt-8 flex justify-center">
            <Button
              onClick={() => {
                setShowModal(true);
                setSubmitted(false);
                setSubmitError(null);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2 py-5 px-6"
            >
              <Plus size={18} /> Share Your Experience
            </Button>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((item, idx) => (
            <motion.div
              key={item._id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <Card className="h-full border-border/80 shadow-md hover:shadow-lg transition-all bg-card flex flex-col justify-between p-6">
                <CardContent className="p-0 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex text-amber-500 gap-1">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} size={18} fill="currentColor" />
                      ))}
                    </div>
                    <Quote className="text-primary/20" size={32} />
                  </div>

                  <p className="text-foreground/90 italic text-sm sm:text-base leading-relaxed">
                    &ldquo;{item.review}&rdquo;
                  </p>
                </CardContent>

                <div className="border-t border-border/60 pt-4 mt-6 flex items-center justify-between">
                  <div>
                    <h4 className="font-heading font-semibold text-foreground">{item.customerName}</h4>
                    <p className="text-xs text-muted-foreground">Happy Bride</p>
                  </div>
                  <span className="text-xs font-semibold text-primary px-2.5 py-1 rounded-full bg-primary/10">
                    Verified Bride
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Modal for Submitting a Review */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border w-full max-w-lg rounded-lg shadow-2xl p-6 sm:p-8 relative"
            >
              <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
                Write a Bride Review
              </h2>

              {submitted ? (
                <div className="py-8 text-center space-y-4">
                  <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="font-heading text-xl font-bold">Thank You!</h3>
                  <p className="text-muted-foreground text-sm">
                    Your feedback has been submitted. It will be displayed after admin review.
                  </p>
                  <Button
                    onClick={() => setShowModal(false)}
                    className="mt-4 bg-primary text-primary-foreground"
                  >
                    Close Window
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {submitError && (
                    <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                      <AlertCircle size={16} />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="customerName">Your Name *</Label>
                    <Input
                      id="customerName"
                      placeholder="e.g. Priya & Karthik"
                      {...register("customerName")}
                      className="bg-background"
                    />
                    {errors.customerName && (
                      <p className="text-destructive text-xs">{errors.customerName.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Rating (1 to 5 Stars) *</Label>
                    <div className="flex gap-2 items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setValue("rating", star)}
                          className="p-1 text-amber-500 focus:outline-none hover:scale-110 transition-transform"
                        >
                          <Star
                            size={24}
                            fill={star <= currentRating ? "currentColor" : "none"}
                            className={star <= currentRating ? "text-amber-500" : "text-muted-foreground"}
                          />
                        </button>
                      ))}
                      <span className="text-sm font-semibold text-muted-foreground ml-2">
                        {currentRating} / 5 Stars
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="review">Your Review / Experience *</Label>
                    <textarea
                      id="review"
                      {...register("review")}
                      rows={4}
                      placeholder="Share your experience with SKM Luxury Bridal Studio..."
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    {errors.review && (
                      <p className="text-destructive text-xs">{errors.review.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
