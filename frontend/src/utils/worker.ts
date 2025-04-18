import { Worker } from "bullmq";
import { auctionQueue, client } from "../lib/queue.ts";

client
  .ping()
  .then(() => console.log("Redis connection verified"))
  .catch((err) => console.error("Redis connection failed:", err));

const worker = new Worker(
  "auctions",
  async (job) => {
    console.log(`Processing job ${job.id} (${job.name})`);

    if (job.name === "finalize-auction") {
      const { auctionId } = job.data;
      console.log("Starting auction finalization for:", auctionId);
      console.log("process.env.NEXT_PUBLIC_NEXTAUTH_URL", process.env.NEXT_PUBLIC_NEXTAUTH_URL);
      try {

        // 2. Log request details
        const url = `http://localhost:3000/api/relayer`;
        console.log("Making request to:", url);
        console.log("Request payload:", {
          functionName: "finalizeAuction",
          args: [auctionId],
        });

        // 3. Execute fetch with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            functionName: "finalizeAuction",
            args: [auctionId],
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        // 4. Handle response
        if (!res.ok) {
          const errorBody = await res.text();
          throw new Error(`HTTP ${res.status}: ${errorBody}`);
        }

        const result = await res.json();
        console.log(
          `Successfully processed auction ${auctionId}:`,
          result.txHash,
        );
        return { txHash: result.txHash };
      } catch (error) {
        console.error(`Failed to process auction ${auctionId}:`, error);
        throw error;
      }
    }
  },
  {
    connection: client,
    concurrency: 5,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
);

console.log("Worker initialized:", worker.isRunning());
worker.on("ready", () => console.log("Worker ready to process jobs"));

auctionQueue.on("waiting", (job) => {
  console.log("Job waiting:", job.id);
});

worker.on("active", (job) => {
  console.log("Job started:", job.id);
});

worker.on("stalled", (jobId) => {
  console.log("Job stalled:", jobId);
});
