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
    price: {
      type: String,
      required: [true, "Service price is required"],
      default: "Contact for Quote",
    },
    tagline: {
      type: String,
    },
    features: {
      type: [String],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ["makeup", "saree", "hairstyle", "jewellery", "mehendi", "bridal_package", "other"],
      default: "makeup",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Service || mongoose.model("Service", ServiceSchema);
