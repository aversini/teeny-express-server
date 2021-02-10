const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  active: Boolean,
  encryptedPassword: String,
  id: {
    index: true,
    lowercase: true,
    required: true,
    trim: true,
    type: String,
    unique: true,
  },
  salt: String,
  token: String,
  username: {
    lowercase: true,
    required: true,
    trim: true,
    type: String,
    unique: true,
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = {
  User,
};
