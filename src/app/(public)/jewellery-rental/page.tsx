"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Sparkles, Check, Phone, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface JewelleryItem {
  id: string;
  name: string;
  category: "Temple Gold" | "Antique Choker" | "Ottiyanam" | "Hair & Maang Tikka" | "Zircon & Bridal Sets";
  priceTag: string;
  image: string;
  description: string;
  includes: string[];
}

const JEWELLERY_CATALOG: JewelleryItem[] = [
  {
    id: "j1",
    name: "Royal Antique Temple Gold Grand Set",
    category: "Temple Gold",
    priceTag: "Rental from ₹3,500 / event",
    image: "/images/jewellery/antique-bridal-complete-set.jpg",
    description: "Traditional Lakshmi Goddess motif antique temple gold long necklace, short choker, matching Jhumkas, and Maang Tikka.",
    includes: ["Long Haram Necklace", "Short Choker", "Jhumka Earrings", "Maang Tikka"],
  },
  {
    id: "j2",
    name: "Lakshmi Haram Full Bridal Set",
    category: "Temple Gold",
    priceTag: "Rental from ₹4,000 / event",
    image: "/images/jewellery/lakshmi-haram-full-set.jpg",
    description: "Stunning full Lakshmi Haram set with long & short necklaces, Ottiyanam waist belt, chandelier earrings, and Maang Tikka — ideal for muhurtham.",
    includes: ["Long Lakshmi Haram", "Short Necklace", "Ottiyanam Belt", "Maang Tikka"],
  },
  {
    id: "j3",
    name: "Nakshi Temple Complete Bridal Set",
    category: "Temple Gold",
    priceTag: "Rental from ₹3,800 / event",
    image: "/images/jewellery/nakshi-temple-set-collage.jpg",
    description: "Intricate Nakshi work temple gold full set with multi-layer necklaces, Ottiyanam hip belt, and traditional motif earrings.",
    includes: ["Nakshi Long Haram", "Short Choker", "Ottiyanam", "Jhumkas"],
  },
  {
    id: "j4",
    name: "Peacock Antique Bridal Set",
    category: "Antique Choker",
    priceTag: "Rental from ₹3,200 / event",
    image: "/images/jewellery/peacock-antique-bridal-set.jpg",
    description: "Majestic peacock motif antique gold bridal set with layered necklaces, Maang Tikka, Jhumkas, and Vanki arm bangle.",
    includes: ["Peacock Choker", "Long Haram", "Jhumkas", "Vanki Bangle", "Maang Tikka"],
  },
  {
    id: "j5",
    name: "Matt Finish Antique Gold Grand Set",
    category: "Temple Gold",
    priceTag: "Rental from ₹4,500 / event",
    image: "/images/jewellery/antique-gold-bridal-set.jpg",
    description: "Premium matte-finish antique temple gold grand set with Lakshmi pendant necklaces, Ottiyanam, statement Jhumkas, and Maang Tikka.",
    includes: ["Lakshmi Pendant Necklace", "Multi-Layer Haram", "Ottiyanam Belt", "Statement Jhumkas", "Maang Tikka"],
  },
  {
    id: "j6",
    name: "Bride Look – Jewellery on Saree",
    category: "Zircon & Bridal Sets",
    priceTag: "Rental from ₹2,800 / event",
    image: "/images/jewellery/bride-wearing-jewellery.jpg",
    description: "Complete bridal jewellery look as worn by a real bride — layered gold necklaces, Maang Tikka, Jhumkas, and Vanki armlet on a blue silk saree.",
    includes: ["Layered Necklace Set", "Maang Tikka", "Jhumka Earrings", "Vanki Armlet"],
  },
  {
    id: "j7",
    name: "Lakshmi Temple Display Grand Set",
    category: "Temple Gold",
    priceTag: "Rental from ₹5,000 / event",
    image: "/images/jewellery/lakshmi-temple-display-set.jpg",
    description: "Showstopper Lakshmi temple gold grand set displayed on mannequin — dual-layer haram, grand Ottiyanam hip belt, chandelier Jhumkas, and Maang Tikka.",
    includes: ["Dual Haram Necklace", "Grand Ottiyanam Belt", "Chandelier Jhumkas", "Maang Tikka"],
  },
  {
    id: "j8",
    name: "Nakshi Peacock Full Bridal Set",
    category: "Antique Choker",
    priceTag: "Rental from ₹3,500 / event",
    image: "/images/jewellery/nakshi-peacock-full-set.jpg",
    description: "Detailed Nakshi peacock motif antique gold full bridal set with layered necklaces, large Jhumkas, Maang Tikka, and Vanki arm bangle.",
    includes: ["Peacock Long Haram", "Short Necklace", "Large Jhumkas", "Vanki Bangle", "Maang Tikka"],
  },
  {
    id: "j9",
    name: "Pearl Lakshmi Collage Set",
    category: "Temple Gold",
    priceTag: "Rental from ₹4,200 / event",
    image: "/images/jewellery/pearl-lakshmi-collage-set.jpg",
    description: "Exquisite pearl-drop Lakshmi temple necklace collage set featuring long haram, short choker, Ottiyanam, and matching antique Jhumkas with pearl tassels.",
    includes: ["Pearl Drop Long Haram", "Short Choker", "Ottiyanam Belt", "Antique Jhumkas"],
  },
  {
    id: "j10",
    name: "Grand Antique Multi-Layer Temple Set",
    category: "Temple Gold",
    priceTag: "Rental from ₹4,800 / event",
    image: "/images/jewellery/grand-antique-multi-layer-set.jpg",
    description: "Majestic multi-layer antique temple gold grand set with 4 necklace layers, dual Ottiyanam strands, ornate Jhumkas, and statement Maang Tikka.",
    includes: ["4-Layer Necklace Set", "Dual Ottiyanam Strand", "Statement Jhumkas", "Maang Tikka"],
  },
];

