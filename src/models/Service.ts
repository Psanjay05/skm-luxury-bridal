import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Service title is required"],
    },
    description: {
      type: String,
      required: [true, "Service description is required"],
    },
    imageUrl: {
      type: String,
      required: [true, "Service image is required"],
    },
    iconUrl: {
      type: String,
    },
    ctaText: {
      type: String,
      default: "Book Now",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ["makeup", "saree", "hairstyle", "jewellery", "mehendi", "other"],
      default: "makeup",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Service || mongoose.model("Service", ServiceSchema);
