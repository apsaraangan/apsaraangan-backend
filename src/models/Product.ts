import mongoose, { Schema, Document } from "mongoose";

export interface IProduct {
  name: string;
  price: number;
  imageUrl: string;
  imageUrls?: string[];
  videoUrl?: string;
  categorySlug: string;
  categoryName: string;
  collection: "resin" | "traditional";
  description?: string;
  inStock: boolean;
  readyToShip: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    imageUrls: { type: [String], default: undefined },
    videoUrl: { type: String },
    categorySlug: { type: String, required: true, index: true },
    categoryName: { type: String, required: true },
    collection: { type: String, enum: ["resin", "traditional"], required: true },
    description: { type: String },
    inStock: { type: Boolean, default: true },
    readyToShip: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Product =
  (mongoose.models.Product as mongoose.Model<IProduct>) ||
  mongoose.model<IProduct>("Product", ProductSchema);

