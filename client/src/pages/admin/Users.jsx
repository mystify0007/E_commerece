import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { listUsersRequest, updateUserStatusRequest } from "../../services/adminService.js";
import { Spinner } from "../../components/common/Spinner.jsx";
import { Button } from "../../components/common/Button.jsx";

export function AdminUsers() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, role],
    queryFn: () => listUsersRequest({ search: search || undefined, role: role || undefined, limit: 50 }),
  });

  async function toggleStatus(user) {
    const nextStatus = user.status === "active" ? "suspended" : "active";
    try {
      await updateUserStatusRequest(user._id, nextStatus);
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(`User ${nextStatus}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update user");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">Users</h1>

      <div className="mt-4 flex gap-3">
        <input
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-lg border border-stone-300 px-3 py-2 text-sm">
          <option value="">All roles</option>
          <option value="customer">Customer</option>
          <option value="artisan">Craftsman</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {isLoading && <Spinner />}

      {data && (
        <div className="mt-6 divide-y divide-stone-200 rounded-xl border border-stone-200">
          {data.items.map((user) => (
            <div key={user._id} className="flex items-center gap-4 p-4">
              <div className="flex-1">
                <p className="font-medium text-stone-900">{user.name}</p>
                <p className="text-sm text-stone-500">{user.email}</p>
              </div>
              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">{user.role}</span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  user.status === "active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}
              >
                {user.status}
              </span>
              {user.role !== "admin" && (
                <Button variant="outline" onClick={() => toggleStatus(user)}>
                  {user.status === "active" ? "Suspend" : "Reactivate"}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
