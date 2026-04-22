import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/feature/auth/lib/auth";
import { prisma } from "@/libs/prisma";
import { isSuperAdmin } from "@/libs/rbac";
import { hash } from "bcryptjs";

// GET - Get all users across all tenants (Super Admin only)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !isSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized - Super Admin only" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    const onlineOnly = searchParams.get('onlineOnly') === 'true';

    const where: { tenantId?: string; isOnline?: boolean } = {};
    
    if (tenantId) {
      where.tenantId = tenantId;
    }
    
    if (onlineOnly) {
      where.isOnline = true;
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            plan: true,
          }
        }
      },
      orderBy: { lastLogin: 'desc' }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a user in any tenant (Super Admin only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !isSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized - Super Admin only" }, { status: 401 });
    }

    const { email, name, password, role, tenantId } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Email, password, and role are required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        password: hashedPassword,
        role,
        status: 'Active',
        tenantId: tenantId || null,
      },
      include: {
        tenant: true
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Update any user (Super Admin only)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !isSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized - Super Admin only" }, { status: 401 });
    }

    const { id, name, role, status, tenantId, isOnline } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(role !== undefined && { role }),
        ...(status !== undefined && { status }),
        ...(tenantId !== undefined && { tenantId }),
        ...(isOnline !== undefined && { isOnline }),
      },
      include: {
        tenant: true
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete any user (Super Admin only)
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !isSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized - Super Admin only" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Prevent deleting yourself
    if (id === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
