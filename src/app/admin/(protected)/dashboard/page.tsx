import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/db";
import Booking from "@/models/Booking";
import ContactMessage from "@/models/ContactMessage";
import GalleryImage from "@/models/Gallery";
import Service from "@/models/Service";
import Testimonial from "@/models/Testimonial";
import FAQ from "@/models/FAQ";
import Link from "next/link";
import {
  CalendarCheck,
  ImageIcon,
  MessageSquare,
  Sparkles,
  Star,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

async function getStats() {
  try {
    await connectToDatabase();
    const [
      totalBookings,
      pendingBookings,
      unreadMessages,
      totalMessages,
      galleryImages,
      totalServices,
      totalTestimonials,
      totalFaqs,
    ] = await Promise.all([
      Booking.countDocuments({ isDeleted: false }),
      Booking.countDocuments({ status: "pending", isDeleted: false }),
      ContactMessage.countDocuments({ status: "unread", isDeleted: false }),
      ContactMessage.countDocuments({ isDeleted: false }),
      GalleryImage.countDocuments({ isDeleted: false }),
      Service.countDocuments({ isDeleted: false }),
      Testimonial.countDocuments({ isDeleted: false }),
      FAQ.countDocuments({ isDeleted: false }),
    ]);
    return {
      totalBookings,
      pendingBookings,
      unreadMessages,
      totalMessages,
      galleryImages,
      totalServices,
      totalTestimonials,
      totalFaqs,
    };
  } catch (err) {
    console.error("[DASHBOARD_STATS_ERROR]", err);
    return {
      totalBookings: 0,
      pendingBookings: 0,
      unreadMessages: 0,
      totalMessages: 0,
      galleryImages: 0,
      totalServices: 0,
      totalTestimonials: 0,
      totalFaqs: 0,
    };
  }
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const stats = await getStats();

  const modules = [
    {
      title: "Bookings",
      count: stats.totalBookings,
      note: `${stats.pendingBookings} pending requests`,
      href: "/admin/bookings",
      icon: CalendarCheck,
      color: "text-amber-600 bg-amber-100 dark:bg-amber-950/50",
      description: "Manage bridal appointment requests, dates, and WhatsApp client contact.",
    },
    {
      title: "Messages",
      count: stats.unreadMessages,
      note: `${stats.totalMessages} total inquiries`,
      href: "/admin/messages",
      icon: MessageSquare,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-950/50",
      description: "Read and reply to customer contact form inquiries.",
    },
    {
      title: "Gallery Portfolio",
      count: stats.galleryImages,
      note: "Photos in portfolio",
      href: "/admin/gallery",
      icon: ImageIcon,
      color: "text-purple-600 bg-purple-100 dark:bg-purple-950/50",
      description: "Upload and manage HD makeover & jewellery transformation photos.",
    },
    {
      title: "Services & Pricing",
      count: stats.totalServices,
      note: "Active service packages",
      href: "/admin/services",
      icon: Sparkles,
      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950/50",
      description: "Update makeup packages, hair styling, and jewellery rental rates.",
    },
    {
      title: "Testimonials",
      count: stats.totalTestimonials,
      note: "Bride reviews & ratings",
      href: "/admin/testimonials",
      icon: Star,
      color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-950/50",
      description: "Approve and feature client ratings on the public website.",
    },
    {
      title: "FAQ Manager",
      count: stats.totalFaqs,
      note: "Published Q&As",
      href: "/admin/faq",
      icon: HelpCircle,
      color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-950/50",
      description: "Manage frequently asked questions for prospective brides.",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck size={14} /> Master Admin Portal
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Welcome back, {session.user?.name ?? "Maha Shree"} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Single control hub to manage all SKM Luxury Bridal Studio data and operations.
          </p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/admin/bookings" className="gap-2">
            View Bookings <ArrowRight size={16} />
          </Link>
        </Button>
      </div>

      {/* Module Hub Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map(({ title, count, note, href, icon: Icon, color, description }) => (
          <Card key={title} className="border-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-heading font-semibold text-foreground">
                  {title}
                </CardTitle>
                <div className={`p-2.5 rounded-xl ${color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                {description}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0 space-y-4">
              <div className="border-t border-border/60 pt-3 flex items-baseline justify-between">
                <span className="text-3xl font-bold font-heading text-foreground">{count}</span>
                <span className="text-xs font-medium text-muted-foreground">{note}</span>
              </div>

              <Button asChild variant="outline" size="sm" className="w-full text-xs gap-2">
                <Link href={href}>
                  Open {title} <ArrowRight size={14} />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
