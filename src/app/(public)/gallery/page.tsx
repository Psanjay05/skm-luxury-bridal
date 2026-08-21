"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, X, Sparkles, ExternalLink, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BeforeAfterSlider } from "@/components/ui/before-after-slider";

// Inline Instagram Icon
function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

// Instagram post shortcodes from @maha_unique_brides_23
const INSTAGRAM_POSTS = [
  { code: "Dbi-qSYmMSN", caption: "Signature Hairdo Artistry" },
  { code: "DbtQfaUGMml", caption: "Real Bride Transformation" },
  { code: "Dbj4p3KGQHQ", caption: "Bridal Makeover Highlights" },
  { code: "DZgQ3DJGRBY", caption: "HD Bridal Glam Session" },
  { code: "DZXoNHAGzY6", caption: "Saree & Jewellery Styling" },
  { code: "DYnPq1KGrHv", caption: "South Indian Bridal Look" },
];

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
    title: "Royal Antique Temple Gold Grand Set",
    altText: "Lakshmi Goddess motif antique temple gold necklace, choker, Jhumkas & Maang Tikka",
    imageUrl: "/images/jewellery/antique-bridal-complete-set.jpg",
  },
  {
    _id: "5",
    category: "Hairstyle",
    title: "Glowing HD Bridal Close-Up",
    altText: "Maang Tikka, Temple Earrings & Soft Glam Glow",
    imageUrl: "/images/portfolio/bridal-close-up-portrait.jpg",
  },
  {
    _id: "6",
    category: "Jewellery",
    title: "Lakshmi Haram Full Bridal Set",
    altText: "Full Lakshmi Haram with Ottiyanam, Maang Tikka & chandelier earrings",
    imageUrl: "/images/jewellery/lakshmi-haram-full-set.jpg",
  },
  {
    _id: "7",
    category: "Jewellery",
    title: "Peacock Antique Bridal Set",
    altText: "Peacock motif antique gold layered necklaces, Jhumkas & Vanki bangle",
    imageUrl: "/images/jewellery/peacock-antique-bridal-set.jpg",
  },
  {
    _id: "8",
    category: "Jewellery",
    title: "Matt Finish Antique Gold Grand Set",
    altText: "Premium matte-finish Lakshmi pendant necklaces with Ottiyanam belt",
    imageUrl: "/images/jewellery/antique-gold-bridal-set.jpg",
  },
  {
    _id: "9",
    category: "Jewellery",
    title: "Bride Look – Jewellery on Blue Silk Saree",
    altText: "Real bride wearing layered gold necklaces, Maang Tikka, Jhumkas & Vanki armlet",
    imageUrl: "/images/jewellery/bride-wearing-jewellery.jpg",
  },
  {
    _id: "10",
    category: "Jewellery",
    title: "Lakshmi Temple Display Grand Set",
    altText: "Showstopper dual-layer haram with grand Ottiyanam & chandelier Jhumkas on mannequin",
    imageUrl: "/images/jewellery/lakshmi-temple-display-set.jpg",
  },
  {
    _id: "11",
    category: "Jewellery",
    title: "Nakshi Peacock Full Bridal Set",
    altText: "Nakshi peacock motif antique gold layered necklaces with Jhumkas & Vanki bangle",
    imageUrl: "/images/jewellery/nakshi-peacock-full-set.jpg",
  },
  {
    _id: "12",
    category: "Jewellery",
    title: "Pearl Lakshmi Collage Set",
    altText: "Pearl-drop Lakshmi temple necklace collage with Ottiyanam & antique Jhumkas",
    imageUrl: "/images/jewellery/pearl-lakshmi-collage-set.jpg",
  },
  {
    _id: "13",
    category: "Jewellery",
    title: "Grand Antique Multi-Layer Temple Set",
    altText: "4-layer antique temple gold set with dual Ottiyanam strands & statement Jhumkas",
    imageUrl: "/images/jewellery/grand-antique-multi-layer-set.jpg",
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

        {/* Featured Transformation Slider Spotlight */}
        <div className="max-w-4xl mx-auto mb-16 bg-card border border-primary/20 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-border pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                <SlidersHorizontal size={14} /> Interactive Transformation
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                Before & After HD Artistry
              </h2>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs sm:text-right">
              Slide horizontally to witness the skin texture preservation & HD sweat-proof finish by Maha Shree.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <BeforeAfterSlider
              beforeImage="/images/portfolio/before-after-hd-makeover.jpg"
              afterImage="/images/portfolio/bridal-close-up-portrait.jpg"
              beforeLabel="Natural Skin Base"
              afterLabel="HD Bridal Glow"
              aspectRatio="4/5"
            />
            <div className="space-y-5">
              <div className="space-y-2">
                <span className="text-xs uppercase font-bold tracking-widest text-primary px-2.5 py-1 bg-primary/10 rounded-full inline-block">
                  Signature Muhurtham Base
                </span>
                <h3 className="font-heading text-2xl font-bold text-foreground">Flawless, Camera-Ready Finish</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every bride receives custom color correction, waterproof HD coverage engineered to withstand stage lighting and tears, perfectly paired with traditional temple gold jewellery.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-background border border-border/80 space-y-1">
                  <span className="text-xs font-bold text-foreground block">18+ Hours</span>
                  <span className="text-[11px] text-muted-foreground">Sweat & smudge resistant durability</span>
                </div>
                <div className="p-3.5 rounded-xl bg-background border border-border/80 space-y-1">
                  <span className="text-xs font-bold text-foreground block">Skin Match</span>
                  <span className="text-[11px] text-muted-foreground">True undertone shade blending</span>
                </div>
              </div>

              <div className="pt-2">
                <Button asChild className="w-full bg-primary text-primary-foreground text-xs uppercase tracking-widest font-semibold py-5">
                  <a href="/booking?service=HD%20Bridal%20Makeover">
                    Book This HD Look <Eye size={14} className="ml-1" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
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

        {/* ── Live Instagram Feed Section ── */}
        <div className="mt-24 space-y-10">
          {/* Section Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white text-xs font-bold uppercase tracking-wider shadow-md">
              <InstagramIcon size={14} /> Live from @maha_unique_brides_23
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              Latest Posts from Instagram
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Live real-time updates from Maha Shree&apos;s official Instagram page. Follow for daily transformation reels, hairdo tutorials, and jewellery styling!
            </p>
          </div>

          {/* Instagram Posts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {INSTAGRAM_POSTS.map((post) => (
              <div key={post.code} className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                {/* Thumbnail Placeholder */}
                <a
                  href={`https://www.instagram.com/p/${post.code}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative aspect-square bg-gradient-to-br from-purple-600/20 via-pink-500/20 to-amber-400/20 group"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                      <InstagramIcon size={28} />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{post.caption}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      View on Instagram <ExternalLink size={11} />
                    </span>
                  </div>
                </a>
                <div className="px-4 py-3 flex items-center justify-between border-t border-border/60">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <InstagramIcon size={14} />
                    <span>@maha_unique_brides_23</span>
                  </div>
                  <a
                    href={`https://www.instagram.com/p/${post.code}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    Open <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Follow CTA */}
          <div className="text-center">
            <a
              href="https://www.instagram.com/maha_unique_brides_23"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-heading font-bold text-sm tracking-wider uppercase shadow-lg hover:shadow-2xl transition-all hover:scale-105"
            >
              <InstagramIcon size={20} /> View All Posts on Instagram <ExternalLink size={16} />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
