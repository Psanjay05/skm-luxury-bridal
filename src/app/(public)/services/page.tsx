"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Scissors, Heart, ArrowRight, PhoneCall } from "lucide-react";


const DEFAULT_SERVICES = [
  {
    category: "Bridal Makeup & Skin Finish",
    icon: Sparkles,
    image: "/images/portfolio/bridal-close-up-portrait.jpg",
    imageAlt: "HD Bridal Makeover by Maha Shree",
    items: [
      { title: "HD Sweat-Proof Bridal Makeup", desc: "Long-lasting high-definition pigments for camera clarity.", price: "From ₹9,999" },
      { title: "Airbrush Waterproof Makeover", desc: "18+ hour stage-ready airbrush finish.", price: "From ₹12,999" },
      { title: "Engagement & Reception Glam", desc: "Customized soft glam for evening functions.", price: "From ₹7,999" },
      { title: "Guest & Family Makeup", desc: "Party makeover for family members.", price: "From ₹999" },
    ],
  },
  {
    category: "Hair Artistry & Saree Draping",
    icon: Scissors,
    image: "/images/portfolio/traditional-south-indian-bride.jpg",
    imageAlt: "Traditional South Indian Bridal Hairstyle",
    items: [
      { title: "South Indian Mogra Gajra Jada", desc: "Classic fresh floral braid extensions.", price: "From ₹2,500" },
      { title: "French Bubble Pearl Braid", desc: "Modern braided crown with pearl pins & crystal accessories.", price: "From ₹3,000" },
      { title: "Temple Silver Choti Medallions", desc: "Traditional coin medallion hair jewellery styling.", price: "From ₹2,000" },
      { title: "Saree Box Pleating & Folding", desc: "Iron pressing and pre-pleating for hassle-free drape.", price: "From ₹800" },
    ],
  },
  {
    category: "Enhancements & Rentals",
    icon: Heart,
    image: "/images/jewellery/antique-bridal-complete-set.jpg",
    imageAlt: "Antique Temple Gold Jewellery Rental",
    items: [
      { title: "Antique Jewellery Rental", desc: "Temple gold, antique chokers, and ottiyanam waist belts.", price: "From ₹1,200" },
      { title: "Bridal & Guest Mehendi", desc: "Customized intricate henna designs.", price: "From ₹1,500" },
      { title: "Studio Trial & Matching Session", desc: "Personalized saree drape & foundation shade match.", price: "From ₹999" },
      { title: "Outstation Travel Team", desc: "Styling team available across Tamil Nadu & South India.", price: "Contact Us" },
    ],
  },
];

const HAIRSTYLE_CATALOG = [
  { title: "French & Dutch Bubble Pearl Braid", desc: "Complex crown braid with embedded pearl pins and a silver crystal floral top piece.", tag: "Modern Reception", emoji: "💎" },
  { title: "Butterfly Accented Crimped Braid", desc: "Vibrant butterfly pins placed vertically along crimped hair texture for Mehendi functions.", tag: "Mehendi / Sangeet", emoji: "🦋" },
  { title: "Classic South Indian Mogra Poola Jada", desc: "Traditional fresh jasmine flower wrap with top floral bun decor for Muhurtham ceremony.", tag: "Muhurtham Classic", emoji: "🌸" },
  { title: "Temple Silver Choti Medallion Braid", desc: "Thick South Indian long braid embellished with silver choti discs and top white gajra.", tag: "Traditional Heritage", emoji: "🪙" },
];

