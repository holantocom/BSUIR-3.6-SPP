const express = require("express");
const router = express.Router();
const schema = require("./schemaGraphQL");
const jwt = require("express-jwt");

// Auth middleware
const auth = jwt({
    secret: '7CC9aT57FR3s3G9n',
    credentialsRequired: false
});

router.use("/", auth);
schema.applyMiddleware({
    app: router,
    path: "/"
});

module.exports = router;