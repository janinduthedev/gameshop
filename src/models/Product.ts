import { Schema, model, models, type Types, type HydratedDocument } from "mongoose";

export interface IProductImage {
  url: string;
  publicId: string;
}

export interface IProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  category: Types.ObjectId;
  brand?: string;
  featured: boolean;
  images: IProductImage[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProductDocument = HydratedDocument<IProduct>;

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true },
);

ProductSchema.index({ name: "text", description: "text", brand: "text" });

export const Product = models.Product || model<IProduct>("Product", ProductSchema);

export default Product;
