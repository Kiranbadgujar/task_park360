// const jwt = require('jsonwebtoken');

// module.exports = (req, res, next) => {
//   const token = req.header('Authorization')?.replace('Bearer ', '');
//   console.log(token)
//   if (!token) {
//     return res.status(401).json({ message: 'Access Denied' });
//   }

//   try {
//     const decoded = jwt.verify(token, cess.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: 'Invalid Token' });
//   }
// };

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

