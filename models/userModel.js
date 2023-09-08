const mongoose = require("mongoose"); // Erase if already required
const bcrypt = require("bcrypt");
const crypto = require("crypto"); // it's inbuilt so no need to install

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    user_image: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdQopz8vEPiYTptPjQzD1myQnVh7fdQ442Bg2BE8c0VB9zZ_5_N5yDIyg8NbpeF4FEw8k&usqp=CAU",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    cellName: {
      type: String,
      required: true,
    },
    cellRegion: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    cellLeader: {
      type: String,
      // required: true,
    },
    roles: {
      type: String,
      default: "member",
      enum: ["member", "cell leader", "regional officer", "admin"],
    },
    // cellLeaderReferrer: String,
    isblocked: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    stripe_account_id: String,
  },
  {
    timestamps: true,
  }
);

// hash pssswd
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    /* The purpose of this code block is typically to avoid rehashing the password when you're updating other fields in the document that don't affect the password.  */
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt); // before saving to db hash the psswod
  next();
});

// compare login pwd to the user model pwd
(userSchema.methods.isPasswordMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
}),
  // create password reset token
  (userSchema.methods.createPasswordResetToken = async function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 10 minutes to expire
    return resetToken;
  }),
  // Define a pre-save middleware to set the cellLeaderReferrer
  // userSchema.pre("save", async function (next) {
  //   // Check if the cellLeaderReferrer is not already set (to avoid overwriting)
  //   if (!this.cellLeaderReferrer && this.roles === "cell leader") {
  //     try {
  //       let uniqueReferrer;
  //       let counter = 1;
  //       do {
  //         // Generate a unique referrer by appending a random number
  //         uniqueReferrer = `cell_leader_${Math.floor(Math.random() * 10000)}`;
  //         // Check if the generated referrer is already in use
  //         const existingUser = await this.constructor.findOne({
  //           cellLeaderReferrer: uniqueReferrer,
  //         });
  //         // If not in use, set it as the cellLeaderReferrer
  //         if (!existingUser) {
  //           this.cellLeaderReferrer = uniqueReferrer;
  //         }
  //         // Increment the counter to avoid an infinite loop
  //         counter++;
  //         // Limit the number of attempts to generate a unique referrer
  //       } while (existingUser && counter <= 10); // Adjust the limit as needed
  //       // If a unique referrer couldn't be generated, you can handle it here.
  //     } catch (error) {
  //       next(error);
  //       return;
  //     }
  //   }
  //   next();
  // });

  //Export the model
  (module.exports = mongoose.model("User", userSchema));
