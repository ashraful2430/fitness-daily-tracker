import dynamic from "next/dynamic";
import RouteLoading from "@/components/ui/RouteLoading";

const FitnessTracker = dynamic(
  () => import("@/components/fitness/FitnessTracker"),
  {
    loading: () => <RouteLoading label="Loading fitness tracker" />,
  },
);

export default function FitnessPage() {
  return (
    <div className="py-10">
      <FitnessTracker />
    </div>
  );
}
