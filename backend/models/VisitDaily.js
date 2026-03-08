import mongoose from "mongoose";

const VisitDailySchema = new mongoose.Schema(
  {
    day: {
      type: Date,
      required: true,
      unique: true,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

VisitDailySchema.index({ day: 1 }, { unique: true });

export default mongoose.model("VisitDaily", VisitDailySchema);
