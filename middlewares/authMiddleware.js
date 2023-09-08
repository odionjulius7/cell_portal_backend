const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req?.headers?.authorization?.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded?.id);
        req.user = user;
        next();
      }
    } catch (error) {
      // if the decoded id from header doesn't match with any user in the db
      throw new Error("Not Authorized, Please Login Again");
    }
  } else {
    throw new Error("There is no token attached to the header... ");
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  const { email } = req?.user;
  const isAdmin = await User.findOne({ email: email });
  if (isAdmin?.roles !== "admin") {
    throw new Error("You Are Not An Admin!");
  } else {
    next();
  }
});

const isInstructor = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const isInstructor = await User.findOne({ email: email });
  if (isInstructor?.roles !== "instructor") {
    throw new Error("You Are Not An Instructor!");
  } else {
    next();
  }
});

module.exports = { isInstructor, isAdmin, authMiddleware };
