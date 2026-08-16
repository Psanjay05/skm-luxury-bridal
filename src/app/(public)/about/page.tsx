"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Award, CheckCircle2, Heart, Sparkles, Star, MapPin, Calendar, Phone, ArrowRight, ShieldCheck, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs uppercase tracking-[0.2em] font-medium">
            <Sparkles size={14} className="text-primary" /> Founder & Lead Artist
          </div>
          <h1 className="font-heading text-5xl md:text-6xl font-medium tracking-tight">Meet Maha Shree</h1>
          <div className="w-16 h-1 bg-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Celebrated Bridal Makeup Artist & Stylist in Salem, Tamil Nadu. Dedicated to making every bride feel exceptionally radiant, authentic, and breathtaking on her wedding day.
          </p>
        </motion.div>

        {/* Profile Card & Bio Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          
          {/* Artist Portrait */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 relative flex justify-center"
          >
            <div className="relative w-full max-w-md bg-gradient-to-b from-primary/20 via-background to-secondary/30 p-3 rounded-2xl border border-primary/30 shadow-2xl">
              <div className="relative h-[480px] w-full rounded-xl overflow-hidden border border-primary/20 bg-muted">
                <Image
                  src="/images/maha-shree-profile.jpg"
                  alt="Maha Shree - Professional Bridal Makeup Artist"
                  fill
                  className="object-cover object-top"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent z-10" />

                <div className="absolute bottom-4 left-4 right-4 z-20 text-center">
                  <span className="text-xs uppercase tracking-[0.25em] text-primary font-bold block mb-0.5">Lead Artist</span>
                  <h3 className="font-heading text-2xl font-bold text-foreground">Maha Shree</h3>
                  <p className="text-xs text-muted-foreground italic">SKM Luxury Bridal Studio • Salem</p>
                </div>
              </div>

              {/* Floating Experience Badge */}
              <div className="absolute -bottom-5 -right-5 bg-card border border-primary/30 p-3.5 rounded-xl shadow-xl flex items-center gap-3 z-30">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  3+
                </div>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground">Years Experience</h4>
                  <p className="text-[10px] text-muted-foreground">500+ Brides Transformed</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Artist Bio & Story */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-7 space-y-6 text-muted-foreground leading-relaxed"
          >
            <div className="space-y-4">
              <h2 className="font-heading text-3xl md:text-4xl text-foreground font-medium">
                Crafting Timeless Elegance & Personal Style
              </h2>
              <p className="text-base text-muted-foreground">
                Hello! I am <strong className="text-foreground font-semibold">Maha Shree</strong>, founder and principal bridal makeup artist at SKM Luxury Bridal Studio in Salem.
              </p>
              <p className="text-base text-muted-foreground">
                With over <strong className="text-foreground font-semibold">3 years of professional experience</strong> and over 500+ brides transformed across Tamil Nadu, my mission is to deliver flawless, sweat-proof, high-definition makeup that looks as natural in person as it does in high-res photography.
              </p>
              <p className="text-base text-muted-foreground">
                Every look is custom-designed after considering your skin tone, face shape, outfit textures, antique jewellery sets, and ceremony lighting. From traditional South Indian temple bridal looks to modern reception glam, we handle makeup, hair artistry, box pleating, and draping with meticulous detail.
              </p>
            </div>

            {/* Quote Box */}
            <div className="bg-primary/5 p-6 rounded-xl border-l-4 border-primary mt-6">
              <h3 className="flex items-center gap-2 font-heading text-xl text-foreground mb-2">
                <Heart className="text-primary" size={20} /> My Artistic Philosophy
              </h3>
              <p className="text-sm italic text-foreground/90">
                "Bridal makeup isn't about altering how you look; it's about amplifying your authentic beauty so you radiate poise and confidence on your special day."
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild size="lg" className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-widest px-8 py-6 font-semibold shadow-md">
                <Link href="/booking">Book Consultation with Maha Shree</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-none border-primary/30 text-foreground hover:bg-primary/10 text-xs uppercase tracking-widest px-8 py-6 font-semibold">
                <Link href="/gallery">View Real Portfolio</Link>
              </Button>
            </div>
          </motion.div>

        </div>

        {/* Real Work Highlights Carousel Grid */}
        <div className="mb-24 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-primary font-medium tracking-[0.2em] uppercase text-xs block">Real Clients</span>
            <h2 className="font-heading text-3xl md:text-4xl font-medium">Recent Work by Maha Shree</h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              A sample of brides styled by Maha Shree with HD makeup, box saree pleating, and temple jewellery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { title: "HD Bridal Transformation", img: "/images/portfolio/before-after-hd-makeover.jpg", cat: "Before & After" },
              { title: "Traditional South Indian Bride", img: "/images/portfolio/traditional-south-indian-bride.jpg", cat: "Bridal HD" },
              { title: "Royal Pink Silk Saree Look", img: "/images/portfolio/bridal-pink-saree-gold-jewellery.jpg", cat: "Temple Gold" },
              { title: "HD Bridal Close-Up Portrait", img: "/images/portfolio/bridal-close-up-portrait.jpg", cat: "Glowing Finish" },
            ].map((work, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="group relative h-72 rounded-xl overflow-hidden border border-border/80 shadow-md bg-card"
              >
                <Image
                  src={work.img}
                  alt={work.title}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity flex flex-col justify-end p-4">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-primary">{work.cat}</span>
                  <h4 className="font-heading text-sm font-semibold text-foreground">{work.title}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Certifications & Expertise Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-card shadow-sm border border-primary/20 p-8 md:p-12 rounded-2xl"
        >
          <div className="text-center mb-12 space-y-2">
            <Award className="w-12 h-12 text-primary mx-auto mb-2" />
            <h2 className="font-heading text-4xl">Certifications & Specialized Expertise</h2>
            <p className="text-muted-foreground text-sm">Professional credentials held by Maha Shree</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Certified Professional Bridal Makeup Artist",
              "HD & Airbrush Makeup Masterclass",
              "Saree Box Pleating & Draping Specialist",
              "Antique Temple Jewellery Rental Curator",
              "Advanced Hair Styling & Extension Artistry",
              "Strict Hygiene & Product Safety Standards",
            ].map((cert, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-background border border-border/70 rounded-xl hover:border-primary/50 transition-colors">
                <CheckCircle2 className="text-primary shrink-0" size={20} />
                <span className="text-sm font-medium text-foreground">{cert}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
