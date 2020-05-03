require("./Model/Task");
require("./Model/User");

const express = require("express");
const path = require("path");
const layouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const setupSocket = require("./Router/sockets");
const routes = require("./Router/index");

global.secretKey = '7CC9aT57FR3s3G9n';
const database = 'mongodb://localhost:27017/test'

mongoose.connect(database, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
mongoose.connection
  .on("connected", () => {
    console.log(`Connection to DB opened`);
  })
  .on("error", err => {
    console.log(`Error: ${err.message}`);
  });

const app = express();

const server = http.createServer(app);

app.use(cors());
app.use(layouts);
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", routes);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const io = socketIo(server, { path: "/socket/tasks" });

setupSocket(io);

server.listen(3000, () => {
  console.log(`Socket port: ${server.address().port}`);
});
