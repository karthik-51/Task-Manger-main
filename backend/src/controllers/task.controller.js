const taskService = require("../services/task.service");

exports.create = async (req, res, next) => {
  try {
    const task = await taskService.create(req.body, req.user.id);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const result = await taskService.getAll(req.query, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const task = await taskService.update(req.params.id, req.body, req.user.id);
    res.json(task);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await taskService.remove(req.params.id, req.user.id);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    next(err);
  }
};