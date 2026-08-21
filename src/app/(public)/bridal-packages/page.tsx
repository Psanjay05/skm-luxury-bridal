"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Check, ArrowRight, Calculator, Star, PhoneCall, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trackEvent } from "@/lib/gtag";
import { PrintQuotationModal } from "@/components/bridal-calculator/PrintQuotationModal";

interface PackageTier {
  name: string;
  price: string;
  tagline: string;
  featured?: boolean;
  features: string[];
  cta: string;
}

const DEFAULT_PACKAGES: PackageTier[] = [
  {
    name: "Classic Bridal Package",
    price: "₹18,000",
    tagline: "Essential HD makeover for budget-conscious brides",
    features: [
      "High Definition (HD) Foundation Base",
      "Traditional Hair Styling & Flower Draping",
      "Saree Box Pleating & Draping",
      "Eyelash Extension Application",
      "Studio Consultation Session",
    ],
    cta: "Book Classic Package",
  },
  {
    name: "Royal HD Makeover Package",
    price: "₹25,000",
    tagline: "Our most popular 2-event Muhurtham + Reception package",
    featured: true,
    features: [
      "HD Base for Muhurtham & Reception",
      "2 Distinct Hairstyles (Traditional + Modern)",
      "Premium Saree Pre-Pleating & Ironing",
      "Complimentary Studio Trial Session",
      "Jewellery Rental 20% Discount",
      "Mother of Bride Touch-Up Makeup",
    ],
    cta: "Book Royal HD Package",
  },
  {
    name: "Luxury Airbrush Grand Package",
    price: "₹35,000",
    tagline: "18+ Hour waterproof Airbrush finish for grand stage weddings",
    features: [
      "18-Hour Waterproof Airbrush Base",
      "3 Event Look Artistry (Engagement, Muhurtham, Reception)",
      "Senior Hairstylist & Saree Draping Team",
      "Free Studio Trial Session",
      "Complete Temple Jewellery Set Included",
      "2 Family Member Touch-Ups",
    ],
    cta: "Book Luxury Airbrush",
  },
];

