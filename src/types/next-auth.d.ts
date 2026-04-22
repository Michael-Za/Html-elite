import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tenantId?: string;
      role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "VIEWER";
      image?: string;
      tenant?: {
        id: string;
        name: string;
        slug: string;
        plan: string;
      };
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    tenantId?: string;
    role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "VIEWER";
    image?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    tenantId?: string;
    role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "VIEWER";
    image?: string;
  }
}
