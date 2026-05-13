import dynamic from "next/dynamic";
import RouteLoading from "@/components/ui/RouteLoading";

const AdminUsersClient = dynamic(() => import("@/components/admin/AdminUsersClient"), {
  loading: () => <RouteLoading label="Loading admin users" />,
});

export default function AdminUsersPage() {
  return <AdminUsersClient />;
}
