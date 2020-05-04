const express = require("express");
const router = express.Router();
const taskRoutes = require("./task");
const userRoutes = require("./user");

router.use("/api/tasks/", taskRoutes);
router.use("/api/users/", userRoutes);

module.exports = router;