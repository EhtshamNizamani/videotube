import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: Schema.Types.ObjectId,
    ref: "User",
    channel: Schema.Types.ObjectId,
    ref: "User",
  },
  {
    timestamps: true,
  }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
