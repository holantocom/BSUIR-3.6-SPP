const path = require("path");
const mongoose = require("mongoose");
const fs = require("fs");
const UserService = require("./user.service");

const Task = mongoose.model("Task");

class TaskService {
  constructor() {
    this._userService = new UserService();
    this._fileDirPath = path.join(
      path.dirname(require.main.filename),
      "public",
      "uploads"
    );
  }

  async getTasks(userId) {
    const user = await this._userService.getUserById(userId);
    if (user) {
      return await Task.find({ user: user._id });
    }

    return undefined;
  }

  async getTask(id, userId) {
    return await Task.findOne({ _id: id, user: userId });
  }

  async addTask(task) {
    let user = await this._userService.getUserById(task.user);
    if (user) {
      task._id = new mongoose.Types.ObjectId();
      const newTask = new Task(task);
      await newTask.save();
      return task;
    }

    return undefined;
  }

  async setTaskStatus(id, completed, userId) {
    await Task.updateOne(
      { _id: id, user: userId },
      { $set: { completed: completed } }
    );
  }

  async updateTask(task) {
    if (task.fileName) {
      await this.deleteFile(task._id, task.user);
    }

    await Task.updateOne({ _id: task._id, user: task.user }, { $set: task });
    return task;
  }

  async deleteTask(id, userId) {
    await this.deleteFile(id, userId);
    await Task.deleteOne({ _id: id, user: userId });
  }

  async deleteFile(taskId, userId) {
    let task = await Task.findOne({ _id: taskId, user: userId });
    if (task) {
      if (task.realFileName != undefined) {
        fs.unlink(path.join(this._fileDirPath, task.realFileName), err => {});
      }

      await Task.updateOne(task, {
        $set: { fileName: undefined, realFileName: undefined }
      });
    }
  }
}

module.exports = TaskService;
