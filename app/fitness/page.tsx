import Sidebar from "@/components/layout/Sidebar";
import FitnessTracker from "@/components/fitness/FitnessTracker";

export default function FitnessPage() {
  return (
    <main className="min-h-screen bg-[#F7F7FB] text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 py-10">
          <FitnessTracker />
        </div>
      </div>
    </main>
  );
}
