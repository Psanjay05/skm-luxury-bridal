import { LoginForm } from "@/features/auth/components/LoginForm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Login | SKM Luxury Bridal Studio",
};

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" />
      <div className="absolute inset-0 bg-gradient-to-tr from-secondary/20 via-background to-primary/10" />
      
      <div className="relative z-10 w-full flex justify-center p-4">
        <LoginForm />
      </div>
    </div>
  );
}
