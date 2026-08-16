import mongoose from "mongoose";

const GallerySchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    altText: {
      type: String,
      required: [true, "Alt text is required for accessibility"],
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Bridal",
        "Reception",
        "Engagement",
        "Guest",
        "Mehendi",
        "Jewellery",
        "Hairstyle",
        "Before & After",
      ],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Gallery || mongoose.model("Gallery", GallerySchema);
