import { Schema, model, models, type HydratedDocument } from "mongoose";
import { ROLES, USER_STATUS, type Role, type UserStatus } from "@/constants";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: Role;
  status: UserStatus;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    image: { type: String, default: "" },
  },
  { timestamps: true },
);

export const User = models.User || model<IUser>("User", UserSchema);

export default User;
