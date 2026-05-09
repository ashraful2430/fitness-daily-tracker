import dynamic from "next/dynamic";
import RouteLoading from "@/components/ui/RouteLoading";

const AuthForm = dynamic(() => import("@/components/auth/AuthForm"), {
  loading: () => <RouteLoading label="Loading auth" />,
});

export default function AuthPage() {
  return <AuthForm />;
}
