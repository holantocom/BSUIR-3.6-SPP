const socketJwt = require("socketio-jwt");
const TaskService = require("../Service/task.service");
const fsp = require("fs").promises;
const path = require("path");

const uploadsDirectory = path.join(
  path.dirname(require.main.filename),
  "public",
  "uploads"
);

users = {};

module.exports = io => {
  io.use(
    socketJwt.authorize({
      secret: secretKey,
      handshake: true
    })
  );

  io.on("connection", socket => {
    const userId = socket.decoded_token.id;
    const taskService = new TaskService();

    console.log(`New user: ${userId} - ${socket.id}`);

    if(users[userId]){
      users[userId][socket.id] = socket;
    } else {
      users[userId] = {};
      users[userId][socket.id] = socket;
    }

    // Get all tasks
    socket.on("tasks", async () => {
      let tasks = await taskService.getTasks(userId);
      socket.emit("tasks", tasks);
    });

    // Get task by id
    socket.on("taskbyid", async id => {
      let task = await taskService.getTask(id, userId);
      if (task) {
        socket.emit("tasksbyid", task);
      } else {
        socket.emit("taskbyid", undefined);
      }
    });

    // Create task
    socket.on("create", async data => {
      if (data.file) {
        let newFileName = await SaveFile(data.file.fileName, data.file.data);
        if (newFileName) {
          data.task.fileName = data.file.fileName;
          data.task.realFileName = newFileName;
        }
      }
      data.task.user = userId;
      let task = await taskService.addTask(data.task);
      socket.emit("create", task);

      for(var con in users[userId]) {
        users[userId][con].emit("taskUpdate", undefined);
      }
      
    });

    // Update task
    socket.on("update", async data => {
      let oldTask = await taskService.getTask(data.id, userId);
      if (oldTask) {
        if (data.file) {
          if (oldTask.fileName) {
            await taskService.deleteFile(data.id, userId);
          }

          let newFileName = await SaveFile(data.file.fileName, data.file.data);
          if (newFileName) {
            data.task.fileName = data.file.fileName;
            data.task.realFileName = newFileName;
          }
        }

        data.task.user = userId;
        let task = await taskService.updateTask(data.task);
        socket.emit("update", task);

        for(var con in users[userId]) {
          users[userId][con].emit("taskUpdate", undefined);
        }


      } else {
        socket.emit("update", undefined);
      }
    });

    // Delete task
    socket.on("delete", async id => {
      try {
        await taskService.deleteTask(id, userId);
        socket.emit("delete", true);
      } catch {
        socket.emit("delete", false);
      }

      for(var con in users[userId]) {
        users[userId][con].emit("taskUpdate", undefined);
      }

    });

    // Set task status
    socket.on("status", async statusData => {
      await taskService.setTaskStatus(statusData.id, statusData.status, userId);
      socket.emit("status", true);

      for(var con in users[userId]) {
        users[userId][con].emit("taskUpdate", undefined);
      }

    });

    // Delete attached file
    socket.on("deletefile", async id => {
      await taskService.deleteFile(id, userId);
      socket.emit("deletefile", true);

      for(var con in users[userId]) {
        users[userId][con].emit("taskUpdate", undefined);
      }

    });

    // Download file
    socket.on("download", async fileName => {
      let dataBuffer = await ReadFile(fileName);
      let arrayBuffer = ToArrayBuffer(dataBuffer);
      socket.emit("download", arrayBuffer);
    });

    socket.on("disconnect", () => {

      console.log(`User close: ${userId} - ${socket.id}`);
      delete users[userId][socket.id];

    })
  });
};

async function SaveFile(fileName, data) {
  let newName = `${Date.now()}.${fileName}`;

  let fileData = new Uint8Array(data);
  try {
    await fsp.writeFile(path.join(uploadsDirectory, newName), fileData);
    return newName;
  } catch {
    console.log("File could not be saved.");
  }
}

async function ReadFile(fileName) {
  let fullName = path.join(uploadsDirectory, fileName);

  try {
    return await fsp.readFile(fullName);
  } catch {
    console.log("File could not be read.");
  }
}

function ToArrayBuffer(buffer) {
  var arrayBuffer = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(arrayBuffer);
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return arrayBuffer;
}
