const mongoose = require("mongoose");

const validateMongoDBId = (id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);

  if (!isValid) {
    throw new Error("This Id Is Not A Valid Or Not Found");
  }
};

module.exports = { validateMongoDBId };
