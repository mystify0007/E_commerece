export function sendSuccess(res, statusCode, data, message) {
  return res.status(statusCode).json({ success: true, data, message });
}

export function sendPaginated(res, { items, page, limit, total }) {
  return res.status(200).json({
    success: true,
    data: {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
}
