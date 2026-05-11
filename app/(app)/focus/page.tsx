import dynamic from "next/dynamic";
import RouteLoading from "@/components/ui/RouteLoading";

const PomodoroTimer = dynamic(
  () => import("@/components/pomodoro/PomodoroTimer"),
  {
    loading: () => <RouteLoading label="Loading focus timer" />,
  },
);

export default function FocusPage() {
  return (
    <div className="py-10">
      <PomodoroTimer />
    </div>
  );
}
