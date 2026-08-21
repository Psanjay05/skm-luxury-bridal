"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, X, Download, Copy, Check, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QRCodeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const websiteUrl = "https://skm-luxury-bridal.vercel.app";

  const handleCopy = () => {
    navigator.clipboard.writeText(websiteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-wider transition-all shadow-xs"
        aria-label="View Website QR Code"
      >
        <QrCode size={14} />
        <span>Scan QR Code</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            {/* Backdrop click to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm bg-card border border-primary/30 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 text-center space-y-5 overflow-hidden"
            >
              {/* Decorative Glow */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div className="space-y-1.5 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] uppercase font-bold tracking-widest">
                  <Sparkles size={12} /> SKM Luxury Bridal Studio
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground">
                  Scan to Visit Website
                </h3>
                <p className="text-xs text-muted-foreground">
                  Scan with your phone camera to explore bridal makeovers, packages & jewellery rentals.
                </p>
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-4 rounded-2xl border-2 border-primary/30 shadow-inner inline-block mx-auto">
                <div className="relative w-48 h-48 sm:w-52 sm:h-52">
                  <Image
                    src="/images/skm-qr-code.png"
                    alt="SKM Luxury Bridal Studio Website QR Code"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              {/* Website URL display */}
              <div className="bg-muted/50 px-3 py-2 rounded-xl border border-border flex items-center justify-between text-xs">
                <span className="truncate text-muted-foreground font-mono font-medium max-w-[200px]">
                  {websiteUrl}
                </span>
                <button
                  onClick={handleCopy}
                  className="text-primary hover:text-primary/80 font-semibold inline-flex items-center gap-1 shrink-0 ml-2"
                >
                  {copied ? (
                    <>
                      <Check size={13} className="text-emerald-500" />
                      <span className="text-emerald-500 text-[11px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-semibold gap-1.5 border-primary/30 hover:bg-primary/10"
                >
                  <a href="/images/skm-qr-code.png" download="SKM-Luxury-Bridal-QR.png">
                    <Download size={14} /> Download PNG
                  </a>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="w-full text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={14} /> Open Site
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
