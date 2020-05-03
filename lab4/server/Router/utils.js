const jwt = require("jsonwebtoken");

function validateToken(request, response, next) {
  const token = request.headers.authorization;
  let result;
  if (token) {
    try {
      result = jwt.verify(token, secretKey);
      request.userId = result.id;
      next();
    } catch (err) {
      throw new Error(err);
    }
  } else {
    result = {
      error: `Ошибка аутентификации.`,
      status: 401
    };
    response.status(401).send(result);
  }
}

module.exports = validateToken;
