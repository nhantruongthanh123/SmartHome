import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

type AppLayoutProps = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <Sidebar />
      <section className="content-area">
        <Topbar />
        <main className="page-content">{children}</main>
      </section>
    </div>
  );
}
