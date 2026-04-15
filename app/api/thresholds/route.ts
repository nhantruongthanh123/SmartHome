import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";

// GET: Lấy tất cả các ngưỡng của user hiện tại
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    console.error("[GET /api/thresholds] Unauthorized: No user ID in session", session);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const thresholds = await prisma.threshold.findMany({
      where: { userId: session.user.id }
    });
    return NextResponse.json(thresholds);
  } catch (error) {
    console.error("Error fetching thresholds:", error);
    return NextResponse.json({ error: "Failed to fetch thresholds" }, { status: 500 });
  }
}

// POST: Cập nhật hoặc tạo mới ngưỡng cho user hiện tại
export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    console.error("[POST /api/thresholds] Unauthorized: No user ID in session", session);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { deviceType, minVal, maxVal, isActive } = await req.json();

    if (!deviceType) {
      return NextResponse.json({ error: "deviceType is required" }, { status: 400 });
    }

    const userId = session.user.id;

    const threshold = await prisma.threshold.upsert({
      where: {
        userId_deviceType: {
          userId,
          deviceType
        }
      },
      update: {
        minVal: minVal !== undefined ? parseFloat(minVal) : undefined,
        maxVal: maxVal !== undefined ? parseFloat(maxVal) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
      create: {
        userId,
        deviceType,
        minVal: minVal !== undefined ? parseFloat(minVal) : 0,
        maxVal: maxVal !== undefined ? parseFloat(maxVal) : 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(threshold);
  } catch (error) {
    console.error("Error updating threshold:", error);
    return NextResponse.json({ error: "Failed to update threshold" }, { status: 500 });
  }
}
