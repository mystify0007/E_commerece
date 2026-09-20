import { Notification } from "../models/Notification.js";
import { emitToUser } from "../sockets/index.js";
import { ApiError } from "../utils/ApiError.js";
import { parsePagination } from "../utils/paginate.js";

export async function createNotification({ user, type, title, message, relatedEntityType, relatedEntity }) {
  const notification = await Notification.create({
    user,
    type,
    title,
    message,
    relatedEntityType,
    relatedEntity,
  });

  emitToUser(user.toString(), "notification:new", {
    _id: notification._id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  });

  return notification;
}

export async function listNotifications(userId, { page, limit, unreadOnly }) {
  const { skip, limit: pageLimit, page: p } = parsePagination({ page, limit });
  const query = { user: userId };
  if (unreadOnly) query.isRead = false;

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageLimit),
    Notification.countDocuments(query),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  return { items, total, page: p, limit: pageLimit, unreadCount };
}

export async function markAsRead(userId, notificationId) {
  const notification = await Notification.findOne({ _id: notificationId, user: userId });
  if (!notification) throw ApiError.notFound("Notification not found");
  notification.isRead = true;
  await notification.save();
  return notification;
}

export async function markAllAsRead(userId) {
  await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
}
