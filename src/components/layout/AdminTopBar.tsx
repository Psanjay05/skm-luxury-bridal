"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import {
  Menu,
  X,
  LayoutDashboard,
  CalendarCheck,
  ImageIcon,
  Star,
  HelpCircle,
  Settings,
  LogOut,
  Sparkles,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/shared/SignOutButton";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/services", label: "Services & Pricing", icon: Sparkles },
  { href: "/admin/gallery", label: "Gallery Portfolio", icon: ImageIcon },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/messages", label: "Messages", icon: Phone },
  { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminTopBar({ userName = "Admin" }: { userName?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="h-16 bg-card border-b border-border flex items-center px-4 sm:px-6 gap-3 shrink-0 justify-between sticky top-0 z-30 shadow-xs">
        {/* Left: Mobile hamburger & title */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground -ml-1.5"
            aria-label="Open Navigation Drawer"
          >
            <Menu size={20} />
          </Button>

          <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
            <span className="text-primary font-heading font-bold">SKM</span>
            <span className="text-muted-foreground hidden xs:inline">Luxury Bridal Admin</span>
          </div>
        </div>

        {/* Right: User badge & Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-sm font-bold">M</span>
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-foreground leading-tight">{userName}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Administrator</p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </header>

      {/* Mobile Slide-Out Drawer with Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Slide-out drawer content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-72 max-w-[85vw] bg-card border-r border-border h-full flex flex-col shadow-2xl z-10"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-border h-16">
                <div className="font-heading text-lg text-primary font-bold">
                  SKM Admin
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground"
                  aria-label="Close navigation"
                >
                  <X size={18} />
                </Button>
              </div>

              {/* Navigation items */}
              <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
                {NAV.map(({ href, label, icon: Icon }) => {
                  const active = pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon size={18} className="shrink-0" />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer Footer */}
              <div className="p-3 border-t border-border space-y-2">
                <button
                  onClick={() => signOut({ callbackUrl: "/admin/login" })}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all w-full"
                >
                  <LogOut size={18} className="shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
