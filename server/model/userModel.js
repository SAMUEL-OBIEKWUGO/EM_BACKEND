const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
      unique: [true, "username already in use"],
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: [true, "Email already in use"],
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    password: {
      type: String,
      required: [true, "Please enter a password"],
      trim: true,
      minlength: [8, "Minimum password length must be eight characters"],
    },

    profilePhoto: {
      type: String,
      default:
        "https://media.istockphoto.com/id/1313958250/vector/user-avatar-profile-icon-black-vector-illustration-on-transparent-background-website-or-app.webp?s=1024x1024&w=is&k=20&c=uUqP7QXNIcLTkQpRLwtnjU6z1bDC50ISz9BJyO41hNA=",
    },
    bio: {
      type: String,
      default: "Hi, I am new here",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
    },
    location: {
      type: String,
      default: "location",
    },
    occupation: {
      type: String,
      default: "occupation",
    },
    x: {
      type: String,
      default: "x account",
    },
    linkedIn: {
      type: String,
      default: "linkedin account",
    },
    followers: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    resetPasswordToken: String,
    resetPasswordExpire: String,
  },
  { timestamps: true }
);

// hashing password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (userPassword) {
  const isCorrect = await bcrypt.compare(userPassword, this.password);
  return isCorrect;
};

// generate jwt token
userSchema.methods.generateToken = async function (params) {
  let token = jwt.sign(
    { userId: this._id, userName: this.userName },
    process.env.JWT_SECRET
  );
  return token;
};

const USER = mongoose.model("User", userSchema);

module.exports = USER;
