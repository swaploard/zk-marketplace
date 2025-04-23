import mongoose, { Schema } from 'mongoose';

interface Socials {
  twitter: string;
  instagram: string;
}

export interface IUser {
  walletAddress: string;
  username: string;
  email: string;
  bio: string;
  profileImage: string;
  profileBanner: string;
  socials: Socials;
  links: string[];
}

const userSchema = new Schema<IUser>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    profileBanner: {
      type: String,
      default: '',
    },
    socials: {
      twitter: {
        type: String,
        default: '',
      },
      instagram: {
        type: String,
        default: '',
      },
    },
    links: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>('User', userSchema);

export default User;
