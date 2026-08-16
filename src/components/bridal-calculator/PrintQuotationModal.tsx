"use client";

import React from "react";
import { X, Printer, Sparkles, Phone, MapPin, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrintQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFunctions: Array<{ name: string; cost: number }>;
  selectedAddons: Array<{ name: string; cost: number }>;
  totalCost: number;
}

export function PrintQuotationModal({
  isOpen,
  onClose,
  selectedFunctions,
  selectedAddons,
  totalCost,
}: PrintQuotationModalProps) {
  if (!isOpen) return null;

  const quoteDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const quoteRef = `SKM-EST-${Date.now().toString().slice(-6)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-card border border-primary/30 rounded-3xl max-w-2xl w-full p-6 sm:p-10 shadow-2xl relative my-8 overflow-hidden space-y-6">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-border pb-4 print:hidden">
          <div className="inline-flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} /> Official Bridal Quotation
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-primary text-primary-foreground text-xs gap-1.5 font-semibold"
            >
              <Printer size={14} /> Print / Save PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PRINTABLE QUOTATION SHEET CONTAINER */}
        <div id="printable-quotation-sheet" className="space-y-6 text-foreground">
          {/* Header Brand */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-primary/20 pb-6">
            <div>
              <span className="font-heading text-2xl font-bold tracking-wider text-primary">
                SKM LUXURY BRIDAL STUDIO
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Principal MUA: <strong className="text-foreground">Maha Shree</strong> (@maha_unique_brides_23)
              </p>
              <p className="text-xs text-muted-foreground">
                4/39 Alagusamuthiram, Near Steel Plant, Salem, TN
              </p>
            </div>
            <div className="text-left sm:text-right space-y-0.5">
              <span className="text-xs uppercase font-bold tracking-widest text-primary block">
                Bridal Package Estimate
              </span>
              <span className="text-xs font-mono font-semibold text-foreground block">Ref: {quoteRef}</span>
              <span className="text-xs text-muted-foreground block">{quoteDate}</span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary">
              1. Selected Wedding Functions & Makeover Artistry
            </h3>
            <div className="border border-border/80 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4 text-left">Event / Function</th>
                    <th className="py-2.5 px-4 text-left">Description</th>
                    <th className="py-2.5 px-4 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {selectedFunctions.map((f) => (
                    <tr key={f.name}>
                      <td className="py-2.5 px-4 font-semibold text-foreground">{f.name}</td>
                      <td className="py-2.5 px-4 text-muted-foreground">
                        HD sweat-proof makeover, hair artistry & saree draping
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-foreground">
                        ₹{f.cost.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                  {selectedFunctions.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-muted-foreground italic">
                        No primary functions selected
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add-ons Table */}
          {selectedAddons.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary">
                2. Enhancements, Add-ons & Rentals
              </h3>
              <div className="border border-border/80 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4 text-left">Service / Add-on</th>
                      <th className="py-2.5 px-4 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {selectedAddons.map((a) => (
                      <tr key={a.name}>
                        <td className="py-2.5 px-4 font-medium text-foreground">{a.name}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold text-foreground">
                          +₹{a.cost.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Total & Deposit Box */}
          <div className="bg-primary/5 border border-primary/30 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block">
                Total Estimated Bridal Package
              </span>
              <span className="text-3xl font-heading font-bold text-primary">
                ₹{totalCost.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="text-left sm:text-right space-y-1">
              <span className="text-[11px] text-muted-foreground block">
                Advance Booking Deposit to Lock Date:
              </span>
              <span className="text-sm font-bold text-foreground font-mono">
                ₹5,000 via UPI (8608194233@upi)
              </span>
            </div>
          </div>

          {/* Terms & Studio Info */}
          <div className="space-y-2 pt-2 border-t border-border/60 text-[11px] text-muted-foreground leading-relaxed">
            <h4 className="font-bold text-foreground uppercase tracking-wider text-[10px]">
              Studio Inclusions & Terms:
            </h4>
            <ul className="space-y-1 list-disc pl-4">
              <li>Includes premium sweat-proof 18-hour HD foundation base & shade match.</li>
              <li>Saree box pleating & pre-ironed folding included where specified.</li>
              <li>Free studio consultation & trial session available at Salem studio prior to wedding.</li>
              <li>Travel expenses applicable for on-location destination weddings outside Salem city.</li>
            </ul>
          </div>

          {/* Contact Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <Phone size={12} className="text-primary" /> +91 86081 94233 / +91 89735 87806
            </span>
            <span>Maha Shree • SKM Luxury Bridal Studio</span>
          </div>
        </div>
      </div>
    </div>
  );
}
