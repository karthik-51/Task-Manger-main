const agenda = require("../config/agenda");
const Task = require("../models/task.model");
const User = require("../models/user.model");
const mailService = require("../services/mail.service");

agenda.define("notify-overdue-task", async (job) => {
  const { taskId } = job.attrs.data;

  const task = await Task.findById(taskId);

  // Task was completed before deadline or deleted — nothing to do
  if (!task || task.completed) return;

  const user = await User.findById(task.user);
  if (!user) return;

  await mailService.sendOverdueEmail(user.email, user.name, task.title);
});
//  agenda.on("success:notify-overdue-task", (job) => {
//     job.remove();
//   });
