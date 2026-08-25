import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  sessionId: string;
  name: string;
  number: string;
  defaultAddress: string;
  otherAddresses: string[];
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    sessionId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    number: { type: String, required: true },
    defaultAddress: { type: String, required: true },
    otherAddresses: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Customer =
  (mongoose.models.Customer as mongoose.Model<ICustomer>) ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);