export default function ServicesPage() {
  const [sections, setSections] = useState(DEFAULT_SERVICES);

  useEffect(() => {
    async function fetchLiveServices() {
      try {
        const res = await fetch("/api/services", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache, no-store" },
        });
        const json = await res.json();
        if (res.ok && json.success && Array.isArray(json.data) && json.data.length > 0) {
          const dbServices: Array<{ title: string; description: string; price: string; category: string }> = json.data;

          setSections((prevSections) =>
            prevSections.map((sec) => {
              const updatedItems = sec.items.map((item) => {
                const match = dbServices.find(
                  (dbItem) => dbItem.title.toLowerCase().trim() === item.title.toLowerCase().trim()
                );
                return match ? { ...item, price: match.price, desc: match.description || item.desc } : item;
              });
              return { ...sec, items: updatedItems };
            })
          );
        }
      } catch (err) {
        console.warn("[SERVICES_PAGE] Failed to fetch live prices, using fallback:", err);
      }
    }
    fetchLiveServices();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <section className="relative h-[52vh] min-h-[320px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/portfolio/bridal-pink-saree-gold-jewellery.jpg"
            alt="SKM Luxury Bridal Services"
            fill
            sizes="100vw"
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/10" />
        </div>
        <div className="relative z-10 container mx-auto px-4 pb-12 text-center w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-primary font-medium tracking-[0.25em] uppercase text-xs block mb-3">Our Signature Offerings</span>
            <h1 className="font-heading text-4xl sm:text-6xl font-bold text-foreground tracking-tight">
              Bridal Beauty & Styling Services
            </h1>
            <div className="w-16 h-1 bg-primary mx-auto mt-4" />
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-6xl pt-6 pb-20">
        <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed text-center mb-20">
          Certified MUA packages by <strong className="text-foreground">Maha Shree</strong> (@maha_unique_brides_23). High-definition makeup, saree box pleating, and signature bridal hair artistry.
        </p>

        {/* Service Sections with Alternating Image Layout */}
        <div className="space-y-24 mb-24">
          {sections.map((section, index) => {
            const IconComp = section.icon;
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={section.category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              >
                <div className={isEven ? "lg:order-1" : "lg:order-2"}>
                  <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden border border-border/60 shadow-xl">
                    <Image
                      src={section.image}
                      alt={section.imageAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 z-10">
                      <div className="inline-flex items-center gap-2 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-primary/20 text-xs font-bold text-primary">
                        <IconComp size={14} /> {section.category}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`space-y-6 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-full"><IconComp size={22} /></div>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">{section.category}</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {section.items.map((item, i) => (
                      <div key={i} className="group bg-card border border-border/70 hover:border-primary/50 p-4 rounded-xl shadow-sm hover:shadow-md transition-all">
                        <h3 className="font-heading font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-snug mb-1">{item.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-2">{item.desc}</p>
                        <span className="text-xs font-bold text-primary font-mono">{item.price}</span>
                      </div>
                    ))}
                  </div>
                  <Button asChild size="sm" className="bg-primary text-primary-foreground text-xs uppercase tracking-widest font-semibold gap-2">
                    <Link href={`/booking?service=${encodeURIComponent(section.category)}`}>
                      Book {section.category.split(" ")[0]} Service <ArrowRight size={14} />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Hairdo Catalog */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 sm:p-10 mb-16 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">From Our Instagram Reel Feed</span>
            <h2 className="font-heading text-3xl font-bold text-foreground">Signature Hairdo Artistry Catalog</h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              Real bridal hairstyles crafted by Maha Shree as featured on <strong className="text-foreground">@maha_unique_brides_23</strong>.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HAIRSTYLE_CATALOG.map((hair, idx) => (
              <div key={idx} className="bg-card border border-border/80 p-5 rounded-xl space-y-3 flex flex-col justify-between hover:border-primary/50 hover:shadow-md transition-all group">
                <div className="space-y-2">
                  <div className="text-3xl mb-2">{hair.emoji}</div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary inline-block">{hair.tag}</span>
                  <h3 className="font-heading font-bold text-sm text-foreground leading-snug group-hover:text-primary transition-colors">{hair.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{hair.desc}</p>
                </div>
                <Button asChild size="sm" variant="outline" className="w-full text-xs font-semibold mt-4">
                  <Link href={`/booking?service=${encodeURIComponent(hair.title)}`}>
                    Request Hairdo <ArrowRight size={12} className="ml-1" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="relative overflow-hidden text-center bg-card border border-primary/20 p-10 rounded-2xl shadow-lg space-y-5">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <h2 className="font-heading text-3xl font-bold text-foreground">Ready to Reserve Your Wedding Date?</h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Book a trial session or consult with Maha Shree for customized bridal makeup and hair styling.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button asChild size="lg" className="bg-primary text-primary-foreground font-semibold px-8 py-6">
                <Link href="/booking">Book Your Consultation</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary/30 px-8 py-6 gap-2">
                <a href="https://wa.me/918608194233" target="_blank" rel="noreferrer">
                  <PhoneCall size={16} /> WhatsApp Maha Shree
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
