import mongoose, { Schema, Document } from "mongoose";

export interface IFavoriteItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  inStock?: boolean;
}

export interface IFavorite extends Document {
  sessionId: string;
  items: IFavoriteItem[];
  updatedAt: Date;
}

const FavoriteItemSchema = new Schema<IFavoriteItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    description: String,
    inStock: Boolean,
  },
  { _id: false }
);

const FavoriteSchema = new Schema<IFavorite>(
  {
    sessionId: { type: String, required: true, unique: true },
    items: [FavoriteItemSchema],
  },
  { timestamps: true }
);

export const Favorite =
  (mongoose.models.Favorite as mongoose.Model<IFavorite>) ||
  mongoose.model<IFavorite>("Favorite", FavoriteSchema);
