"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FAQItem {
  _id?: string;
  question: string;
  answer: string;
  order?: number;
}

const FALLBACK_FAQS: FAQItem[] = [
  {
    _id: "1",
    question: "How far in advance should I book my bridal makeover?",
    answer: "We recommend booking 3 to 6 months prior to your wedding date to secure your date, especially during peak auspicious marriage seasons in Tamil Nadu.",
  },
  {
    _id: "2",
    question: "Do you travel to venues outside Salem?",
    answer: "Yes! Lead artist Maha Shree and our senior styling team travel across Tamil Nadu, Bangalore, and South India for outstation weddings.",
  },
  {
    _id: "3",
    question: "Is a trial makeup session included or available?",
    answer: "Yes, bridal trial sessions can be scheduled at our Salem studio to customize HD foundation shade match, eye artistry, and drape pleating.",
  },
  {
    _id: "4",
    question: "What is the difference between HD and Airbrush Bridal Makeup?",
    answer: "HD Makeup uses ultra-fine pigments for high-definition camera clarity and natural finish. Airbrush uses a specialized air compressor for 18+ hour waterproof finish, ideal for heavy stage lighting.",
  },
  {
    _id: "5",
    question: "How does the jewellery rental process work?",
    answer: "You can select your temple gold, zircon, or antique jewellery sets at our studio or online. Sets are sanitized, reserved with a security deposit, and collected 1-2 days before the event.",
  },
];

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>(FALLBACK_FAQS);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    async function fetchFaqs() {
      try {
        const res = await fetch("/api/faq");
        const json = await res.json();
        if (res.ok && json.success && json.data && json.data.length > 0) {
          setFaqs(json.data);
        }
      } catch (err) {
        console.error("[FETCH_FAQS_ERROR]", err);
      }
    }
    fetchFaqs();
  }, []);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs uppercase tracking-[0.2em] font-semibold mb-4">
            <HelpCircle size={14} /> Got Questions?
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4 text-foreground">
            Frequently Asked Questions
          </h1>
          <div className="w-16 h-1 bg-primary mx-auto mb-6" />
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Everything you need to know about bridal packages, trial sessions, venue travel, and jewellery rental at SKM Luxury Bridal Studio.
          </p>
        </div>

        {/* Accordion list */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={faq._id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-card border border-border/80 rounded-lg overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-heading font-semibold text-foreground hover:text-primary transition-colors"
                >
                  <span className="text-base sm:text-lg">{faq.question}</span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-primary transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-0 text-muted-foreground text-sm sm:text-base border-t border-border/40 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Need more help CTA */}
        <div className="mt-14 p-8 rounded-lg bg-card border border-border text-center space-y-4">
          <h3 className="font-heading text-2xl font-bold text-foreground">
            Have a Specific Question Not Listed Here?
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Our bridal coordinator is available on WhatsApp to answer custom package queries and check date availability instantly.
          </p>
          <div className="pt-2">
            <a href="https://wa.me/918608194233" target="_blank" rel="noreferrer">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold px-6 py-5">
                <MessageCircle size={18} /> Chat with Maha Shree on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
