const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authorizationHeader = req.headers['authorization'];

  if (!authorizationHeader) {
    return res.status(403).json({ message: "Please provide token." });
  }

  // The token is in the form of "Bearer <token>", so we split it to get the actual token.
  const token = authorizationHeader.split(' ')[1];  // [1] will get the actual token part

  if (!token) {
    return res.status(403).json({ message: "Invalid token format." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticate;

