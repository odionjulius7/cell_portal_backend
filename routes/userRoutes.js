const express = require("express");
const {
  registerAUser,
  loginUser,
  getAllUsers,
  updateAUserProfile,
  deleteUser,
  getAUser,
  blockAUser,
  unblockAUser,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
} = require("../controllers/userCtrl");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const userRouter = express.Router();

/* All Post routes */
userRouter.post("/register", registerAUser);
userRouter.post("/login", loginUser);
userRouter.post("/forgot-password", forgotPasswordToken);

/* All get routes */
userRouter.get("/all-users", authMiddleware, isAdmin, getAllUsers);
userRouter.get("/:id", authMiddleware, getAUser);

/* All patch/put routes */
userRouter.put("/update-profile", authMiddleware, updateAUserProfile);
userRouter.put("/block/:id", authMiddleware, isAdmin, blockAUser);
userRouter.put("/unblock/:id", authMiddleware, isAdmin, unblockAUser);
userRouter.put("/update-password", authMiddleware, updatePassword);
userRouter.put("/reset-password/:token", resetPassword);

/* All delete routes */
userRouter.delete("/:id", authMiddleware, isAdmin, deleteUser);

module.exports = userRouter;
