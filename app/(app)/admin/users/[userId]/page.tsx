import dynamic from "next/dynamic";
import RouteLoading from "@/components/ui/RouteLoading";

const AdminUserSummaryClient = dynamic(
  () => import("@/components/admin/AdminUserSummaryClient"),
  {
    loading: () => <RouteLoading label="Loading user summary" />,
  },
);

export default async function AdminUserDetailsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <AdminUserSummaryClient userId={userId} />;
}
