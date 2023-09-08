const express = require("express");
const dbConnect = require("./config/dbConnect");
const { notFound, handleError } = require("./middlewares/errorhandle");
const userRouter = require("./routes/userRoutes");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const dotenv = require("dotenv").config(); // to use .env call it here
const app = express();
const PORT = process.env.PORT || 5000;

dbConnect();

app.use(bodyParser.json()); // bodyParser middleware specifically for handling JSON data.
app.use(bodyParser.urlencoded({ extended: false })); //bodyParser middleware for handling URL-encoded form data.formdata
app.get("/", (req, res) => {
  res.send("Hello From Us Lms JobPortal Server");
});

app.use("/api/user", userRouter);

app.use(notFound);
app.use(handleError);

app.listen(PORT, () => {
  console.log(`server is running at http://localhost:${PORT}`);
});
