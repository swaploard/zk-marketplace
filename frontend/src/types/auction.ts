export interface IAuction {
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
  auction: IAuction;
  error: null | string;
  loading: boolean;
  createAuction: (auction: IAuction) => void;
}