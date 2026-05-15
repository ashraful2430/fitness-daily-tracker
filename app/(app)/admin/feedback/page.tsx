import dynamic from "next/dynamic";
import RouteLoading from "@/components/ui/RouteLoading";

const AdminFeedbackEffectsClient = dynamic(
  () => import("@/components/admin/AdminFeedbackEffectsClient"),
  {
    loading: () => <RouteLoading label="Loading feedback effects" />,
  }
);

export default function AdminFeedbackPage() {
  return <AdminFeedbackEffectsClient />;
}
