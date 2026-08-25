import mongoose, { Schema, Document } from "mongoose";

export interface IGalleryImage {
  imageUrl: string;
  alt: string;
  customerName: string;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryImageSchema = new Schema<IGalleryImage>(
  {
    imageUrl: { type: String, required: true },
    alt: { type: String, default: "Jewelry worn by customer" },
    customerName: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const GalleryImage =
  (mongoose.models.GalleryImage as mongoose.Model<IGalleryImage>) ||
  mongoose.model<IGalleryImage>("GalleryImage", GalleryImageSchema);