const CATEGORIES = ["All", "Temple Gold", "Antique Choker", "Ottiyanam", "Hair & Maang Tikka", "Zircon & Bridal Sets"];

export default function JewelleryRentalPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedSet, setSelectedSet] = useState<JewelleryItem | null>(null);

  const filteredItems = activeCategory === "All"
    ? JEWELLERY_CATALOG
    : JEWELLERY_CATALOG.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs uppercase tracking-[0.2em] font-semibold">
            <Sparkles size={14} /> Luxury Accessories
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Bridal Jewellery Rental Catalog
          </h1>
          <div className="w-16 h-1 bg-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
            Elevate your wedding look without hefty purchase costs. Rent premium, sanitized temple gold, antique chokers, and waist belts curated by <strong className="text-foreground">Maha Shree</strong>.
          </p>

          {/* Guarantee Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-600" /> 100% Sanitized & Polished</span>
            <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-600" /> Zero Wear Damage Guarantee</span>
            <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-600" /> Free Trial & Fitting at Salem Studio</span>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "bg-secondary/20 text-muted-foreground hover:bg-primary/10 hover:text-foreground border border-border/50"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full border-border/80 shadow-md hover:shadow-xl transition-all bg-card overflow-hidden flex flex-col justify-between group">
                  <div className="relative aspect-[4/3] overflow-hidden bg-primary/5">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider text-primary border border-primary/20">
                      {item.category}
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-heading text-xl font-bold text-foreground leading-snug">{item.name}</h3>
                      </div>
                      <p className="text-xs text-primary font-bold">{item.priceTag}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>

                      <div className="pt-3 border-t border-border/60">
                        <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider block mb-2">Set Includes:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.includes.map((inc, i) => (
                            <span key={i} className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground flex items-center gap-1">
                              <Check size={10} className="text-emerald-600" /> {inc}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex gap-2">
                      <Button
                        onClick={() => setSelectedSet(item)}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs font-semibold"
                      >
                        View Details
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        className="flex-1 bg-primary text-primary-foreground text-xs font-semibold gap-1"
                      >
                        <Link href={`/booking?service=${encodeURIComponent(item.name)}`}>
                          Rent Set <ArrowRight size={12} />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Modal Lightbox for Details */}
        {selectedSet && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border max-w-xl w-full rounded-lg shadow-2xl p-6 sm:p-8 relative overflow-hidden"
            >
              <button
                onClick={() => setSelectedSet(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-muted text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>

              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-primary px-2.5 py-1 rounded-full bg-primary/10 inline-block">
                  {selectedSet.category}
                </span>
                <h2 className="font-heading text-2xl font-bold text-foreground">{selectedSet.name}</h2>
                <p className="text-sm font-semibold text-primary">{selectedSet.priceTag}</p>

                <div className="aspect-video relative rounded-lg overflow-hidden border border-border">
                  <Image src={selectedSet.image} alt={selectedSet.name} fill className="object-cover object-top" />
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">{selectedSet.description}</p>

                <div className="bg-muted/40 p-4 rounded-lg space-y-2 border border-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Included Items:</h4>
                  <ul className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    {selectedSet.includes.map((inc, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check size={12} className="text-emerald-600" /> {inc}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3 pt-2">
                  <a href="https://wa.me/918608194233" target="_blank" rel="noreferrer" className="flex-1">
                    <Button variant="outline" className="w-full text-xs font-semibold gap-2">
                      <Phone size={14} /> WhatsApp Inquiry
                    </Button>
                  </a>
                  <Button asChild className="flex-1 bg-primary text-primary-foreground text-xs font-semibold">
                    <Link href={`/booking?service=${encodeURIComponent(selectedSet.name)}`}>
                      Reserve Rental Dates
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* CTA Box */}
        <div className="mt-16 p-8 rounded-lg bg-card border border-border text-center space-y-4">
          <h3 className="font-heading text-2xl font-bold text-foreground">Custom Jewellery Matching Session</h3>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Bring your wedding silk saree to our Salem studio! Maha Shree will personally drape and match jewellery sets to complement your saree zari and skin undertone.
          </p>
          <Button asChild className="bg-primary text-primary-foreground font-semibold py-5 px-6">
            <Link href="/booking">Schedule Studio Matching Session</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
