import mongoose, { Document, Schema, Types } from "mongoose";

interface ICollectionGroup extends Document {
  User: Schema.Types.ObjectId;
  walletAddress: string;
  contractName: string;
  tokenSymbol: string;
  groupId: string;
  logoUrl: string;
  createdAt: Date;
}

const CollectionGroupSchema = new Schema<ICollectionGroup>({
  walletAddress: { type: String, required: true },
  contractName: { type: String, required: true },
  tokenSymbol: { type: String, required: true },
  groupId: { type: String, required: true },
  logoUrl: { type: String, required: true },
  User: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export const CollectionGroup =
  mongoose.models.CollectionGroup ||
  mongoose.model<ICollectionGroup>("CollectionGroup", CollectionGroupSchema);
