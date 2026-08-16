"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Scissors, Heart, Check, ArrowRight } from "lucide-react";

const SERVICES = [
  {
    category: "Bridal Makeup & Skin Finish",
    icon: <Sparkles />,
    items: [
      { title: "HD Sweat-Proof Bridal Makeup", desc: "Long-lasting high-definition pigments for camera clarity." },
      { title: "Airbrush Waterproof Makeover", desc: "18+ hour stage-ready airbrush finish." },
      { title: "Engagement & Reception Glam", desc: "Customized soft glam for evening functions." },
      { title: "Guest & Family Makeup", desc: "Party makeover starting from ₹999." },
    ],
  },
  {
    category: "Hair Artistry & Saree Draping",
    icon: <Scissors />,
    items: [
      { title: "South Indian Mogra Gajra Jada", desc: "Classic fresh floral braid extensions." },
      { title: "French Bubble Pearl Braid", desc: "Modern braided crown with pearl pins & crystal accessories." },
      { title: "Temple Silver Choti Medallions", desc: "Traditional coin medallion hair jewellery styling." },
      { title: "Saree Box Pleating & Folding", desc: "Iron pressing and pre-pleating for hassle-free drape." },
    ],
  },
  {
    category: "Enhancements & Rentals",
    icon: <Heart />,
    items: [
      { title: "Antique Jewellery Rental", desc: "Temple gold, antique chokers, and ottiyanam waist belts." },
      { title: "Bridal & Guest Mehendi", desc: "Customized intricate henna designs." },
      { title: "Studio Trial & Matching Session", desc: "Personalized saree drape & foundation shade match." },
      { title: "Outstation Travel Team", desc: "Styling team available across Tamil Nadu & South India." },
    ],
  },
];

const HAIRSTYLE_CATALOG = [
  {
    title: "French & Dutch Bubble Pearl Braid",
    desc: "Complex crown braid with embedded pearl pins and a silver crystal floral top piece. Seen on @maha_unique_brides_23.",
    tag: "Modern Reception",
  },
  {
    title: "Butterfly Accented Crimped Braid",
    desc: "Vibrant butterfly pins placed vertically along crimped hair texture for Mehendi and Sangeet functions.",
    tag: "Mehendi / Sangeet",
  },
  {
    title: "Classic South Indian Mogra Poola Jada",
    desc: "Traditional fresh jasmine flower wrap with top floral bun decor for Muhurtham saree ceremony.",
    tag: "Muhurtham Classic",
  },
  {
    title: "Temple Silver Choti Medallion Braid",
    desc: "Thick South Indian long braid embellished with silver choti discs and top white gajra.",
    tag: "Traditional Heritage",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="text-primary font-medium tracking-[0.2em] uppercase text-xs block">
            Our Signature Offerings
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground">
            Bridal Beauty & Styling Services
          </h1>
          <div className="w-16 h-1 bg-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
            Certified MUA packages by <strong className="text-foreground">Maha Shree</strong> (@maha_unique_brides_23). High-definition makeup, saree box pleating, and signature bridal hair artistry.
          </p>
        </div>

        {/* Services Grid */}
        <div className="space-y-16 mb-20">
          {SERVICES.map((section, index) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
                <div className="p-2.5 bg-primary/10 text-primary rounded-full">
                  {section.icon}
                </div>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">{section.category}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {section.items.map((item, i) => (
                  <div key={i} className="group bg-card border border-border/70 hover:border-primary/50 p-6 rounded-lg shadow-sm hover:shadow-md transition-all space-y-2">
                    <h3 className="font-heading font-bold text-lg text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Featured Hairdo Catalog from Instagram @maha_unique_brides_23 */}
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
              <div key={idx} className="bg-card border border-border/80 p-5 rounded-xl space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary inline-block">
                    {hair.tag}
                  </span>
                  <h3 className="font-heading font-bold text-base text-foreground leading-snug">{hair.title}</h3>
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

        {/* CTA Box */}
        <div className="text-center bg-card border border-border p-10 rounded-xl space-y-4">
          <h2 className="font-heading text-3xl font-bold text-foreground">Ready to Reserve Your Wedding Date?</h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Book a trial session or consult with Maha Shree for customized bridal makeup and hair styling.
          </p>
          <Button asChild size="lg" className="bg-primary text-primary-foreground font-semibold px-8 py-6">
            <Link href="/booking">Book Your Consultation</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
