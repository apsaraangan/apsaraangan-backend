import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

reviewSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const Review = mongoose.model("Review", reviewSchema);
