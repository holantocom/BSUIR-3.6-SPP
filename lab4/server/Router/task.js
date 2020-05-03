const express = require("express");
const router = express.Router();
const TaskService = require("../Service/task.service");
const multer = require("multer");
const path = require("path");

const validateToken = require("./utils");

const taskService = new TaskService();
const uploadsDirectory = path.join(
  path.dirname(require.main.filename),
  "public",
  "uploads"
);

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDirectory);
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}.${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Get all tasks
router.get("/", validateToken, async (request, response) => {
  let userId = request.userId;
  if (userId) {
    let tasks = await taskService.getTasks(userId);
    response.status(200).send(tasks);
  } else {
    response.status(401).send({});
  }
});

// Get task by Id
router.get("/:id", validateToken, async (request, response) => {
  let userId = request.userId;
  if (userId) {
    let task = await taskService.getTask(request.params.id, userId);
    if (task) {
      response.status(200).send(task);
    } else {
      response.status(404).send({});
    }
  } else {
    response.status(401).send({});
  }
});

// Delete task
router.delete("/:id", validateToken, async (request, response) => {
  let userId = request.userId;
  if (userId) {
    try {
      await taskService.deleteTask(request.params.id, userId);
      response.status(204).send({});
    } catch {
      response.status(404).send({});
    }
  } else {
    response.status(401).send({});
  }
});

// Update task
router.put(
  "/:id",
  validateToken,
  upload.single("attachedFile"),
  async (request, response) => {
    let userId = request.userId;
    if (userId) {
      let oldTask = await taskService.getTask(request.params.id, userId);
      if (oldTask) {
        let file = request.file || {
          filename: oldTask.fileName,
          originalname: oldTask.realFileName
        };
        let taskIsCompleted = "true" == request.body.completed;
        let task = {
          _id: request.params.id,
          title: request.body.title,
          completed: taskIsCompleted,
          dueDate: request.body.dueDate,
          fileName: file.originalname,
          realFileName: file.filename,
          user: userId
        };
        task = await taskService.updateTask(task);
        response.status(200).send(task);
      } else {
        response.status(404).send({});
      }
    } else {
      response.status(401).send({});
    }
  }
);

// Add task
router.post(
  "/",
  validateToken,
  upload.single("attachedFile"),
  async (request, response) => {
    let userId = request.userId;
    if (userId) {
      let file = request.file || {
        filename: undefined,
        originalname: undefined
      };
      let taskIsCompleted = "true" == request.body.completed;
      let task = {
        title: request.body.title,
        completed: taskIsCompleted,
        dueDate: request.body.dueDate,
        fileName: file.originalname,
        realFileName: file.filename,
        user: userId
      };
      let addedTask = await taskService.addTask(task);
      response.status(201).send(addedTask);
    } else {
      response.status(401).send({});
    }
  }
);

// Set completed status
router.put(
  "/:id/status/:completed",
  validateToken,
  async (request, response) => {
    let userId = request.userId;
    if (userId) {
      let completedFlag = request.params.completed == "true";
      await taskService.setTaskStatus(request.params.id, completedFlag, userId);
      response.status(204).send({});
    } else {
      response.status(401).send({});
    }
  }
);

// Download file
router.get("/download/:fileName", validateToken, (request, response) => {
  if (request.userId) {
    let filepath = path.join(uploadsDirectory, request.params.fileName);
    response.status(200).sendFile(filepath);
  } else {
    response.status(401).send({});
  }
});

// Delete attached file
router.delete("/:id/removefile", validateToken, async (request, response) => {
  let userId = request.userId;
  if (userId) {
    await taskService.deleteFile(request.params.id, userId);
    response.status(204).send({});
  } else {
    response.status(401).send({});
  }
});

module.exports = router;
