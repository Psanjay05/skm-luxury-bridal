import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectToDatabase from "./db";
import Admin from "../models/Admin";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          await connectToDatabase();

          const admin = await Admin.findOne({ username: credentials.username });

          if (admin) {
            const isPasswordValid = await bcrypt.compare(
              credentials.password as string,
              admin.password
            );

            if (isPasswordValid) {
              return {
                id: admin._id.toString(),
                name: admin.name,
                username: admin.username,
              };
            }
          }
        } catch (dbErr) {
          console.error("[AUTH_DB_ERROR]", dbErr);
        }

        // SKM-006 FIX: Only allow env-var credential fallback in non-production environments.
        // This lets developers log in without a seeded DB in dev/staging,
        // but NEVER allows hardcoded credentials to work in production.
        // In production, the MongoDB Admin record is the ONLY valid credential.
        const isProduction = process.env.NODE_ENV === "production";
        if (!isProduction) {
          const defaultAdminUser = process.env.ADMIN_DEFAULT_USERNAME || process.env.ADMIN_USERNAME;
          const defaultAdminPass = process.env.ADMIN_DEFAULT_PASSWORD || process.env.ADMIN_PASSWORD;

          if (
            defaultAdminUser &&
            defaultAdminPass &&
            credentials.username === defaultAdminUser &&
            credentials.password === defaultAdminPass
          ) {
            return {
              id: "default-admin-id",
              name: "Maha Shree",
              username: defaultAdminUser,
            };
          }
        }

        return null;

      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const customUser = user as { id?: string; username?: string };
        token.username = customUser.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const customSessionUser = session.user as { id?: string; username?: string; name?: string | null };
        customSessionUser.id = token.id as string;
        customSessionUser.username = token.username as string;
      }
      return session;
    },
  },
  // P0 FIX: Never fall back to a hardcoded string as the JWT signing secret.
  // If AUTH_SECRET is not set, throw at startup so the misconfiguration is visible immediately.
  // A hardcoded fallback means anyone with the source code can forge JWT sessions.
  secret: (() => {
    const s = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    if (!s) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("[AUTH] AUTH_SECRET environment variable is required in production. Set it in Vercel environment variables.");
      }
      // Dev-only fallback to avoid blocking local startup; a warning is logged
      console.warn("[AUTH] WARNING: AUTH_SECRET not set. Using insecure dev fallback. NEVER deploy this to production.");
      return "dev-only-insecure-fallback-not-for-production";
    }
    return s;
  })(),
});
