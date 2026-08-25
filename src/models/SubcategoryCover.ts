import mongoose, { Schema } from "mongoose";

export interface ISubcategoryCover {
  slug: string;
  collection: "resin" | "traditional";
  title: string;
  path: string;
  imageUrl: string;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubcategoryCoverSchema = new Schema<ISubcategoryCover>(
  {
    slug: { type: String, required: true, unique: true },
    collection: { type: String, enum: ["resin", "traditional"], required: true },
    title: { type: String, required: true },
    path: { type: String, required: true },
    imageUrl: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SubcategoryCover =
  (mongoose.models.SubcategoryCover as mongoose.Model<ISubcategoryCover>) ||
  mongoose.model<ISubcategoryCover>("SubcategoryCover", SubcategoryCoverSchema);
