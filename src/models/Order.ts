import { Schema, model, models, type Types, type HydratedDocument } from "mongoose";
import { ORDER_STATUS } from "@/constants";

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface IShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface IDelivery {
  courier: string;
  trackingNumber: string;
  trackingUrl?: string;
}

export interface IOrder {
  orderNumber: string;
  user: Types.ObjectId;
  items: IOrderItem[];
  shipping: IShippingInfo;
  paymentMethod: "cod" | "card";
  note?: string;
  delivery?: IDelivery;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
  createdAt: Date;
  updatedAt: Date;
}

export type OrderDocument = HydratedDocument<IOrder>;

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const DeliverySchema = new Schema<IDelivery>(
  {
    courier: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    trackingUrl: { type: String, default: "" },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [OrderItemSchema], required: true },
    shipping: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: { type: String, enum: ["cod", "card"], default: "cod" },
    note: { type: String, default: "" },
    delivery: { type: DeliverySchema, default: () => ({}) },
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },
  },
  { timestamps: true },
);

export const Order = models.Order || model<IOrder>("Order", OrderSchema);

export default Order;
