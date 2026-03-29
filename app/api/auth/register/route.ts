import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma"; // Nơi chứa kết nối đến Aiven MySQL của tụi mình
import bcrypt from "bcryptjs"; // Thư viện dùng để băm mật khẩu

// Hàm POST: Vì form đăng ký sẽ gửi dữ liệu ngầm lên server (không phải dạng lấy dữ liệu như GET)
export async function POST(request: Request) {
  try {
    // 1. Mở gói hàng người dùng gửi lên để lấy Email và Mật khẩu
    const body = await request.json();
    const { email, password } = body;

    // 2. Kiểm tra gắt gao: Bắt buộc phải có đủ cả hai
    if (!email || !password) {
      return NextResponse.json(
        { message: "Please enter both email and password" }, 
        { status: 400 } // Lỗi 400: Bad Request (Yêu cầu gửi lên bị thiếu)
      );
    }

    // 3. Mở sổ (Database) ra dò xem Email này có ai xài chưa
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "This email has already been registered. Please use a different email!" }, 
        { status: 409 } // Lỗi 409: Conflict (Dữ liệu bị trùng lặp)
      );
    }

    // 4. Nếu Email hợp lệ -> Tiến hành "băm" mật khẩu (với độ phức tạp là 10 vòng)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Cất thông tin người dùng mới vào nhà kho MySQL
    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword, // Lưu mật khẩu đã băm, TUYỆT ĐỐI KHÔNG lưu mật khẩu gốc
      }
    });

    console.log("New user registered:", newUser);

    // 6. Trả về thông báo thành công cho giao diện bên ngoài
    return NextResponse.json(
      { message: "Registration successful!", email}, 
      { status: 201 } // Mã 201: Created (Đã tạo thành công)
    );

  } catch (error) {
    console.error("System error during registration:", error);
    return NextResponse.json(
      { message: "An error occurred on the server." }, 
      { status: 500 } // Lỗi 500: Internal Server Error (Lỗi máy chủ)
    );
  }
}