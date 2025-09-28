import { Worker } from 'bullmq'
import Redis from "ioredis";
import testQueue from "@/bullmq/queues/streamTaskQueue";

const connection = new Redis({ host: "redis", port: 6379, maxRetriesPerRequest: null });

const worker = new Worker("testQueue", async (job) => {
    await new Promise(resolve =>
        setTimeout(resolve, 1000)
    )

    console.log("Queue length: " + JSON.stringify(await testQueue.getJobCounts()))
    console.log(`🔹 Processing job: ${job.id} - ${job.data.message}`);
}, { connection: connection });

worker.on("completed", (job) => {
    console.log(`✅ Job ${JSON.stringify(job)} completed`)
})

worker.on("failed", (job, err) => {
    console.log(`❌ Job ${JSON.stringify(job)} failed: ${err.message}`)
})