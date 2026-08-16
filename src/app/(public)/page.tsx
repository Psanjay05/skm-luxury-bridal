"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Sparkles, Gem, ShieldCheck, HeartHandshake, PhoneCall, Award, ExternalLink, SlidersHorizontal } from "lucide-react";
import { BeforeAfterSlider } from "@/components/ui/before-after-slider";

// Inline Instagram Icon
function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

import { useLanguage } from "@/context/LanguageContext";
import { trackEvent } from "@/lib/gtag";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center pt-24 pb-16 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        {/* Decorative Grid & Glow Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />
        <div className="absolute -top-24 right-10 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <motion.div 
              className="lg:col-span-7 space-y-6 text-left"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs uppercase tracking-[0.2em] font-medium">
                <Sparkles size={14} className="animate-pulse text-primary" /> {t.hero.badge}
              </div>

              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.1]">
                {t.hero.title1} <br />
                <span className="italic font-normal text-primary">{t.hero.titleAccent}</span> <br />
                {t.hero.title2}
              </h1>

              <p className="text-muted-foreground text-lg md:text-xl max-w-xl leading-relaxed">
                {t.hero.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Button
                  asChild
                  size="lg"
                  className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-xs tracking-widest uppercase font-semibold shadow-md hover:shadow-lg transition-all"
                  onClick={() => trackEvent("booking_submit", { source: "hero_cta" })}
                >
                  <Link href="/booking">{t.hero.bookCta}</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-none border-primary/30 text-foreground hover:bg-primary/10 px-8 py-6 text-xs tracking-widest uppercase font-semibold"
                  onClick={() => trackEvent("gallery_view_item", { source: "hero_portfolio" })}
                >
                  <Link href="/gallery">{t.hero.portfolioCta}</Link>
                </Button>
              </div>

              {/* Quick Trust Badges */}
              <div className="pt-6 border-t border-border/60 flex flex-wrap gap-6 text-xs text-muted-foreground font-medium">
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-primary" /> {t.hero.certifiedBadge}
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" /> {t.hero.sweatProofBadge}
                </div>
                <div className="flex items-center gap-2">
                  <Gem size={16} className="text-primary" /> {t.hero.jewelleryBadge}
                </div>
              </div>
            </motion.div>

            {/* Right Visual Showcase Card Column */}
            <motion.div 
              className="lg:col-span-5 relative flex justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Hero Main Feature Card */}
              <div className="relative w-full max-w-md bg-gradient-to-br from-card via-background to-secondary/20 p-6 rounded-2xl border border-primary/20 shadow-2xl backdrop-blur-sm">
                
                {/* Visual Header Image Container */}
                <div className="relative h-80 w-full rounded-xl overflow-hidden bg-primary/10 border border-primary/10">
                  <Image
                    src="/images/portfolio/bridal-close-up-portrait.jpg"
                    alt="Bridal HD Makeover by Maha Shree"
                    fill
                    className="object-cover object-top"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent z-10" />
                  
                  {/* Top Floating Badge */}
                  <div className="absolute top-4 left-4 z-20 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-primary/20 shadow-sm flex items-center gap-1.5 text-xs font-semibold">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    <span>4.9 / 5.0 Rating</span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 z-20">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold block">Certified MUA Work</span>
                    <span className="text-sm font-heading font-medium text-foreground">HD Bridal Makeover by Maha Shree</span>
                  </div>
                </div>

                {/* Bottom Floating Badge */}
                <motion.div 
                  className="absolute -bottom-6 -left-6 bg-card border border-primary/30 p-4 rounded-xl shadow-lg flex items-center gap-4 z-30"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold">
                    3+
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Years Experience</h4>
                    <p className="text-xs text-muted-foreground">500+ Brides Transformed</p>
                  </div>
                </motion.div>

                {/* Floating WhatsApp Action Pill */}
                <a 
                  href="https://wa.me/918608194233" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute -top-4 -right-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-md flex items-center gap-2 transition-transform hover:scale-105 z-30"
                >
                  <PhoneCall size={14} /> Quick WhatsApp
                </a>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* STATS BANNERS */}
      <section className="py-12 bg-primary/10 border-y border-primary/15">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { count: "500+", label: "Happy Brides" },
              { count: "3+ Years", label: "Certified Professional MUA" },
              { count: "Starts ₹999", label: "Affordable Makeover Packages" },
              { count: "Salem & Travel", label: "Available Across South India" },
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="font-heading text-3xl md:text-4xl text-primary font-bold mb-1">{stat.count}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* OFFICIAL INSTAGRAM SECTION (@maha_unique_brides_23) */}
      <section className="py-20 bg-background border-t border-border/40">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-card border border-primary/20 rounded-2xl p-8 sm:p-12 shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white text-xs font-bold uppercase tracking-wider">
                <InstagramIcon size={14} /> Official Instagram Page
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
                Follow @maha_unique_brides_23
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Watch live makeover transformation reels, customer video testimonials, saree box pleating tutorials, and daily bridal updates directly on Instagram.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-foreground pt-2">
                <span className="px-3 py-1.5 rounded-md bg-secondary/50 border border-border">👸 Real Bride Looks</span>
                <span className="px-3 py-1.5 rounded-md bg-secondary/50 border border-border">🏆 Certified MUA Highlights</span>
                <span className="px-3 py-1.5 rounded-md bg-secondary/50 border border-border">❤️ Mehendi & Pleating</span>
              </div>
            </div>

            <div className="shrink-0 text-center lg:text-right space-y-4">
              <a
                href="https://www.instagram.com/maha_unique_brides_23"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-heading font-bold text-sm tracking-wider uppercase shadow-lg hover:shadow-2xl transition-all hover:scale-105"
              >
                <InstagramIcon size={20} /> Visit Instagram Profile <ExternalLink size={16} />
              </a>
              <p className="text-xs text-muted-foreground">Founder & MUA: <strong className="text-foreground">@mahsri_sanjeev_23</strong></p>
            </div>
          </div>
        </div>
      </section>

      {/* INTRODUCTION SECTION */}
      <section className="py-24 bg-background border-t border-border/40">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Artist Headshot Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 relative flex justify-center"
            >
              <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-primary/30 p-2 bg-gradient-to-b from-primary/10 via-background to-secondary/30 shadow-2xl">
                <div className="relative h-[420px] w-full rounded-xl overflow-hidden border border-primary/20 bg-muted">
                  <Image
                    src="/images/maha-shree-profile.jpg"
                    alt="Maha Shree - Lead Bridal Makeup Artist"
                    fill
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent z-10" />
                  <div className="absolute bottom-4 left-4 right-4 z-20 text-center">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-primary font-bold block">Lead Certified MUA & Founder</span>
                    <h3 className="font-heading text-xl font-bold text-foreground">Maha Shree</h3>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Artist Intro Text */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              <span className="text-primary font-medium tracking-[0.2em] uppercase text-xs block">About The Artist</span>
              <h2 className="font-heading text-4xl md:text-5xl font-medium tracking-tight">
                A Touch of Pure Luxury by Maha Shree
              </h2>
              <div className="w-16 h-1 bg-primary" />
              <p className="text-lg text-muted-foreground leading-relaxed">
                Hi, I'm <strong className="text-foreground">Maha Shree</strong>, certified professional MUA and founder of SKM Luxury Bridal Studio in Salem. I specialize in crafting bespoke bridal makeovers that highlight your natural beauty, outfit textures, and personal wedding aesthetic.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                From long-lasting HD & Airbrush makeup to intricate hair styling, antique temple jewellery rental, Mehendi artistry, and Saree box pleating, we handle every detail so you shine with absolute elegance and confidence.
              </p>

              <div className="pt-2">
                <Link href="/about" className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors uppercase tracking-widest text-xs border-b border-primary/40 pb-1">
                  Read Maha Shree's Full Story & Certifications <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* INTERACTIVE MAKEOVER SPOTLIGHT (BEFORE & AFTER) */}
      <section className="py-24 bg-card/60 border-t border-border/40 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs uppercase tracking-[0.2em] font-semibold">
              <SlidersHorizontal size={14} /> Real Transformation
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground">
              HD Makeover Artistry in Motion
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto" />
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Drag the interactive slider below to see how Maha Shree enhances real skin with waterproof, sweat-resistant bridal pigments.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-md">
                <BeforeAfterSlider
                  beforeImage="/images/portfolio/before-after-hd-makeover.jpg"
                  afterImage="/images/portfolio/bridal-close-up-portrait.jpg"
                  beforeLabel="Natural Skin"
                  afterLabel="HD Bridal Glam"
                  aspectRatio="4/5"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="text-xs uppercase font-bold tracking-widest text-primary px-3 py-1 rounded-full bg-primary/10 inline-block">
                Maha Shree's Signature Method
              </span>
              <h3 className="font-heading text-3xl font-bold text-foreground leading-tight">
                No Patchiness. No Flashback. Pure Natural Radiance.
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Using micro-pigment color correction and premium bridal setting formulas, our HD makeup holds flawlessly under tropical wedding mandap heat, humid hall lighting, and high-resolution 4K photography.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-background/80 border border-border space-y-1">
                  <span className="text-sm font-bold text-foreground">Sweat-Proof 18h</span>
                  <p className="text-xs text-muted-foreground">Formulated for South Indian Muhurtham heat</p>
                </div>
                <div className="p-4 rounded-xl bg-background/80 border border-border space-y-1">
                  <span className="text-sm font-bold text-foreground">Saree Draping</span>
                  <p className="text-xs text-muted-foreground">Sharp box pleating & pre-ironed folds</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button asChild className="bg-primary text-primary-foreground text-xs uppercase tracking-widest font-semibold px-6 py-5">
                  <Link href="/bridal-packages">Explore Packages & Pricing</Link>
                </Button>
                <Button asChild variant="outline" className="border-primary/30 text-xs uppercase tracking-widest font-semibold px-6 py-5">
                  <Link href="/gallery">View Full Transformations</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="py-24 bg-secondary/10 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-3">
            <span className="text-primary font-medium tracking-[0.2em] uppercase text-xs block">Our Expertise</span>
            <h2 className="font-heading text-4xl md:text-5xl">Bespoke Bridal Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
              End-to-end beauty and styling packages tailored to your traditions and venue.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { title: "Bridal & Guest Makeup", desc: "Sweat-proof, long-lasting HD & Airbrush techniques starting from ₹999 for guest glam.", icon: Sparkles },
              { title: "Saree Draping & Box Pleating", desc: "Expert box folding and pre-pleating to ensure seamless drape stability throughout the event.", icon: HeartHandshake },
              { title: "Jewellery Rental", desc: "Exquisite temple, matte gold, and antique bridal sets available for rental.", icon: Gem },
            ].map((service, i) => {
              const IconComp = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-card p-8 rounded-xl border border-border/80 text-center hover:border-primary/50 hover:shadow-lg transition-all group"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <IconComp className="text-primary" size={28} />
                  </div>
                  <h3 className="font-heading text-2xl mb-4">{service.title}</h3>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{service.desc}</p>
                  <Link href="/services" className="text-primary text-xs tracking-wider uppercase font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
                    Discover Details <ArrowRight size={14} />
                  </Link>
                </motion.div>
              );
            })}
          </div>
          
          <div className="text-center mt-14">
            <Button asChild variant="outline" className="rounded-none border-primary/30 text-foreground hover:bg-primary/10 px-8 py-6 text-xs tracking-widest uppercase">
              <Link href="/services">View All Packages & Services</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
