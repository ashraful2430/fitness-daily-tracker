import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUserId } from "@/lib/auth";
import User from "@/models/Users";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await connectDB();
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/auth");
  }

  const user = await User.findById(userId).select("role");

  if (!user || user.role !== "admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
