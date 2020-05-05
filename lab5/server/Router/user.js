const express = require("express");
const router = express.Router();
const UserService = require("../Service/user.service");
const jwt = require("jsonwebtoken");

const userService = new UserService();
const expires = 86400; // 24 houres

// Sign in
router.post("/signin", async (request, response) => {
  try {
    let user = await userService.getUser(
      request.body.login,
      request.body.password
    );
    if (user) {
      let token = jwt.sign({ id: user._id }, secretKey, {
        expiresIn: expires
      });
      response.status(200).send({ auth: true, token: token });
    } else {
      response.status(404).send({ message: "Неверный логин или пароль" });
    }
  } catch {
    return response.status(401).send({ auth: false, token: null });
  }
});

// Sign up
router.post("/signup", async (request, response) => {
  let user = {
    login: request.body.login,
    password: request.body.password
  };

  user = await userService.addUser(user);
  if (user) {
    response.status(200).send({});
  } else {
    response.status(400).send({ message: "Пользователь с таким логином уже существует" });
  }
});

// Sign out
router.get("/signout", (request, response) => {
  res.status(200).send({ auth: false, token: null });
});

module.exports = router;
