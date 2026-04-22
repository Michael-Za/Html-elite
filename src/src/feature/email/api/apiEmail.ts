import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/feature/auth/lib/auth";
import { prisma } from "@/libs/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get email settings for the current user within the tenant
    const emailSettings = await prisma.emailSettings.findFirst({
      where: { 
        userId: session.user.id,
        tenantId: session.user.tenantId 
      }
    });

    if (!emailSettings) {
      return NextResponse.json({ settings: null });
    }

    return NextResponse.json({
      settings: {
        host: emailSettings.host,
        port: emailSettings.port,
        sender: emailSettings.sender,
        username: emailSettings.username,
        password: emailSettings.password,
      }
    });
  } catch (error) {
    console.error('Error loading email settings:', error);
    return NextResponse.json({ error: 'Failed to load email settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { host, port, sender, username, password } = body;

    if (!host || !port || !sender || !username || !password) {
      return NextResponse.json(
        { error: 'All email settings are required' },
        { status: 400 }
      );
    }

    // Check if email settings already exist for this user in this tenant
    const existingSettings = await prisma.emailSettings.findFirst({
      where: { 
        userId: session.user.id,
        tenantId: session.user.tenantId 
      }
    });

    let emailSettings;
    if (existingSettings) {
      // Update existing settings
      emailSettings = await prisma.emailSettings.update({
        where: { id: existingSettings.id },
        data: {
          host,
          port,
          sender,
          username,
          password,
        }
      });
    } else {
      // Create new settings with tenantId
      emailSettings = await prisma.emailSettings.create({
        data: {
          host,
          port,
          sender,
          username,
          password,
          userId: session.user.id,
          tenantId: session.user.tenantId,
        }
      });
    }

    return NextResponse.json({
      message: 'Email settings saved successfully',
      settings: emailSettings
    }, { status: 200 });
  } catch (error) {
    console.error('Error saving email settings:', error);
    return NextResponse.json({ error: 'Failed to save email settings' }, { status: 500 });
  }
}
