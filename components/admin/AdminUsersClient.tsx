"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Loader2, Search, Shield, ShieldOff, UserRoundCog } from "lucide-react";
import PremiumModal from "@/components/ui/PremiumModal";
import { adminAPI, ApiError } from "@/lib/api";
import type { AdminUserListItem, UserRole } from "@/types/admin";

function formatDate(value: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const PAGE_SIZE = 20;

export default function AdminUsersClient() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [roleModal, setRoleModal] = useState<{ user: AdminUserListItem; role: UserRole } | null>(null);
  const [blockModal, setBlockModal] = useState<{ user: AdminUserListItem; isBlocked: boolean } | null>(null);
  const [blockReason, setBlockReason] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const usersQuery = useQuery({
    queryKey: ["admin", "users", page, search],
    queryFn: () => adminAPI.getUsers({ page, limit: PAGE_SIZE, search }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      adminAPI.updateUserRole(userId, role),
    onSuccess: () => {
      toast.success("Role updated");
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setRoleModal(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update role");
    },
  });

  const blockMutation = useMutation({
    mutationFn: ({ userId, isBlocked, reason }: { userId: string; isBlocked: boolean; reason?: string }) =>
      adminAPI.setUserBlockStatus(userId, isBlocked, reason),
    onSuccess: (_, vars) => {
      toast.success(vars.isBlocked ? "User blocked" : "User unblocked");
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setBlockModal(null);
      setBlockReason("");
    },
    onError: (error) => {
      if (error instanceof ApiError && error.field === "reason") {
        toast.error(error.message);
        return;
      }
      toast.error(error instanceof Error ? error.message : "Failed to update block status");
    },
  });

  const users = usersQuery.data?.data ?? [];
  const meta = usersQuery.data?.meta;

  const canSubmitBlock = useMemo(() => {
    if (!blockModal) return false;
    if (!blockModal.isBlocked) return true;
    return blockReason.trim().length > 0;
  }, [blockModal, blockReason]);

  return (
    <div className="space-y-5 px-4 py-5 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-[#121026]/90">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-500 dark:text-rose-300">Admin</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">User Management</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Search users, manage roles, and control account access.</p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email"
              className="w-full rounded-2xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-800 outline-none focus:border-rose-400 dark:border-white/20 dark:bg-[#0f0d1e] dark:text-slate-100"
            />
          </label>

          <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-white/20 dark:bg-white/5 dark:text-slate-300">
            {meta ? `${meta.total} users` : "..."}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-[#121026]/90 sm:p-5">
        {usersQuery.isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : usersQuery.isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            Failed to load users. <button onClick={() => void usersQuery.refetch()} className="underline">Retry</button>
          </div>
        ) : users.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm font-semibold text-slate-500 dark:border-white/20 dark:text-slate-400">No users found.</p>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <article key={user.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-base font-black text-slate-900 dark:text-white">{user.name}</p>
                    <p className="truncate text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-slate-300 px-2.5 py-1 font-bold text-slate-700 dark:border-white/20 dark:text-slate-200">Role: {user.role}</span>
                      <span className={`rounded-full border px-2.5 py-1 font-bold ${user.isBlocked ? "border-rose-300 text-rose-700 dark:border-rose-400/30 dark:text-rose-300" : "border-emerald-300 text-emerald-700 dark:border-emerald-400/30 dark:text-emerald-300"}`}>
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                      <span className="rounded-full border border-slate-300 px-2.5 py-1 font-bold text-slate-700 dark:border-white/20 dark:text-slate-200">Streak: {user.loginStreak}</span>
                      <span className="rounded-full border border-slate-300 px-2.5 py-1 font-bold text-slate-700 dark:border-white/20 dark:text-slate-200">Last login: {formatDate(user.lastLoginDate)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setRoleModal({ user, role: user.role === "admin" ? "user" : "admin" })}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-white/20 dark:text-slate-200"
                    >
                      <UserRoundCog className="h-3.5 w-3.5" />
                      {user.role === "admin" ? "Make User" : "Make Admin"}
                    </button>

                    <button
                      onClick={() => setBlockModal({ user, isBlocked: !user.isBlocked })}
                      className={`inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-bold transition ${user.isBlocked ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-400/30 dark:text-emerald-300" : "border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-400/30 dark:text-rose-300"}`}
                    >
                      {user.isBlocked ? <Shield className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}
                      {user.isBlocked ? "Unblock" : "Block"}
                    </button>

                    <Link href={`/admin/users/${user.id}`} className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900">
                      View Details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {meta ? (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Page {meta.page} of {meta.totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={meta.page <= 1}
                className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 disabled:opacity-50 dark:border-white/20 dark:text-slate-200"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((current) => Math.min(meta.totalPages, current + 1))}
                disabled={meta.page >= meta.totalPages}
                className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 disabled:opacity-50 dark:border-white/20 dark:text-slate-200"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <PremiumModal
        open={Boolean(roleModal)}
        title="Confirm Role Change"
        subtitle="Role Update"
        description={roleModal ? `Change ${roleModal.user.name} role to ${roleModal.role}?` : ""}
        onClose={() => setRoleModal(null)}
        footer={
          <>
            <button type="button" onClick={() => setRoleModal(null)} className="rounded-3xl border border-slate-700/80 bg-slate-950/80 px-5 py-3 text-sm font-semibold text-slate-200">Cancel</button>
            <button
              type="button"
              disabled={!roleModal || roleMutation.isPending}
              onClick={() => {
                if (!roleModal) return;
                roleMutation.mutate({ userId: roleModal.user.id, role: roleModal.role });
              }}
              className="rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {roleMutation.isPending ? "Updating..." : "Confirm"}
            </button>
          </>
        }
      />

      <PremiumModal
        open={Boolean(blockModal)}
        title={blockModal?.isBlocked ? "Block User" : "Unblock User"}
        subtitle="Access Control"
        description={
          blockModal
            ? blockModal.isBlocked
              ? `Block ${blockModal.user.name} from login and active session.`
              : `Unblock ${blockModal.user.name} account.`
            : ""
        }
        onClose={() => {
          setBlockModal(null);
          setBlockReason("");
        }}
        footer={
          <>
            <button type="button" onClick={() => { setBlockModal(null); setBlockReason(""); }} className="rounded-3xl border border-slate-700/80 bg-slate-950/80 px-5 py-3 text-sm font-semibold text-slate-200">Cancel</button>
            <button
              type="button"
              disabled={!blockModal || !canSubmitBlock || blockMutation.isPending}
              onClick={() => {
                if (!blockModal) return;
                blockMutation.mutate({
                  userId: blockModal.user.id,
                  isBlocked: blockModal.isBlocked,
                  reason: blockModal.isBlocked ? blockReason : undefined,
                });
              }}
              className="rounded-3xl bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {blockMutation.isPending ? "Saving..." : "Confirm"}
            </button>
          </>
        }
      >
        {blockModal?.isBlocked ? (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Block reason</label>
            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-rose-400 dark:border-white/20 dark:bg-[#0f0d1e] dark:text-slate-100"
              placeholder="Write reason shown to user"
            />
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-300">This user will be able to login again immediately.</p>
        )}
      </PremiumModal>
    </div>
  );
}
