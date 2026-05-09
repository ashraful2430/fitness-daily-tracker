import dynamic from "next/dynamic";
import RouteLoading from "@/components/ui/RouteLoading";

const MoneyDashboard = dynamic(
  () => import("@/components/money/MoneyDashboard"),
  {
    loading: () => <RouteLoading label="Loading money dashboard" />,
  },
);

export default function MoneyPage() {
  return <MoneyDashboard />;
}
