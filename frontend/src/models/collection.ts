import mongoose, { Document, Schema } from "mongoose";

interface ICollectionGroup extends Document {
  User: Schema.Types.ObjectId;
  contractName: string;
  tokenSymbol: string;
  groupId: string;
  logoUrl: string;
  createdAt: Date;
  contractAddress: string;
}

const CollectionGroupSchema = new Schema<ICollectionGroup>({
  contractName: { type: String, unique: true, required: true },
  tokenSymbol: { type: String, required: true },
  groupId: { type: String, required: true },
  logoUrl: { type: String, required: true },
  User: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  contractAddress: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const CollectionGroup =
  (mongoose.models.CollectionGroup as mongoose.Model<ICollectionGroup>) ||
  mongoose.model<ICollectionGroup>("CollectionGroup", CollectionGroupSchema);
