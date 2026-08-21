import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminTopBar } from "@/components/layout/AdminTopBar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-muted/30 flex flex-col md:flex-row">
      {/* Desktop collapsible fixed sidebar (hidden on mobile) */}
      <AdminSidebar />

      {/* Main dashboard content area */}
      <div className="flex-1 flex flex-col min-w-0 md:overflow-hidden">
        {/* Responsive top bar with mobile hamburger drawer trigger */}
        <AdminTopBar userName={session.user?.name ?? "Admin"} />

        {/* Page content: unified natural scroll on mobile, contained scroll on desktop */}
        <main className="flex-1 w-full p-4 sm:p-6 overflow-visible md:overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
