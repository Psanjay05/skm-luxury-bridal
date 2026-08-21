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
  getLocalBookings,
  getLocalMessages,
  getLocalGallery,
  getLocalServices,
  getLocalTestimonials,
  getLocalFaqs,
} from "@/lib/local-store";
import {
  CalendarCheck,
  ImageIcon,
  MessageSquare,
  Sparkles,
  Star,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Activity,
  UserCheck,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ActivityItem {
  id: string;
  type: "booking" | "message";
  title: string;
  subtitle: string;
  date: Date;
  status: string;
  link: string;
}

async function getDashboardData() {
  const localBookings = getLocalBookings();
  const localMessages = getLocalMessages();
  const localGallery = getLocalGallery();
  const localServices = getLocalServices();
  const localTestimonials = getLocalTestimonials();
  const localFaqs = getLocalFaqs();

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
      recentBookings,
      recentMessages,
    ] = await Promise.all([
      Booking.countDocuments({ isDeleted: false }),
      Booking.countDocuments({ status: "pending", isDeleted: false }),
      ContactMessage.countDocuments({ status: "unread", isDeleted: false }),
      ContactMessage.countDocuments({ isDeleted: false }),
      GalleryImage.countDocuments({ isDeleted: false }),
      Service.countDocuments({ isDeleted: false }),
      Testimonial.countDocuments({ isDeleted: false }),
      FAQ.countDocuments({ isDeleted: false }),
      Booking.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(5).lean(),
      ContactMessage.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const formattedBookings: ActivityItem[] = recentBookings.map((b: any) => ({
      id: b._id.toString(),
      type: "booking",
      title: `Booking Request: ${b.customerName}`,
      subtitle: `${b.service} - ${b.phone}`,
      date: new Date(b.createdAt),
      status: b.status,
      link: "/admin/bookings",
    }));

    const formattedMessages: ActivityItem[] = recentMessages.map((m: any) => ({
      id: m._id.toString(),
      type: "message",
      title: `Contact Inquiry: ${m.name}`,
      subtitle: m.message,
      date: new Date(m.createdAt),
      status: m.status,
      link: "/admin/messages",
    }));

    const recentActivity = [...formattedBookings, ...formattedMessages]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);

    return {
      stats: {
        totalBookings: Math.max(totalBookings, localBookings.length),
        pendingBookings: Math.max(pendingBookings, localBookings.filter((b) => b.status === "pending").length),
        unreadMessages: Math.max(unreadMessages, localMessages.filter((m) => m.status === "unread").length),
        totalMessages: Math.max(totalMessages, localMessages.length),
        galleryImages: Math.max(galleryImages, localGallery.length),
        totalServices: Math.max(totalServices, localServices.length),
        totalTestimonials: Math.max(totalTestimonials, localTestimonials.length),
        totalFaqs: Math.max(totalFaqs, localFaqs.length),
      },
      recentActivity,
    };
  } catch (err) {
    console.warn("[DASHBOARD_STATS_OFFLINE] Using local persistent store stats:", err);

    const formattedBookings: ActivityItem[] = localBookings.slice(0, 5).map((b) => ({
      id: b._id,
      type: "booking",
      title: `Booking Request: ${b.customerName}`,
      subtitle: `${b.service} - ${b.phone}`,
      date: new Date(b.createdAt || Date.now()),
      status: b.status,
      link: "/admin/bookings",
    }));

    const formattedMessages: ActivityItem[] = localMessages.slice(0, 5).map((m) => ({
      id: m._id,
      type: "message",
      title: `Contact Inquiry: ${m.name}`,
      subtitle: m.message,
      date: new Date(m.createdAt || Date.now()),
      status: m.status,
      link: "/admin/messages",
    }));

    const recentActivity = [...formattedBookings, ...formattedMessages]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);

    return {
      stats: {
        totalBookings: localBookings.length,
        pendingBookings: localBookings.filter((b) => b.status === "pending").length,
        unreadMessages: localMessages.filter((m) => m.status === "unread").length,
        totalMessages: localMessages.length,
        galleryImages: localGallery.length,
        totalServices: localServices.length,
        totalTestimonials: localTestimonials.length,
        totalFaqs: localFaqs.length,
      },
      recentActivity,
    };
  }
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const { stats, recentActivity } = await getDashboardData();

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

      {/* Recent Activity Feed */}
      <Card className="border-border shadow-sm">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Activity size={18} />
              </div>
              <div>
                <CardTitle className="text-lg font-heading font-bold text-foreground">Recent Activity Feed</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Latest 5 client bookings & inquiry messages</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-border/60">
          {recentActivity.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No recent activity recorded yet. New bookings and contact form messages will appear here.
            </div>
          ) : (
            recentActivity.map((item) => (
              <div key={`${item.type}-${item.id}`} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full mt-0.5 ${item.type === "booking" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60" : "bg-blue-100 text-blue-700 dark:bg-blue-950/60"}`}>
                    {item.type === "booking" ? <UserCheck size={16} /> : <Mail size={16} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 max-w-md">{item.subtitle}</p>
                    <span className="text-[11px] text-muted-foreground/80 mt-1 block">
                      {item.date.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    item.status === "pending" || item.status === "unread"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                  }`}>
                    {item.status}
                  </span>
                  <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
                    <Link href={item.link}>
                      View <ArrowRight size={12} />
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
