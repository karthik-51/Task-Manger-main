

const Task = require("../models/task.model");

exports.create = (data, userId) =>
  Task.create({ ...data, user: userId });

exports.getAll = async (query, userId) => {
  const {
    page = 1,
    limit = 10,
    search,
    priority,
    status,
    completed,
    dueBefore,
    dueAfter
  } = query;

  const filter = {
    user: userId,

    ...(search && {
      title: { $regex: search, $options: "i" }
    }),

    ...(priority && { priority }),

    ...(status && { status }),

    ...(completed !== undefined && {
      completed: completed === "true"
    }),

    ...((dueBefore || dueAfter) && {
      dueDate: {
        ...(dueAfter && { $gte: new Date(dueAfter) }),
        ...(dueBefore && { $lte: new Date(dueBefore) })
      }
    })
  };

  const tasks = await Task.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Task.countDocuments(filter);

  return {
    total,
    page: Number(page),
    tasks
  };
};

exports.update = async (taskId, data, userId) => {
  const task = await Task.findOneAndUpdate(
    { _id: taskId, user: userId },
    data,
    { new: true }
  );

  if (!task) throw new Error("Task not found");

  return task;
};

exports.remove = async (taskId, userId) => {
  const task = await Task.findOneAndDelete({
    _id: taskId,
    user: userId
  });

  if (!task) throw new Error("Task not found");

  return task;
};