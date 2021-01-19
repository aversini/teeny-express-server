const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  id: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  encryptedPassword: String,
  salt: String,
  token: String,
  active: Boolean,
});

const User = mongoose.model("User", UserSchema);

module.exports = {
  User,
};
