import { graphQLClient } from "../graphqlClient.js";
import { auctionsQuery } from "../../app/api/auction/queries.js";
import Marketplace from "../../utils/contracts/Marketplace.json";
import { sepoliaProvider } from "../../utils/config/ethersProvider.js";
import { ethers } from "ethers";
import { auctionQueue } from "../queue.js";

function isAuctionDone(targetTimestampBigInt: number) {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return now >= targetTimestampBigInt;
}

export async function finalizeAuction() {
  const auctionsList: string[] = await graphQLClient.request(auctionsQuery);
  const results = [];
  const marketPlaceAddress = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS;

  for (const auction of auctionsList.auctionCreateds) {
    const contract = new ethers.Contract(
      marketPlaceAddress,
      Marketplace.abi,
      sepoliaProvider,
    );
    const auctionId = Number(auction.auctionId);
    const auctionData = await contract.auctions(auctionId);
    console.log("auctionData", auctionData[8]);
    if (isAuctionDone(auctionData[8])) {
      console.log("Auction is done");
      results.push(auctionId);
    }
  }

  const jobs = results.map((auction) => ({
    name: "finalize-auction",
    data: { auctionId: auction },
    opts: { jobId: `finalize-${auction}` },
  }));
  
  console.log("jobs", jobs);
  await auctionQueue.addBulk(jobs);
}

export default finalizeAuction;
