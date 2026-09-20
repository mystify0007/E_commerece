import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listNotificationsRequest,
  markNotificationReadRequest,
  markAllNotificationsReadRequest,
} from "../../services/notificationService.js";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => listNotificationsRequest({ page: 1, limit: 10 }),
  });

  async function handleMarkRead(id) {
    await markNotificationReadRequest(id);
    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  async function handleMarkAllRead() {
    await markAllNotificationsReadRequest();
    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="relative text-sm font-medium text-stone-700 hover:text-stone-900">
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-stone-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-stone-100 p-3">
              <span className="text-sm font-medium text-stone-900">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-xs text-brand-600 hover:text-brand-700">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {(!data || data.items.length === 0) && (
                <p className="p-4 text-center text-sm text-stone-400">No notifications yet</p>
              )}
              {data?.items.map((n) => (
                <button
                  key={n._id}
                  onClick={() => !n.isRead && handleMarkRead(n._id)}
                  className={`block w-full border-b border-stone-50 p-3 text-left text-sm hover:bg-stone-50 ${
                    n.isRead ? "" : "bg-brand-50/50"
                  }`}
                >
                  <p className="font-medium text-stone-900">{n.title}</p>
                  <p className="mt-0.5 text-stone-500">{n.message}</p>
                  <p className="mt-1 text-xs text-stone-400">{new Date(n.createdAt).toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
