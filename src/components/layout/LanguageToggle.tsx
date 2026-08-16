"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-300 ${
        language === "ta"
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-secondary/40 text-foreground/80 hover:text-foreground border-border hover:border-primary/40"
      } ${className}`}
      title={language === "en" ? "தமிழில் பார்க்க கிளிக் செய்க" : "Switch to English"}
      aria-label="Toggle language between English and Tamil"
    >
      <Globe size={13} className={language === "ta" ? "animate-spin" : ""} />
      <span className="tracking-wide">
        {language === "en" ? "தமிழ்" : "English"}
      </span>
    </button>
  );
}
