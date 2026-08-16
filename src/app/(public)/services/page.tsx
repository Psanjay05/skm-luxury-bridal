"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Scissors, ShoppingBag, Heart } from "lucide-react";

const SERVICES = [
  { category: "Makeup", icon: <Sparkles />, items: ["Bridal Makeup", "Engagement Makeup", "Reception Makeup", "HD Makeup", "Sweat Proof Makeup", "Skin Finish Makeup", "Airbrush Makeup", "Guest Makeup"] },
  { category: "Hair & Draping", icon: <Scissors />, items: ["Bridal Hairstyling", "Reception Hairstyling", "Guest Hairstyling", "Saree Draping", "Saree Pre Pleating", "Saree Box Folding", "Saree Hanger Folding"] },
  { category: "Enhancements", icon: <Heart />, items: ["Jewellery Rental", "Bridal Mehendi", "Customized Mehendi", "Guest Mehendi", "Facial", "Threading"] },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <span className="text-primary font-medium tracking-[0.2em] uppercase text-sm mb-4 block">
            Our Offerings
          </span>
          <h1 className="font-heading text-5xl md:text-6xl mb-6">Signature Services</h1>
          <div className="w-16 h-1 bg-primary mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience the pinnacle of bridal beauty with our comprehensive range of services, designed to ensure perfection in every detail.
          </p>
        </div>

        <div className="space-y-16">
          {SERVICES.map((section, index) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="flex items-center gap-4 mb-8 border-b border-border pb-4">
                <div className="p-3 bg-primary/10 text-primary rounded-full">
                  {section.icon}
                </div>
                <h2 className="font-heading text-3xl">{section.category}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {section.items.map((item, i) => (
                  <div key={i} className="group bg-card border border-border/50 hover:border-primary/50 p-6 rounded-sm shadow-sm transition-all text-center">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{item}</h3>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 text-center bg-primary/5 p-12 border border-primary/10 rounded-sm">
          <h2 className="font-heading text-3xl mb-4">Ready to Secure Your Date?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Contact us today for a consultation or to book our services for your special day.
          </p>
          <Button asChild size="lg" className="rounded-none bg-primary text-primary-foreground tracking-widest uppercase">
            <Link href="/booking">Book Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
