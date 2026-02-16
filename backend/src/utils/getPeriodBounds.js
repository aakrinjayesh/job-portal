export const getPeriodBounds = (period) => {
  const now = new Date();

  if (period === "DAILY") {
    const start = new Date(now.setHours(0, 0, 0, 0));
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  if (period === "MONTHLY") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { start, end };
  }

  if (period === "YEARLY") {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear() + 1, 0, 1);
    return { start, end };
  }
};
