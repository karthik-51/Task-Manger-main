const mongoose = require("mongoose");
const Task = require("../models/task.model");
const logger = require("../config/logger");

exports.getAnalytics = async (userId) => {
  const userObjId = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const next31Days = new Date(todayStart.getTime() + 31 * 24 * 60 * 60 * 1000);

  // 1. Status counts
  const statusAgg = await Task.aggregate([
    { $match: { user: userObjId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const statusCounts = { todo: 0, inprogress: 0, completed: 0 };
  statusAgg.forEach((s) => { statusCounts[s._id] = s.count; });

  // 2. Priority counts (all tasks)
  const priorityAgg = await Task.aggregate([
    { $match: { user: userObjId } },
    { $group: { _id: "$priority", count: { $sum: 1 } } },
  ]);
  const priorityCounts = { low: 0, medium: 0, high: 0 };
  priorityAgg.forEach((p) => { priorityCounts[p._id] = p.count; });

  // 3. Status × Priority matrix
  const matrix = await Task.aggregate([
    { $match: { user: userObjId } },
    {
      $group: {
        _id: { status: "$status", priority: "$priority" },
        count: { $sum: 1 },
      },
    },
  ]);

  // 4. Overdue count (not completed, past due)
  const overdueCount = await Task.countDocuments({
    user: userObjId,
    status: { $ne: "completed" },
    dueDate: { $lt: now },
  });

  // 5. Created today
  const createdToday = await Task.countDocuments({
    user: userObjId,
    createdAt: { $gte: todayStart, $lt: todayEnd },
  });

  // 6. Avg lead time in days (createdAt → updatedAt for completed tasks)
  const leadTimeAgg = await Task.aggregate([
    { $match: { user: userObjId, status: "completed" } },
    {
      $group: {
        _id: null,
        avgLeadTime: {
          $avg: {
            $divide: [
              { $subtract: ["$updatedAt", "$createdAt"] },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
    },
  ]);
  const avgLeadTime =
    leadTimeAgg.length > 0
      ? Math.round(leadTimeAgg[0].avgLeadTime * 10) / 10
      : 0;

  // 7. Daily created (last 30 days)
  const dailyCreated = await Task.aggregate([
    { $match: { user: userObjId, createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 8. Daily completed (last 30 days, by updatedAt)
  const dailyCompleted = await Task.aggregate([
    {
      $match: {
        user: userObjId,
        status: "completed",
        updatedAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 9. Deadline crunch — pending tasks with dueDate in next 31 days
  const deadlines = await Task.aggregate([
    {
      $match: {
        user: userObjId,
        status: { $ne: "completed" },
        dueDate: { $gte: todayStart, $lte: next31Days },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$dueDate" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  logger.info("Analytics service: computed analytics", { userId });

  return {
    statusCounts,
    priorityCounts,
    matrix,
    overdueCount,
    createdToday,
    avgLeadTime,
    dailyCreated,
    dailyCompleted,
    deadlines,
  };
};
