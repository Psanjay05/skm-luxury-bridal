"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Lock,
} from "lucide-react";

interface ProfileFormData {
  name: string;
  username: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, reset, watch } = useForm<ProfileFormData>({
    defaultValues: {
      name: "Maha Shree",
      username: "admin",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/admin/profile");
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          setValue("name", json.data.name || "Maha Shree");
          setValue("username", json.data.username || "admin");
        }
      } catch (err) {
        console.error("[LOAD_PROFILE_ERROR]", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    setStatusMessage(null);

    if (data.newPassword) {
      if (data.newPassword !== data.confirmPassword) {
        setStatusMessage({
          type: "error",
          text: "New passwords do not match. Please re-check.",
        });
        return;
      }
      if (!data.currentPassword) {
        setStatusMessage({
          type: "error",
          text: "Please enter your current password to set a new password.",
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, any> = {
        name: data.name,
        username: data.username,
      };
      if (data.newPassword) {
        payload.currentPassword = data.currentPassword;
        payload.newPassword = data.newPassword;
      }

      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setStatusMessage({
          type: "success",
          text: json.message || "Admin credentials updated successfully!",
        });
        setValue("currentPassword", "");
        setValue("newPassword", "");
        setValue("confirmPassword", "");
      } else {
        setStatusMessage({
          type: "error",
          text: json.error || "Failed to update profile.",
        });
      }
    } catch (err: any) {
      console.error("[SAVE_PROFILE_ERROR]", err);
      setStatusMessage({
        type: "error",
        text: "Network connection error. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Admin Profile & Security Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your login credentials, studio display name, and password recovery settings.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 text-sm font-medium border ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
              : "bg-destructive/10 border-destructive/20 text-destructive"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile & Password Form */}
        <div className="lg:col-span-7 bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <User size={16} /> 1. Admin Identity & Username
              </h2>

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold">Display Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Maha Shree"
                  className="bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-semibold">Login Username</Label>
                <Input
                  id="username"
                  {...register("username")}
                  placeholder="admin"
                  className="bg-background"
                />
                <p className="text-[11px] text-muted-foreground">
                  This username is used to log in at <code className="text-foreground">/admin/login</code>.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <KeyRound size={16} /> 2. Change Admin Password
              </h2>

              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-xs font-semibold">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...register("currentPassword")}
                  placeholder="Enter current password"
                  className="bg-background"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-xs font-semibold">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...register("newPassword")}
                    placeholder="Min. 6 characters"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-semibold">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...register("confirmPassword")}
                    placeholder="Re-enter new password"
                    className="bg-background"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-6 text-xs uppercase tracking-wider shadow-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving Changes..." : "Save Profile & Password"}
            </Button>
          </form>
        </div>

        {/* Right Column: Password Recovery & Forget Instructions Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <ShieldAlert size={16} /> Forgot Password? (Fail-Safe Recovery)
            </div>

            <h3 className="font-heading text-lg font-bold text-foreground">
              How Maha Shree Can Reset Her Password If Forgotten:
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              You are never locked out of your website. The platform includes a **100% fail-safe master recovery mechanism**:
            </p>

            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-xl bg-card border border-border space-y-1">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Lock size={13} className="text-primary" /> Method 1: Instant Reset via Vercel (Recommended)
                </h4>
                <ol className="text-[11px] text-muted-foreground space-y-1 list-decimal pl-4 pt-1">
                  <li>Log in to your <strong>Vercel Dashboard</strong>.</li>
                  <li>Go to <strong>Settings ➔ Environment Variables</strong>.</li>
                  <li>Update <code className="text-foreground font-mono">ADMIN_PASSWORD</code> with your new secret password.</li>
                  <li>Click <strong>Redeploy</strong> — Your new password takes effect immediately!</li>
                </ol>
              </div>

              <div className="p-3.5 rounded-xl bg-card border border-border space-y-1">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <HelpCircle size={13} className="text-primary" /> Method 2: Via Local .env
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  In your project root, edit <code className="text-foreground font-mono">.env.local</code> and change <code className="text-foreground font-mono">ADMIN_PASSWORD=&quot;YourNewPassword&quot;</code>.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60">
              <p className="text-[11px] text-muted-foreground">
                Need developer assistance? Contact your technical team or reference the <strong className="text-foreground">README.md</strong> deployment documentation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
