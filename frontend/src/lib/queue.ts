import { Queue } from 'bullmq';
import Redis from "ioredis"

export const client = new Redis("rediss://default:AScWAAIjcDFkMWE3ZjY3M2RjNmY0MTZjYTRlZmNlMTE4MTM1NDMzNnAxMA@inspired-turtle-10006.upstash.io:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  enableAutoPipelining: true
});

export const auctionQueue = new Queue('auctions', {
  connection: client,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  },
});