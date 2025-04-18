export interface IAuction {
  _id?: string;
  auctionId?: number;
  marketplaceOwnerAddress?: string;
  tokenAddress?: string;
  tokenId?: number;
  amount?: number;
  startingPrice?: number;
  duration?: number;
  createdAt?: Date;
}
export interface IAuctionStore {
  auctions: IAuction[];
  error: null | string;
  loading: boolean;
  createAuction: (auction: IAuction) => void;
  getAuction: (id: string) => void;
}