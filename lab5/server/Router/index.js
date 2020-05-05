const express = require("express");
const router = express.Router();
const taskRoutes = require("./task");
const userRoutes = require("./user");
const graphQlRoutes = require("./GraphQL");

router.use("/api/tasks/", taskRoutes);
router.use("/api/users/", userRoutes);
router.use("/graphql/", graphQlRoutes);

module.exports = router;