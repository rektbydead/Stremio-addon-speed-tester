import {Job, Worker} from 'bullmq'
import Redis from "ioredis";
import {APPLICATION_CONFIG} from "@/configuration/configuration";
import WebTorrent from "webtorrent";
import {testDownloadSpeed} from "@/utils/TorrentTester";
import {MagnetStream} from "@/types/MagnetStream";

const connection = new Redis({ host: "redis", port: 6379, maxRetriesPerRequest: null });

const worker = new Worker("testQueue", async (job: Job<MagnetStream>) => {
    const client = new WebTorrent({dht: false, lsd: false, webSeeds: false,utp: false})
    const data: any = await testDownloadSpeed(client, APPLICATION_CONFIG, job.data)
    client.destroy()

	return {
		...job.data,
		...data
	}
}, { connection: connection });

worker.on("completed", (job) => {
    console.log(`✅ Job completed`)
})

worker.on("failed", (job, err) => {
    console.log()
    console.log(`❌ Job failed`)
})