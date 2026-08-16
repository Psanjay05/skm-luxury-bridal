"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["All", "Bridal", "Reception", "Engagement", "Guest", "Mehendi", "Jewellery", "Hairstyle", "Before & After"];

const FALLBACK_ITEMS = [
  {
    _id: "1",
    category: "Before & After",
    title: "HD Bridal Makeover Transformation",
    altText: "Flawless Sweat-Proof HD Base, Lip & Eye Artistry by Maha Shree",
    imageUrl: "/images/portfolio/before-after-hd-makeover.jpg",
  },
  {
    _id: "2",
    category: "Bridal",
    title: "Outdoor Traditional South Indian Bride",
    altText: "Intricate Long Braid Hair Accessories & Antique Temple Gold",
    imageUrl: "/images/portfolio/traditional-south-indian-bride.jpg",
  },
  {
    _id: "3",
    category: "Bridal",
    title: "Royal Pink Silk Bridal Look",
    altText: "Layered Antique Necklaces & High Definition Finish",
    imageUrl: "/images/portfolio/bridal-pink-saree-gold-jewellery.jpg",
  },
  {
    _id: "4",
    category: "Jewellery",
    title: "Graceful Full Standing Bridal Pose",
    altText: "Pre-Pleated Silk Saree, Gold Waist Belt (Ottiyanam) & Styling",
    imageUrl: "/images/portfolio/full-bridal-pose-silk-saree.jpg",
  },
  {
    _id: "5",
    category: "Hairstyle",
    title: "Glowing HD Bridal Close-Up",
    altText: "Maang Tikka, Temple Earrings & Soft Glam Glow",
    imageUrl: "/images/portfolio/bridal-close-up-portrait.jpg",
  },
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [items, setItems] = useState(FALLBACK_ITEMS);
  const [selectedItem, setSelectedItem] = useState<(typeof FALLBACK_ITEMS)[0] | null>(null);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const url = activeCategory === "All" ? "/api/gallery" : `/api/gallery?category=${encodeURIComponent(activeCategory)}`;
        const res = await fetch(url);
        const json = await res.json();
        if (res.ok && json.success && json.data && json.data.length > 0) {
          setItems(json.data);
        } else if (activeCategory === "All") {
          setItems(FALLBACK_ITEMS);
        }
      } catch (err) {
        console.error("[FETCH_GALLERY_ERROR]", err);
      }
    }
    fetchGallery();
  }, [activeCategory]);

  const filteredItems = items.filter((item) => activeCategory === "All" || item.category === activeCategory);

  return (
    <div className="min-h-screen pt-28 pb-20 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="text-center mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs uppercase tracking-[0.2em] font-medium">
            <Sparkles size={14} className="text-primary" /> Real Client Transformations
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-medium tracking-tight">Our Masterpieces</h1>
          <div className="w-16 h-1 bg-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Real brides transformed by <strong className="text-foreground">Maha Shree</strong> at SKM Luxury Bridal Studio. Exploring HD makeup, saree box pleating, and antique jewellery styling.
          </p>
        </div>

        {/* Categories / Interactive Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-14">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 sm:px-6 py-2 rounded-full text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${
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

        {/* Gallery Grid */}
        <motion.div 
          layout 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                onClick={() => setSelectedItem(item)}
                className="group relative bg-card border border-border/70 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all cursor-pointer flex flex-col aspect-[3/4]"
              >
                {/* Image Container */}
                <div className="relative w-full h-full overflow-hidden bg-primary/5">
                  <Image
                    src={item.imageUrl}
                    alt={item.altText || item.title || "SKM Luxury Bridal Makeover"}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  
                  {/* Category Pill Overlay */}
                  <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full border border-primary/20 text-[10px] uppercase font-bold tracking-widest text-primary shadow-sm">
                    {item.category}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 z-20">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-3 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <Eye size={18} />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-foreground">{item.title || item.category}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.altText}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Modal Lightbox Preview */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card border border-primary/20 rounded-2xl max-w-3xl w-full p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-6 max-h-[90vh]"
              >
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 z-30 bg-background/80 hover:bg-secondary text-foreground p-2 rounded-full border border-border shadow-sm"
                >
                  <X size={20} />
                </button>

                {/* Large Preview Image */}
                <div className="relative w-full md:w-1/2 min-h-[320px] md:min-h-[420px] rounded-xl overflow-hidden border border-border bg-primary/5">
                  <Image
                    src={selectedItem.imageUrl}
                    alt={selectedItem.altText || selectedItem.title || "Bridal Makeover"}
                    fill
                    className="object-cover object-top"
                  />
                </div>

                {/* Info & Booking CTAs */}
                <div className="w-full md:w-1/2 flex flex-col justify-between py-2">
                  <div className="space-y-4">
                    <span className="text-xs uppercase tracking-widest font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 inline-block">
                      {selectedItem.category} Work
                    </span>
                    <h3 className="font-heading text-2xl md:text-3xl font-medium text-foreground">{selectedItem.title || selectedItem.category}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedItem.altText}</p>

                    <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 space-y-2 text-xs text-muted-foreground">
                      <div className="font-semibold text-foreground">Services Highlighted:</div>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Long-Lasting HD Bridal Makeup</li>
                        <li>Saree Pre-Pleating & Draping</li>
                        <li>Antique Temple Jewellery Styling</li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border flex flex-col gap-3">
                    <Button asChild className="w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-widest py-6 font-semibold shadow-md">
                      <a href="/booking">Book This Look with Maha Shree</a>
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
