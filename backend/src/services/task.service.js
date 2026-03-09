const Task = require("../models/task.model");
const agenda = require("../config/agenda");

exports.create = async (data, userId) => {
  const task = await Task.create({ ...data, user: userId });

  if (task.dueDate) {
    const job = await agenda.schedule(task.dueDate, "notify-overdue-task", {
      taskId: task._id,
    });
    await Task.findByIdAndUpdate(task._id, { jobId: job.attrs._id });
  }

  return task;
};

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
  const task = await Task.findOne({ _id: taskId, user: userId });
  if (!task) throw new Error("Task not found");

  // Task completed before deadline — cancel the scheduled notification
  if (data.completed === true && task.jobId) {
    await agenda.cancel({ _id: task.jobId });
  }

  return Task.findByIdAndUpdate(taskId, data, { new: true });
};

exports.remove = async (taskId, userId) => {
  const task = await Task.findOneAndDelete({
    _id: taskId,
    user: userId
  });

  if (!task) throw new Error("Task not found");

  // Cancel scheduled notification if task is deleted
  if (task.jobId) {
    await agenda.cancel({ _id: task.jobId });
  }

  return task;
};
