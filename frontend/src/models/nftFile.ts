// models/UploadData.ts
import { Schema, model, Document, models, Model } from 'mongoose';

interface KeyValues {
  name: string;
  supply: number;
  description: string;
  externalLink: string;
  walletAddress: string;
}

interface UploadData extends Document {
  tokenAddress: string;
  tokenId: string;
  transactionHash: string;
  IpfsHash: string;
  PinSize: number;
  Timestamp: Date;
  ID: string;
  Name: string;
  NumberOfFiles: number;
  MimeType: string;
  GroupId: string;
  KeyValues: KeyValues;
}

const keyValuesSchema = new Schema<KeyValues>({
  name: { type: String, required: true },
  supply: { type: Number, required: true },
  description: { type: String, required: true },
  externalLink: { type: String, required: true },
  walletAddress: { type: String, required: true }
});

const uploadDataSchema = new Schema<UploadData>({
  IpfsHash: { type: String, required: true },
  PinSize: { type: Number, required: true },
  Timestamp: { type: Date, required: true },
  ID: { type: String, required: true },
  Name: { type: String, required: true },
  tokenId: { type: String },
  tokenAddress: { type: String },
  transactionHash: { type: String },
  NumberOfFiles: { type: Number, required: true },
  MimeType: { type: String, required: true },
  GroupId: { type: String, required: true },
  KeyValues: { type: keyValuesSchema, required: true }
});

export const UploadDataModel = (
  models.UploadData || model<UploadData>('UploadData', uploadDataSchema)
) as Model<UploadData>;