import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  inStock?: boolean;
}

export interface ICart extends Document {
  sessionId: string;
  items: ICartItem[];
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    description: String,
    inStock: Boolean,
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    sessionId: { type: String, required: true, unique: true },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

export const Cart =
  (mongoose.models.Cart as mongoose.Model<ICart>) ||
  mongoose.model<ICart>("Cart", CartSchema);
