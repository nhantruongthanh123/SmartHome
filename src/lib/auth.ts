import NextAuth, { type DefaultSession } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "./prisma"
import bcrypt from "bcryptjs"
import { type JWT } from "next-auth/jwt"

// Augment NextAuth types to include 'id'
declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  // 1. Kết nối với Aiven MySQL thông qua Prisma
  adapter: PrismaAdapter(prisma),

  // 2. Ép buộc lưu phiên đăng nhập bằng JWT (Bắt buộc khi dùng Credentials)
  session: {
    strategy: "jwt",
    maxAge: 1 * 24 * 60 * 60,
  },

  providers: [
    // --- PHƯƠNG THỨC 1: ĐĂNG NHẬP GOOGLE ---
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      // Tính năng: Tự động gộp tài khoản nếu người dùng đã có email trong database
      allowDangerousEmailAccountLinking: true,
    }),

    // --- PHƯƠNG THỨC 2: ĐĂNG NHẬP EMAIL & MẬT KHẨU ---
    Credentials({
      name: "Tài khoản của bạn",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" }
      },
      // Hàm này chạy ngầm khi người dùng bấm nút Submit trên form Login
      async authorize(credentials) {
        // Bước A: Kiểm tra xem người dùng có nhập đủ thông tin không
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password");
        }

        // Bước B: Tìm người dùng trong Database dựa vào Email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        // Bước C: Chặn những tài khoản tạo bằng Google (không có mật khẩu)
        if (!user || !user.password) {
          throw new Error("Account does not exist or you are using Google to log in.")
        }

        // Bước D: So sánh mật khẩu người dùng nhập vào với cục hash trong Database
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        // Nếu mật khẩu sai
        if (!isPasswordValid) {
          throw new Error("Invalid password!")
        }

        // Nếu mọi thứ hoàn hảo, trả về thông tin user cho NextAuth tạo phiên đăng nhập
        return user
      }
    })
  ],
  pages: {
    // Trỏ NextAuth về trang giao diện mà bạn tự thiết kế
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Khi đăng nhập lần đầu, copy thông tin user vào token
      if (user) {
        token.id = user.id
        token.name = user.name
        token.image = user.image
      }

      // Khi client gọi update(), cập nhật token với dữ liệu mới
      if (trigger === "update" && session) {
        token.name = session.name || token.name
        token.image = session.image || token.image
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // Ưu tiên token.id, fallback về token.sub (mặc định của NextAuth)
        session.user.id = (token.id || token.sub) as string
        session.user.name = token.name as string
        session.user.image = token.image as string
      }
      return session
    }
  }
})