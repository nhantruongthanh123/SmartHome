// app/(app)/layout.tsx
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50/50">
      {/* 1. Sidebar bên trái - Chiếm chiều cao toàn màn hình */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 2. Topbar bên trên - Chứa Search và Profile */}
        <Topbar />

        {/* 3. Nội dung trang chính */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
