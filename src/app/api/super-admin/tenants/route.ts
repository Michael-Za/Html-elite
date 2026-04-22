import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/feature/auth/lib/auth";
import { prisma } from "@/libs/prisma";
import { isSuperAdmin } from "@/libs/rbac";

// GET - Get all tenants (Super Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !isSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized - Super Admin only" }, { status: 401 });
    }

    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            deals: true,
            customers: true,
            companies: true,
            meetings: true,
            prospects: true,
          }
        },
        users: {
          where: {
            isOnline: true,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(tenants);
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a new tenant (Super Admin only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !isSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized - Super Admin only" }, { status: 401 });
    }

    const { name, slug, plan, maxUsers } = await req.json();

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    // Check if slug already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug }
    });

    if (existingTenant) {
      return NextResponse.json({ error: "A tenant with this slug already exists" }, { status: 400 });
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        plan: plan || 'free',
        maxUsers: maxUsers || 5,
        active: true,
      }
    });

    return NextResponse.json({ success: true, tenant });
  } catch (error) {
    console.error("Error creating tenant:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Update tenant (Super Admin only)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !isSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized - Super Admin only" }, { status: 401 });
    }

    const { id, name, plan, maxUsers, active } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 });
    }

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(plan && { plan }),
        ...(maxUsers !== undefined && { maxUsers }),
        ...(active !== undefined && { active }),
      }
    });

    return NextResponse.json({ success: true, tenant });
  } catch (error) {
    console.error("Error updating tenant:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
