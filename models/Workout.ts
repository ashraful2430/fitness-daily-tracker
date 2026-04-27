import mongoose, { Schema, models } from "mongoose";

const WorkoutSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      default: "General",
    },
    status: {
      type: String,
      enum: ["planned", "completed"],
      default: "planned",
    },
    calories: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const Workout = models.Workout || mongoose.model("Workout", WorkoutSchema);

export default Workout;
