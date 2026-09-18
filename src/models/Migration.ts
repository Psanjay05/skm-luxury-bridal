import mongoose from "mongoose";

const MigrationSchema = new mongoose.Schema(
  {
    version: {
      type: String,
      required: true,
      unique: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Migration ||
  mongoose.model("Migration", MigrationSchema);
