"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Lock, LogIn } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsPending(true);

    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
        callbackUrl: "/admin/dashboard",
      });

      if (res?.error) {
        setErrorMessage("Invalid username or password. Please try again.");
        setIsPending(false);
      } else if (res?.ok) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        setErrorMessage("Authentication failed. Please check your credentials.");
        setIsPending(false);
      }
    } catch (err) {
      console.error("[LOGIN_ERROR]", err);
      setErrorMessage("Unable to sign in. Please try again.");
      setIsPending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card className="border-border shadow-2xl bg-card/90 backdrop-blur-md">
        <CardHeader className="space-y-2 text-center pb-6 border-b border-border/50">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
            <Lock size={22} />
          </div>
          <CardTitle className="text-3xl font-heading font-bold text-primary">Admin Access</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to manage SKM Luxury Bridal Studio
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter admin username"
                className="bg-background/80 border-border focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="bg-background/80 border-border focus:ring-primary"
              />
            </div>

            {errorMessage && (
              <div className="text-sm text-destructive font-medium text-center bg-destructive/10 border border-destructive/20 p-2.5 rounded-md">
                {errorMessage}
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-2 pb-6">
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-semibold gap-2 py-5"
              disabled={isPending}
            >
              {isPending ? (
                "Authenticating..."
              ) : (
                <>
                  <LogIn size={16} /> Sign In to Dashboard
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}
