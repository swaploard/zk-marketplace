export interface collection {
  _id: string;
  contractName: string;
  tokenSymbol: string;
  groupId: string;
  logoUrl: string;
  User: string;
  contractAddress: string;
  createdAt: string;
  __v: number;
}

export interface File {
  collection: collection;
  pinataMetadata: string;
  pinataOptions: {
    cidVersion: number;
  };
}

export interface PinataFile {
  _id: string;
  ID: string;
  IpfsHash: string;
  AssetIpfsHash: string;
  price: number;
  size: number;
  user_id: string;
  date_pinned: string;
  date_unpinned: string | null;
  name: string;
  tokenId: string;
  tokenAddress: string;
  transactionHash: string;
  KeyValues: {
    name: string;
    supply: number;
    description: string;
    externalLink: string;
    amount: number;
    duration: string;
    endDate: string;
    endTime: string;
    walletAddress: string;
  };
  regions: {
    regionId: string;
    currentReplicationCount: number;
    desiredReplicationCount: number;
  }[];
  mime_type: string;
  number_of_files: number;
}

export interface IFileStore {
  file: PinataFile | null;
  files: PinataFile[];
  previewUrl: string | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  addFile: (formData: FormData) => Promise<void>;
  getFiles: (
    collection?: string | null,
    walletAddress?: string | null,
  ) => Promise<void>;
  updateFiles: <T extends keyof PinataFile>(body: Pick<PinataFile, T>) => Promise<void>;
  getLatestFile: () => PinataFile;
  deleteFile: (id: string) => void;
  clearError: () => void;
  getNftsFromUserAddress: (walletAddress: string) => void;
}
