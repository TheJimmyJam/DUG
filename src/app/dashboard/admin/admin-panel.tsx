"use client";

import { useState, useTransition, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  getAllUsersAction,
  addUserAction,
  deleteUserAction,
  updateUserAction,
  getAllJobsAction,
  deleteJobAction,
  updateJobAction,
  runDemoGeneratorAction,
} from "./actions";

// ---------------------------------------------------------------------------
// Types (inferred from server return shapes)
// ---------------------------------------------------------------------------
type UserRow = {
  id: string;
  handle: string;
  display_name: string;
  email: string;
  role: string;
  is_admin: boolean;
  is_verified: boolean;
  completed_job_count: number;
  rating: number;
  rating_count: number;
  created_at: string;
};

type JobRow = {
  id: string;
  title: string;
  summary: string;
  status: string;
  job_type: string;
  primary_specialty: string;
  difficulty: number;
  budget_cents: number | null;
  budget_type: string;
  estimated_hours: number | null;
  is_demo: boolean;
  created_at: string;
  poster: { id: string; handle: string; display_name: string } | null;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmt(cents: number | null) {
  if (cents == null) return "—";
  if (cents === 0) return "Volunteer";
  return `$${(cents / 100).toLocaleString()}`;
}

function ago(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  const days = Math.floor(d / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  claimed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  submitted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  completed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface AdminPanelProps {
  initialUsers: UserRow[];
  initialJobs: JobRow[];
}

// ===========================================================================
// Main component
// ===========================================================================
export function AdminPanel({ initialUsers, initialJobs }: AdminPanelProps) {
  const [tab, setTab] = useState<"users" | "jobs" | "demo">("users");
  const [users, setUsers] = useState<UserRow[]>(initialUsers as UserRow[]);
  const [jobs, setJobs] = useState<JobRow[]>(initialJobs as JobRow[]);

  // ---- refresh helpers ----
  const [pending, startTransition] = useTransition();

  const refreshUsers = useCallback(() => {
    startTransition(async () => {
      const fresh = await getAllUsersAction();
      setUsers(fresh as UserRow[]);
    });
  }, []);

  const refreshJobs = useCallback(() => {
    startTransition(async () => {
      const fresh = await getAllJobsAction();
      setJobs(fresh as JobRow[]);
    });
  }, []);

  // ---- stats ----
  const totalUsers = users.length;
  const totalJobs = jobs.length;
  const openJobs = jobs.filter((j) => j.status === "open").length;
  const demoJobs = jobs.filter((j) => j.is_demo).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-1 text-[var(--color-muted)]">
          Manage users, jobs, and demo data.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total users", value: totalUsers },
          { label: "Total jobs", value: totalJobs },
          { label: "Open jobs", value: openJobs },
          { label: "Demo jobs", value: demoJobs },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg border bg-[var(--color-card)] p-4"
          >
            <div className="text-2xl font-semibold">{s.value}</div>
            <div className="mt-0.5 text-xs text-[var(--color-muted)]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b">
        {(["users", "jobs", "demo"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-fg)]"
            }`}
          >
            {t === "demo" ? "Demo Generator" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "users" && (
        <UsersTab
          users={users}
          onRefresh={refreshUsers}
          refreshing={pending}
        />
      )}
      {tab === "jobs" && (
        <JobsTab
          jobs={jobs}
          onRefresh={refreshJobs}
          refreshing={pending}
        />
      )}
      {tab === "demo" && (
        <DemoTab onRefreshAll={() => { refreshUsers(); refreshJobs(); }} />
      )}
    </div>
  );
}

// ===========================================================================
// USERS TAB
// ===========================================================================
function UsersTab({
  users,
  onRefresh,
  refreshing,
}: {
  users: UserRow[];
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = users.filter(
    (u) =>
      u.display_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.handle.toLowerCase().includes(search.toLowerCase())
  );

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await addUserAction(fd);
      if (res.error) {
        setMsg({ type: "err", text: res.error });
      } else {
        setMsg({ type: "ok", text: "User added." });
        setShowAdd(false);
        onRefresh();
      }
    });
  }

  function handleDelete(userId: string, name: string) {
    if (!confirm(`Delete user "${name}"? This is permanent.`)) return;
    startTransition(async () => {
      const res = await deleteUserAction(userId);
      if (res.error) setMsg({ type: "err", text: res.error });
      else { setMsg({ type: "ok", text: "User deleted." }); onRefresh(); }
    });
  }

  function handleToggleAdmin(u: UserRow) {
    startTransition(async () => {
      const res = await updateUserAction(u.id, { is_admin: !u.is_admin });
      if (res.error) setMsg({ type: "err", text: res.error });
      else onRefresh();
    });
  }

  function handleToggleVerified(u: UserRow) {
    startTransition(async () => {
      const res = await updateUserAction(u.id, { is_verified: !u.is_verified });
      if (res.error) setMsg({ type: "err", text: res.error });
      else onRefresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAdd(!showAdd)}
        >
          {showAdd ? "Cancel" : "+ Add user"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </Button>
        <span className="ml-auto text-sm text-[var(--color-muted)]">
          {filtered.length} of {users.length} users
        </span>
      </div>

      {/* Feedback */}
      {msg && (
        <div
          className={`rounded-md px-3 py-2 text-sm ${
            msg.type === "ok"
              ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
              : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
          }`}
        >
          {msg.text}{" "}
          <button className="underline" onClick={() => setMsg(null)}>
            dismiss
          </button>
        </div>
      )}

      {/* Add user form */}
      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="rounded-lg border bg-[var(--color-card)] p-4 space-y-3"
        >
          <h3 className="font-semibold">Add new user</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-[var(--color-muted)]">
                Email *
              </label>
              <Input name="email" type="email" required placeholder="name@example.com" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--color-muted)]">
                Display name *
              </label>
              <Input name="display_name" required placeholder="Full name" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--color-muted)]">
                Role
              </label>
              <select
                name="role"
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
              >
                <option value="underwriter">Underwriter</option>
                <option value="poster">Poster</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--color-muted)]">
                Temp password
              </label>
              <Input
                name="password"
                type="text"
                placeholder="TempPass2026! (default)"
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_admin" name="is_admin" value="true" />
              <label htmlFor="is_admin" className="text-sm">
                Admin
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="sm" disabled={pending}>
              {pending ? "Creating…" : "Create user"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdd(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Users table */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-card)] border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)]">
                User
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)] hidden md:table-cell">
                Email
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)]">
                Role
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)] hidden lg:table-cell">
                Jobs
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)] hidden lg:table-cell">
                Joined
              </th>
              <th className="px-4 py-3 text-right font-medium text-[var(--color-muted)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-[var(--color-muted)]"
                >
                  No users found.
                </td>
              </tr>
            )}
            {filtered.map((u) => (
              <tr
                key={u.id}
                className="hover:bg-[var(--color-card)] transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="font-medium">{u.display_name}</div>
                  <div className="text-xs text-[var(--color-muted)]">
                    @{u.handle}
                    {u.is_admin && (
                      <span className="ml-1 rounded bg-amber-100 px-1 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        admin
                      </span>
                    )}
                    {u.is_verified && (
                      <span className="ml-1 rounded bg-green-100 px-1 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        verified
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--color-muted)] hidden md:table-cell">
                  {u.email || "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="capitalize">{u.role}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {u.completed_job_count}
                </td>
                <td className="px-4 py-3 text-[var(--color-muted)] hidden lg:table-cell">
                  {ago(u.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleToggleVerified(u)}
                      disabled={pending}
                      className="rounded px-2 py-1 text-xs hover:bg-[var(--color-border)] transition-colors"
                      title={u.is_verified ? "Remove verified" : "Mark verified"}
                    >
                      {u.is_verified ? "✓ Verified" : "Verify"}
                    </button>
                    <button
                      onClick={() => handleToggleAdmin(u)}
                      disabled={pending}
                      className="rounded px-2 py-1 text-xs hover:bg-[var(--color-border)] transition-colors"
                      title={u.is_admin ? "Remove admin" : "Make admin"}
                    >
                      {u.is_admin ? "Admin ✓" : "+ Admin"}
                    </button>
                    <button
                      onClick={() => handleDelete(u.id, u.display_name)}
                      disabled={pending}
                      className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===========================================================================
// JOBS TAB
// ===========================================================================
function JobsTab({
  jobs,
  onRefresh,
  refreshing,
}: {
  jobs: JobRow[];
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<JobRow>>({});
  const [pending, startTransition] = useTransition();

  const filtered = jobs.filter((j) => {
    const matchSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.primary_specialty.toLowerCase().includes(search.toLowerCase()) ||
      j.poster?.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      false;
    const matchStatus = filterStatus === "all" || j.status === filterStatus;
    return matchSearch && matchStatus;
  });

  function startEdit(j: JobRow) {
    setEditId(j.id);
    setEditData({
      title: j.title,
      summary: j.summary,
      status: j.status,
      difficulty: j.difficulty,
      budget_cents: j.budget_cents,
      budget_type: j.budget_type,
      estimated_hours: j.estimated_hours,
    });
  }

  function handleDelete(jobId: string, title: string) {
    if (!confirm(`Delete job "${title}"? This is permanent.`)) return;
    startTransition(async () => {
      const res = await deleteJobAction(jobId);
      if (res.error) setMsg({ type: "err", text: res.error });
      else { setMsg({ type: "ok", text: "Job deleted." }); onRefresh(); }
    });
  }

  function handleSaveEdit() {
    if (!editId) return;
    startTransition(async () => {
      const res = await updateJobAction(editId, {
        title: editData.title,
        summary: editData.summary,
        status: editData.status as "open" | "claimed" | "submitted" | "completed" | "cancelled" | undefined,
        difficulty: editData.difficulty,
        budget_cents: editData.budget_cents,
        budget_type: editData.budget_type as "hourly" | "flat" | "volunteer" | undefined,
        estimated_hours: editData.estimated_hours,
      });
      if (res.error) setMsg({ type: "err", text: res.error });
      else {
        setMsg({ type: "ok", text: "Job updated." });
        setEditId(null);
        onRefresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search jobs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="claimed">Claimed</option>
          <option value="submitted">Submitted</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <Button variant="ghost" size="sm" onClick={onRefresh} disabled={refreshing}>
          {refreshing ? "Refreshing…" : "Refresh"}
        </Button>
        <span className="ml-auto text-sm text-[var(--color-muted)]">
          {filtered.length} of {jobs.length} jobs
        </span>
      </div>

      {/* Feedback */}
      {msg && (
        <div
          className={`rounded-md px-3 py-2 text-sm ${
            msg.type === "ok"
              ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
              : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
          }`}
        >
          {msg.text}{" "}
          <button className="underline" onClick={() => setMsg(null)}>
            dismiss
          </button>
        </div>
      )}

      {/* Edit modal */}
      {editId && (
        <div className="rounded-lg border bg-[var(--color-card)] p-4 space-y-3">
          <h3 className="font-semibold">Edit job</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-[var(--color-muted)]">Title</label>
              <Input
                value={editData.title ?? ""}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-[var(--color-muted)]">Summary</label>
              <textarea
                value={editData.summary ?? ""}
                onChange={(e) => setEditData({ ...editData, summary: e.target.value })}
                rows={2}
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--color-muted)]">Status</label>
              <select
                value={editData.status ?? "open"}
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
              >
                {["open","claimed","submitted","completed","cancelled"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--color-muted)]">Difficulty (1–5)</label>
              <Input
                type="number"
                min={1}
                max={5}
                value={editData.difficulty ?? 3}
                onChange={(e) => setEditData({ ...editData, difficulty: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--color-muted)]">Budget (cents)</label>
              <Input
                type="number"
                value={editData.budget_cents ?? ""}
                onChange={(e) =>
                  setEditData({ ...editData, budget_cents: e.target.value ? Number(e.target.value) : null })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--color-muted)]">Budget type</label>
              <select
                value={editData.budget_type ?? "flat"}
                onChange={(e) => setEditData({ ...editData, budget_type: e.target.value })}
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
              >
                <option value="flat">Flat</option>
                <option value="hourly">Hourly</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleSaveEdit} disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditId(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Jobs table */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-card)] border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Job</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)] hidden md:table-cell">Poster</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Status</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)] hidden lg:table-cell">Budget</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)] hidden lg:table-cell">Created</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--color-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--color-muted)]">
                  No jobs found.
                </td>
              </tr>
            )}
            {filtered.map((j) => (
              <tr key={j.id} className="hover:bg-[var(--color-card)] transition-colors">
                <td className="px-4 py-3 max-w-xs">
                  <div className="font-medium truncate">{j.title}</div>
                  <div className="text-xs text-[var(--color-muted)] flex items-center gap-1">
                    <span className="capitalize">{j.job_type.replace(/_/g, " ")}</span>
                    {" · "}
                    <span>{j.primary_specialty}</span>
                    {j.is_demo && (
                      <span className="ml-1 rounded bg-purple-100 px-1 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        demo
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--color-muted)] hidden md:table-cell">
                  {j.poster?.display_name ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[j.status] ?? ""}`}
                  >
                    {j.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--color-muted)] hidden lg:table-cell">
                  {fmt(j.budget_cents)}
                </td>
                <td className="px-4 py-3 text-[var(--color-muted)] hidden lg:table-cell">
                  {ago(j.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => startEdit(j)}
                      className="rounded px-2 py-1 text-xs hover:bg-[var(--color-border)] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(j.id, j.title)}
                      disabled={pending}
                      className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===========================================================================
// DEMO GENERATOR TAB
// ===========================================================================
function DemoTab({ onRefreshAll }: { onRefreshAll: () => void }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success: boolean;
    underwritersCreated?: number;
    jobsCreated?: number;
    error?: string;
  } | null>(null);
  const [runCount, setRunCount] = useState(0);

  function handleRun() {
    startTransition(async () => {
      setResult(null);
      const res = await runDemoGeneratorAction();
      if ("error" in res && res.error) {
        setResult({ success: false, error: res.error as string });
      } else {
        setResult(res as { success: boolean; underwritersCreated: number; jobsCreated: number });
        setRunCount((c) => c + 1);
        onRefreshAll();
      }
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-lg border bg-[var(--color-card)] p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100 text-2xl dark:bg-purple-900/30">
            🎲
          </div>
          <div>
            <h2 className="text-xl font-semibold">Demo Generator</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Each run creates <strong>15 new underwriter accounts</strong> and{" "}
              <strong>20 new job postings</strong> using realistic fake data. Runs
              are additive — click as many times as you want and the totals will
              keep growing.
            </p>
          </div>
        </div>

        <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:border-amber-900/30 dark:text-amber-300">
          <strong>Heads up:</strong> Each run creates real Supabase auth users. Demo
          underwriters get handles like <code>demo-jamessmit-abc123</code> and use
          the shared password <code>DemoUW2026!</code>. Jobs are flagged{" "}
          <code>is_demo=true</code> and posted under your account.
        </div>

        <Button
          variant="primary"
          onClick={handleRun}
          disabled={pending}
          className="w-full py-3 text-base"
        >
          {pending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Generating… (this takes ~15–20 seconds)
            </span>
          ) : (
            `🚀 Generate 15 underwriters + 20 jobs${runCount > 0 ? ` (run #${runCount + 1})` : ""}`
          )}
        </Button>

        {result && (
          <div
            className={`rounded-md px-4 py-3 text-sm ${
              result.success
                ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
            }`}
          >
            {result.success ? (
              <>
                ✅ Done! Created <strong>{result.underwritersCreated}</strong> underwriters
                and <strong>{result.jobsCreated}</strong> jobs. Your Users and Jobs tabs have
                been refreshed.
              </>
            ) : (
              <>❌ Error: {result.error}</>
            )}
          </div>
        )}
      </div>

      {runCount > 0 && (
        <div className="text-sm text-[var(--color-muted)]">
          You&apos;ve run the generator <strong>{runCount}</strong> time{runCount !== 1 ? "s" : ""} this session,
          adding roughly{" "}
          <strong>{runCount * 15} underwriters</strong> and{" "}
          <strong>{runCount * 20} jobs</strong> total.
        </div>
      )}
    </div>
  );
}
