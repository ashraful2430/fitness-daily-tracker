import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/components/dashboard/Dashboard";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#F7F7FB] text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <Dashboard />
      </div>
    </main>
  );
}
