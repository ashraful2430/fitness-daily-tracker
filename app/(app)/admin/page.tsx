import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUserId } from "@/lib/auth";
import User from "@/models/Users";

export default async function AdminPage() {
  await connectDB();

  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/auth");
  }

  const user = await User.findById(userId).select("-password");

  if (!user || user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <section className="p-6 lg:p-10">
      <h1 className="text-4xl font-black">Admin Panel</h1>
      <p className="mt-3 text-slate-600">
        View users, activity, progress, and platform analytics.
      </p>
    </section>
  );
}
