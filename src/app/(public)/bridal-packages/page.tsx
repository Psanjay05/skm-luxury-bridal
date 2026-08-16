"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BridalPackagesPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
          <span className="text-primary font-medium tracking-[0.2em] uppercase text-sm mb-4 block">
            Exclusive Offerings
          </span>
          <h1 className="font-heading text-5xl md:text-6xl mb-6">Bridal Packages</h1>
          <div className="w-16 h-1 bg-primary mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Curated luxury experiences combining makeup, styling, and enhancements for your perfect wedding look.
          </p>
        </div>

        {/* Placeholder for dynamic DB content in future milestones */}
        <div className="text-center py-24 bg-card border border-border/50 rounded-sm">
          <p className="text-muted-foreground text-lg italic mb-6">
            Detailed bridal packages are being updated. Please contact us directly for our custom package brochure.
          </p>
          <Button asChild variant="outline" className="rounded-none border-primary/20 text-foreground hover:bg-primary/5 tracking-widest uppercase">
            <Link href="/contact">Inquire Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
