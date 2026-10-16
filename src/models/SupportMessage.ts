import { Schema, model, models, type Types, type HydratedDocument } from "mongoose";
import { SUPPORT_STATUS, type SupportStatus } from "@/constants";

export interface ISupportMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  user?: Types.ObjectId | null;
  status: SupportStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type SupportMessageDocument = HydratedDocument<ISupportMessage>;

const SupportMessageSchema = new Schema<ISupportMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      enum: Object.values(SUPPORT_STATUS),
      default: SUPPORT_STATUS.OPEN,
    },
  },
  { timestamps: true },
);

export const SupportMessage =
  models.SupportMessage ||
  model<ISupportMessage>("SupportMessage", SupportMessageSchema);

export default SupportMessage;
