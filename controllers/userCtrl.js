const { generateToken } = require("../config/jwtToken");
const { validateMongoDBId } = require("../config/validateMongoDBId");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const sendEmail = require("./emailCtrl");
const welcome = require("../emailTemplates");

welcome;

/* Create A User */
const registerAUser = asyncHandler(async (req, res) => {
  /* Check if the email from req.body is already exist(user?.email) if not register user*/
  const email = req.body.email;

  /* find the user with this email from the req.body */
  const findUser = await User.findOne({ email: email });

  if (!findUser) {
    /* If user doesn't exist already */
    const createUser = await User.create(req.body);
    res.status(200).json({
      status: true,
      message: "User Created Successfully",
      createUser,
    });
  } else {
    throw new Error("User already exist!");
  }
});

/* Login Ourr User */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  /* check if user exist */
  const findUser = await User.findOne({ email: email });

  if (findUser && (await findUser.isPasswordMatched(password))) {
    /* if user with the email exist and the password check matches then */
    res.status(200).json({
      status: true,
      message: "Logged In Successfully!",
      token: generateToken(findUser?._id),
      role: findUser?.roles,
      profession: findUser?.profession,
      username: findUser?.firstname + findUser?.lastname,
      email: findUser?.email,
      user_image: findUser?.user_image,
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

/* Get All Users */
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const allUsers = await User.find();
    res.status(200).json({
      status: true,
      message: "All Users Fetchd Successfully!",
      allUsers,
    });
  } catch (error) {
    throw new Error(error);
  }
});

/* get A User */
const getAUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const getProfile = await User.findById(id);
    res.status(200).json({
      status: true,
      message: "User Found!",
      getProfile,
    });
  } catch (error) {
    throw new Error(error);
  }
});

/* update a Users */
const updateAUserProfile = asyncHandler(async (req, res) => {
  const { _id } = req?.user;
  validateMongoDBId(_id);
  try {
    const user = await User.findOneAndUpdate(_id, req.body, { new: true });
    res.status(200).json({
      status: true,
      message: "Profile updated successfully!",
      user,
    });
  } catch (error) {
    throw new Error(error);
  }
});

/* Delete A User */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const deleteUser = await User.findByIdAndDelete(id);
    res.status(200).json({
      status: true,
      message: "User deleted successfully!",
      deleteUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

/* Block A User */
const blockAUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const blockUser = await User.findByIdAndUpdate(
      id,
      {
        isblocked: true,
      },
      { new: true }
    );
    res.status(200).json({
      status: true,
      message: "User is blocked successfully!",
      blockUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

/* Block A User */
const unblockAUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const unblockAUser = await User.findByIdAndUpdate(
      id,
      {
        isblocked: false,
      },
      { new: true }
    );
    res.status(200).json({
      status: true,
      message: "User is unblocked successfully!",
      unblockAUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

/* Update User Password */
const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDBId(_id);
  try {
    const user = await User.findById(_id);
    if (user && password && (await user.isPasswordMatched(password))) {
      /* If user is logged in and provide same old password */
      throw new Error("Please provide a new password instead of old one.");
    } else {
      /* If user is logged in and provide a new password */
      user.password = password; // pass the new password to the db
      await user.save();
      res.status(200).json({
        status: true,
        message: "Password changed successsfully!",
      });
    }
  } catch (error) {
    throw new Error(error);
  }
});

/* Forgot Password Token  */
const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new Error("No user Found With This Email...");
  }

  try {
    /* Create the reset token // check the userModel */
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetLink = `http://localhost:5000/api/user/reset-password/${token}`;

    const emailData = { username: user.firstname, resetLink };
    const data = {
      to: email,
      text: `Hey ${user.firstname + " " + user.lastname}`,
      subject: "Forgot Password",
      html: welcome(emailData),
      //   html: resetLink,
    };
    sendEmail(data);

    res
      .status(200)
      .json({
        status: true,
        message:
          "an email with link to reset password has been sent to your mail",
        resetLink,
      });
  } catch (error) {
    throw new Error(error);
  }
});

/* Reset Password   */
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken, // check input/gtten token(hashed) with the one in the db
    passwordResetExpires: { $gt: Date.now() }, // greater that now, i.e our passwordResetExpires date must be in the future
  });

  if (!user) throw new Error("Token Expired, please try again...");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  res.status(200).json({
    status: true,
    message: "Password Reset Successfully",
  });
});

module.exports = {
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
};
