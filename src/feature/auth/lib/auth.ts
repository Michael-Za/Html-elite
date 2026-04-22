import { prisma } from "@/libs/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { compare } from "bcryptjs"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                slug: true,
                plan: true,
                active: true,
              }
            }
          }
        })
        if (!user) {
          throw new Error('No account found with this email address')
        }

        if (!user.password) {
          throw new Error('Please contact support - account setup incomplete')
        }
    
        // Block login if user is Deleted
        if (user.status === 'Deleted') {
          throw new Error('Your account is removed. Please contact your admin.')
        }

        // SUPER_ADMIN can login even if not Active
        if (user.role !== 'SUPER_ADMIN' && user.status !== 'Active') {
          throw new Error('Account is not active. Please check your email for the invitation.')
        }

        // Check if tenant is active (skip for SUPER_ADMIN without tenant)
        if (user.tenant && !user.tenant.active && user.role !== 'SUPER_ADMIN') {
          throw new Error('Your workspace has been suspended. Please contact support.')
        }

        const isValid = await compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error('Password is incorrect')
        }

        // Update lastLogin and set online status
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              lastLogin: new Date(),
              isOnline: true,
            },
          })
        } catch (e) {
          // non-blocking; if update fails, still allow login
        }

        return { 
          id: user.id, 
          email: user.email, 
          name: user.name,
          image: user.image,
          tenantId: user.tenantId || undefined,
          role: user.role,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.tenantId = user.tenantId;
        token.role = user.role;
        token.image = user.image;
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
        session.user.tenantId = token.tenantId as string | undefined;
        session.user.role = token.role as "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "VIEWER";
        session.user.image = token.image as string | undefined;
        
        // Fetch tenant info (skip for SUPER_ADMIN without tenant)
        if (token.tenantId) {
          try {
            const tenant = await prisma.tenant.findUnique({
              where: { id: token.tenantId as string },
              select: { id: true, name: true, slug: true, plan: true }
            });
            if (tenant) {
              session.user.tenant = tenant;
            }
          } catch (e) {
            // Non-blocking
          }
        }
      }
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      // Set user offline on sign out
      if (token?.id) {
        try {
          await prisma.user.update({
            where: { id: token.id as string },
            data: { isOnline: false },
          })
        } catch (e) {
          // Non-blocking
        }
      }
    },
  },
}
