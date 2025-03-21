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
  ID: string;
  IpfsHash: string;
  size: number;
  user_id: string;
  date_pinned: string;
  date_unpinned: string | null;
  metadata: {
    name: string;
    keyvalues: {
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
  };
  regions: {
    regionId: string;
    currentReplicationCount: number;
    desiredReplicationCount: number;
  }[];
  mime_type: string;
  number_of_files: number;
}

export interface Metadata {
  cid: string;
  keyValues: {
    amount: number;
    duration: string;
    endDate: string;
    endTime: string;
  };
  name: string;
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
    collection?: string,
    walletAddress?: string | null,
  ) => Promise<void>;
  updateFiles: (body: Metadata) => Promise<void>;
  getLatestFile: () => PinataFile;
  clearError: () => void;
}