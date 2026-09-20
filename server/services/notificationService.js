import { Notification } from "../models/Notification.js";
import { emitToUser } from "../sockets/index.js";

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
