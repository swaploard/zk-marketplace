import mongoose, { Document, Schema } from "mongoose";

interface IAuction extends Document {
  file: Schema.Types.ObjectId 
  auctionId: number;
  marketplaceOwnerAddress: string;
  tokenAddress: string;
  tokenId: number;
  amount: number;
  startingPrice: number;
  duration: number;
  createdAt: Date;
}

const auctionSchema = new Schema<IAuction>({
  file: { type: Schema.Types.ObjectId, ref: "UploadData", required: true },
  auctionId: { type: Number, required: true },
  marketplaceOwnerAddress: { type: String, required: true },
  tokenAddress: { type: String, required: true },
  tokenId: { type: Number, required: true },
  startingPrice: { type: Number, required: true },
  duration: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

export const auction =
  (mongoose.models.auction as mongoose.Model<IAuction>) ||
  mongoose.model<IAuction>("auction", auctionSchema);
