import Sidebar from "@/components/layout/Sidebar";

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-[#F7F7FB] text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <section className="flex-1 p-6 lg:p-10">
          <h1 className="text-4xl font-black">Custom Categories</h1>
          <p className="mt-3 text-slate-600">
            Create custom categories for learning, work, fitness, money, or
            personal goals.
          </p>
        </section>
      </div>
    </main>
  );
}
