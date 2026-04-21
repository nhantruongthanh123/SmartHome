import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { SmartHomeProvider } from "@/src/contexts/SmartHomeContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmartHomeProvider>
      <div className="app-layout-shell flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="app-main-content flex-1 overflow-x-hidden overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SmartHomeProvider>
  );
}
