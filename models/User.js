const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  confirmed: {
    type: Boolean,
    default: false
  },
  email: {
    type: String,
    required: [true, "Please provide email address"],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  phone: {
    type: String,
    // required: [true, "Please provie phone number"],
    // minlength: 10,
    // maxlength: 13,
  }
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};


UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      id: this._id, 
      email: this.email,
      phone: this.phone,
      authLevel1: true
    }, 
    Buffer.from(process.env.JWT_PRIVATE , 'base64').toString('ascii'),
    {
      expiresIn: process.env.JWT_EXPIRE,
      algorithm: 'RS256'
    }
  );
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
