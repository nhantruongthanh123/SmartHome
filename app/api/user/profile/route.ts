import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Lấy phiên đăng nhập hiện tại
    const session = await auth();

    // 2. Nếu chưa đăng nhập, chặn lại ngay
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 401 });
    }

    // 3. Dùng Email từ session để tìm người dùng trong Database
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      // Chỉ lấy những trường cần thiết để bảo mật (tuyệt đối không lấy password)
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!currentUser) {
      return NextResponse.json({ message: "Không tìm thấy người dùng" }, { status: 404 });
    }

    // 4. Trả dữ liệu về cho giao diện
    return NextResponse.json(currentUser, { status: 200 });

  } catch (error) {
    console.error("Lỗi khi lấy thông tin user:", error);
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1. Nhận dữ liệu dưới dạng FormData
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const imageFile = formData.get("image") as File | null;

    let finalImageUrl = session.user.image || "";

    // 2. Nếu có file ảnh mới, Backend sẽ đứng ra upload lên ImgBB
    if (imageFile && imageFile.size > 0) {
      const imgbbFormData = new FormData();
      imgbbFormData.append("image", imageFile);

      const imgbbRes = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
        {
          method: "POST",
          body: imgbbFormData,
        }
      );

      const imgbbData = await imgbbRes.json();
      if (imgbbData.success) {
        finalImageUrl = imgbbData.data.url;
      } else {
        throw new Error("ImgBB upload failed from Server");
      }
    }

    // 3. Cập nhật Database
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name,
        image: finalImageUrl,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}