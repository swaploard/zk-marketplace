import mongoose, { Document, Schema } from 'mongoose';

interface ICollection extends Document {
  User: Schema.Types.ObjectId;
  contractName: string;
  tokenSymbol: string;
  groupId: string;
  logoUrl: string;
  floor: number;
  volume: number;
  createdAt: Date;
  contractAddress: string;
}

const CollectionSchema = new Schema<ICollection>({
  contractName: { type: String, unique: true, required: true },
  tokenSymbol: { type: String, required: true },
  groupId: { type: String, required: true },
  logoUrl: { type: String, required: true },
  floor: { type: Number, default: 0 },
  volume: { type: Number, default: 0 },
  User: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  contractAddress: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Collection =
  (mongoose.models.CollectionGroup as mongoose.Model<ICollection>) ||
  mongoose.model<ICollection>('CollectionGroup', CollectionSchema);
