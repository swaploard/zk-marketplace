import { Schema, model, Document, models, Model } from 'mongoose';

interface KeyValues {
  name: string;
  supply: number;
  description: string;
  externalLink: string;
}

interface UploadData extends Document {
  tokenAddress: string;
  tokenId: string;
  price: number;
  transactionHash: string;
  IpfsHash: string;
  AssetIpfsHash: string;
  PinSize: number;
  Timestamp: Date;
  ID: string;
  Name: string;
  NumberOfFiles: number;
  MimeType: string;
  GroupId: string;
  isActiveAuction: boolean;
  highestBid: number;
  highestBidder: string;
  isListed: boolean;
  KeyValues: KeyValues;
  walletAddress: string;
}

const keyValuesSchema = new Schema<KeyValues>({
  name: { type: String, required: true },
  supply: { type: Number, required: true },
  description: { type: String, required: true },
  externalLink: { type: String, required: true },
});

const uploadDataSchema = new Schema<UploadData>({
  IpfsHash: { type: String, required: true },
  AssetIpfsHash: { type: String, required: true },
  price: { type: Number, default: 0 },
  PinSize: { type: Number, required: true },
  Timestamp: { type: Date, required: true },
  ID: { type: String, required: true },
  Name: { type: String, required: true },
  tokenId: { type: String },
  isListed: { type: Boolean, default: false },
  tokenAddress: { type: String },
  transactionHash: { type: String },
  isActiveAuction: { type: Boolean, default: false },
  highestBid: { type: Number, default: 0 },
  highestBidder: { type: String, default: "" },
  NumberOfFiles: { type: Number, required: true },
  MimeType: { type: String, required: true },
  GroupId: { type: String, required: true },
  walletAddress: { type: String, required: true },
  KeyValues: { type: keyValuesSchema, required: true }
});

export const UploadDataModel = (
  models.UploadData || model<UploadData>('UploadData', uploadDataSchema)
) as Model<UploadData>;