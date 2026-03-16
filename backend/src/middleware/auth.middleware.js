// const jwt = require("jsonwebtoken");

// exports.auth = (req, res, next) => {
//   const header = req.headers.authorization;
//   if (!header) return res.status(401).json({ message: "No token" });

//   const token = header.split(" ")[1];

//   try {
//     req.user = jwt.verify(token, process.env.JWT_SECRET);
//     next();
//   } catch {
//     res.status(401).json({ message: "Invalid token" });
//   }
// };


const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

exports.auth = (req, res, next) => {

  const header = req.headers.authorization;

  if (!header) {
    return next(new AppError("Authorization token missing", 401));
  }

  const token = header.split(" ")[1];

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();

  } catch {

    next(new AppError("Invalid or expired token", 401));

  }

};