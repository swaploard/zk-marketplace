export interface collection {
  _id: string;
  contractName: string;
  tokenSymbol: string;
  groupId: string;
  logoUrl: string;
  User: string;
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