export default function BridalPackagesPage() {
  const [packages, setPackages] = useState<PackageTier[]>(DEFAULT_PACKAGES);
  // Package customizer interactive state
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>(["Muhurtham"]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>(["Saree Box Pleating"]);
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
    async function fetchLivePackages() {
      try {
        const res = await fetch("/api/services");
        const json = await res.json();
        if (res.ok && json.success && Array.isArray(json.data) && json.data.length > 0) {
          const dbServices: Array<{ title: string; price: string; tagline?: string }> = json.data;

          setPackages((prev) =>
            prev.map((pkg) => {
              const match = dbServices.find(
                (s) => s.title.toLowerCase().trim() === pkg.name.toLowerCase().trim()
              );
              return match ? { ...pkg, price: match.price, tagline: match.tagline || pkg.tagline } : pkg;
            })
          );
        }
      } catch (err) {
        console.warn("[BRIDAL_PACKAGES] Using fallback packages:", err);
      }
    }
    fetchLivePackages();
  }, []);

  const functionsList = [
    { name: "Muhurtham", cost: 12000 },
    { name: "Reception", cost: 10000 },
    { name: "Engagement", cost: 8000 },
    { name: "Mehendi & Sangeet", cost: 6000 },
  ];

  const addonsList = [
    { name: "Saree Box Pleating & Folding", cost: 800 },
    { name: "Jewellery Rental Set", cost: 2500 },
    { name: "Airbrush Upgrade", cost: 4000 },
    { name: "Mother/Guest Makeup", cost: 3000 },
  ];

  const toggleFunction = (name: string) => {
    setSelectedFunctions((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
    );
  };

  const toggleAddon = (name: string) => {
    setSelectedAddons((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const calculateTotal = () => {
    const fTotal = selectedFunctions.reduce((sum, f) => {
      const item = functionsList.find((i) => i.name === f);
      return sum + (item ? item.cost : 0);
    }, 0);

    const aTotal = selectedAddons.reduce((sum, a) => {
      const item = addonsList.find((i) => i.name === a);
      return sum + (item ? item.cost : 0);
    }, 0);

    return fTotal + aTotal;
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs uppercase tracking-[0.2em] font-semibold">
            <Sparkles size={14} /> Curated Experiences
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Bridal Makeover Packages
          </h1>
          <div className="w-16 h-1 bg-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
            Transparent pricing packages designed to make every bride shine on her Muhurtham and Reception nights. Custom combo packages tailored by <strong className="text-foreground">Maha Shree</strong>.
          </p>
        </div>

        {/* Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {packages.map((pkg, idx) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <Card
                className={`h-full border transition-all flex flex-col justify-between relative ${
                  pkg.featured
                    ? "border-primary shadow-2xl bg-card scale-105 z-10"
                    : "border-border/80 shadow-md bg-card"
                }`}
              >
                {pkg.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> Most Popular Bride Choice
                  </div>
                )}

                <CardHeader className="text-center pb-4 pt-8">
                  <CardTitle className="font-heading text-2xl font-bold text-foreground">
                    {pkg.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-1">
                    {pkg.tagline}
                  </CardDescription>
                  <div className="mt-4 pt-4 border-t border-border/60">
                    <span className="text-3xl sm:text-4xl font-heading font-bold text-primary">
                      {pkg.price}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-0 flex-1 flex flex-col justify-between">
                  <ul className="space-y-3 text-xs text-muted-foreground">
                    {pkg.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={`w-full py-5 font-semibold text-xs uppercase tracking-wider ${
                      pkg.featured
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                        : "bg-secondary/80 text-foreground hover:bg-primary hover:text-primary-foreground"
                    }`}
                  >
                    <Link href={`/booking?service=${encodeURIComponent(pkg.name)}`}>
                      {pkg.cta} <ArrowRight size={14} className="ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Interactive Custom Package Calculator */}
        <div className="bg-card border border-primary/30 rounded-xl p-6 sm:p-10 shadow-xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                <Calculator size={16} /> Interactive Builder
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                Build Your Custom Combo Package
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                Select your wedding functions and optional addons to calculate instant package estimate.
              </p>
            </div>
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg text-right">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block">Estimated Package Price</span>
              <span className="text-3xl font-bold font-heading text-primary">₹{calculateTotal().toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Step 1: Select Functions */}
            <div className="space-y-4">
              <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                1. Select Wedding Functions:
              </h3>
              <div className="space-y-2">
                {functionsList.map((f) => {
                  const isChecked = selectedFunctions.includes(f.name);
                  return (
                    <button
                      key={f.name}
                      type="button"
                      onClick={() => toggleFunction(f.name)}
                      className={`w-full p-3.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                        isChecked
                          ? "bg-primary/10 border-primary text-foreground font-semibold shadow-sm"
                          : "bg-background border-border text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${isChecked ? "bg-primary border-primary text-primary-foreground" : "border-border"}`}>
                          {isChecked && <Check size={14} />}
                        </div>
                        <span className="text-sm">{f.name}</span>
                      </div>
                      <span className="text-xs font-mono font-medium text-primary">+₹{f.cost.toLocaleString("en-IN")}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Addons */}
            <div className="space-y-4">
              <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                2. Select Enhancements & Addons:
              </h3>
              <div className="space-y-2">
                {addonsList.map((a) => {
                  const isChecked = selectedAddons.includes(a.name);
                  return (
                    <button
                      key={a.name}
                      type="button"
                      onClick={() => toggleAddon(a.name)}
                      className={`w-full p-3.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                        isChecked
                          ? "bg-primary/10 border-primary text-foreground font-semibold shadow-sm"
                          : "bg-background border-border text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${isChecked ? "bg-primary border-primary text-primary-foreground" : "border-border"}`}>
                          {isChecked && <Check size={14} />}
                        </div>
                        <span className="text-sm">{a.name}</span>
                      </div>
                      <span className="text-xs font-mono font-medium text-primary">+₹{a.cost.toLocaleString("en-IN")}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center lg:text-left">
              <p className="text-xs text-muted-foreground">
                Selected: <strong className="text-foreground">{selectedFunctions.join(", ") || "None"}</strong> with addons: <strong className="text-foreground">{selectedAddons.join(", ") || "None"}</strong>.
              </p>
              <p className="text-[11px] text-primary/80">
                Instant confirmation available directly via WhatsApp or Online Booking.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 w-full lg:w-auto">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold tracking-wide py-6 shadow-md"
                onClick={() => trackEvent("package_builder_quote", {
                  type: "online_reserve",
                  value: calculateTotal(),
                  functions: selectedFunctions.join(", "),
                })}
              >
                <Link href={`/booking?service=Custom%20Package%20(Est%20₹${calculateTotal()})`}>
                  Reserve Online <ArrowRight size={16} className="ml-1" />
                </Link>
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-primary/40 py-6 gap-2 font-semibold hover:bg-primary/10"
                onClick={() => {
                  trackEvent("package_builder_quote", { type: "print_pdf_estimate", value: calculateTotal() });
                  setShowPrintModal(true);
                }}
              >
                <FileText size={16} className="text-primary" /> Download / Print PDF
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-primary/30 py-6 gap-2 font-semibold"
                onClick={() => trackEvent("whatsapp_click", {
                  source: "package_builder",
                  value: calculateTotal(),
                })}
              >
                <a
                  href={`https://wa.me/918608194233?text=${encodeURIComponent(
                    `Hello Maha Shree, I calculated a custom bridal package on your website for ₹${calculateTotal().toLocaleString("en-IN")}:\n• Functions: ${selectedFunctions.join(", ") || "None"}\n• Add-ons: ${selectedAddons.join(", ") || "None"}\nPlease let me know your availability!`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <PhoneCall size={16} className="text-primary" /> WhatsApp Quote
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Printable PDF Quotation Modal */}
        <PrintQuotationModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          selectedFunctions={functionsList.filter((f) => selectedFunctions.includes(f.name))}
          selectedAddons={addonsList.filter((a) => selectedAddons.includes(a.name))}
          totalCost={calculateTotal()}
        />
      </div>
    </div>
  );
}
