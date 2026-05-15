import mongoose, { Schema, models } from "mongoose";

const AlarmSoundSchema = new Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    dataUrl: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const AlarmSound =
  models.AlarmSound || mongoose.model("AlarmSound", AlarmSoundSchema);

export default AlarmSound;
