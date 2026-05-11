import dynamic from "next/dynamic";
import RouteLoading from "@/components/ui/RouteLoading";

const LendingDashboard = dynamic(
  () => import("@/components/lending/LendingDashboard"),
  {
    loading: () => <RouteLoading label="Loading lending dashboard" />,
  },
);

export default function LendingPage() {
  return <LendingDashboard />;
}
