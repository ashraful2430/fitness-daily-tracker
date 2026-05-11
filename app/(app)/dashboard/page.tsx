import dynamic from "next/dynamic";
import RouteLoading from "@/components/ui/RouteLoading";

const Dashboard = dynamic(() => import("@/components/dashboard/Dashboard"), {
  loading: () => <RouteLoading label="Loading dashboard" />,
});

export default function DashboardPage() {
  return <Dashboard />;
}
