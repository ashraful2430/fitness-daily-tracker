import dynamic from "next/dynamic";
import RouteLoading from "@/components/ui/RouteLoading";

const LearningHub = dynamic(() => import("@/components/learning/LearningHub"), {
  loading: () => <RouteLoading label="Loading learning hub" />,
});

export default function LearningPage() {
  return <LearningHub />;
}
