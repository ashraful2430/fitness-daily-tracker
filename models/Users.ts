import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    gender: {
      type: String,
      trim: true,
      default: "",
    },
    occupation: {
      type: String,
      trim: true,
      default: "",
    },
    loginStreak: {
      type: Number,
      default: 0,
    },
    longestLoginStreak: {
      type: Number,
      default: 0,
    },
    lastLoginDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const User = models.User || mongoose.model("User", UserSchema);

export default User;
