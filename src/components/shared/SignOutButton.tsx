"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="gap-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
    >
      <LogOut size={14} />
      <span className="hidden md:inline">Sign Out</span>
    </Button>
  );
}
