import dynamic from "next/dynamic";
import RouteLoading from "@/components/ui/RouteLoading";

const HabitTracker = dynamic(() => import("@/components/habits/Habits"), {
  loading: () => <RouteLoading label="Loading habits" />,
});

export default function HabitsPage() {
  return (
    <div className="py-10">
      <HabitTracker />
    </div>
  );
}
