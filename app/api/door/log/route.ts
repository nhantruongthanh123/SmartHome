import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const logs = await prisma.doorLog.findMany({
      where: { userId: session.user.id },
      orderBy: { openedAt: "desc" },
      take: 10,
    });
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching door logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action } = await req.json();
    const userId = session.user.id;

    if (action === "OPEN") {
      // 1. Kiểm tra xem có log nào đang "IN PROGRESS" (chưa đóng) không
      const existingOpenLog = await prisma.doorLog.findFirst({
        where: {
          userId,
          closedAt: null,
        },
      });

      // 2. CHỐT CHẶN: Nếu cửa đang mở rồi, bỏ qua không tạo thêm dòng mới
      if (existingOpenLog) {
        return NextResponse.json({ message: "Ignored: Door is already open" }, { status: 200 });
      }

      // 3. Nếu an toàn (chưa có cửa nào đang mở), tiến hành tạo mới
      const log = await prisma.doorLog.create({
        data: {
          userId,
          openedAt: new Date(),
        },
      });
      return NextResponse.json(log);
    }

    if (action === "CLOSE") {
      // Find the latest open log entry for this user
      const latestLog = await prisma.doorLog.findFirst({
        where: {
          userId,
          closedAt: null,
        },
        orderBy: {
          openedAt: "desc",
        },
      });

      if (!latestLog) {
        return NextResponse.json({ message: "No open log found to close" }, { status: 200 });
      }

      const closedAt = new Date();
      const duration = Math.floor((closedAt.getTime() - latestLog.openedAt.getTime()) / 1000);

      const updatedLog = await prisma.doorLog.update({
        where: { id: latestLog.id },
        data: {
          closedAt,
          duration,
        },
      });

      return NextResponse.json(updatedLog);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error logging door event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
