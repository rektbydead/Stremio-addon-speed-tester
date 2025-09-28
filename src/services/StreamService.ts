import {RedisWrapper} from "@/wrappers/RedisWrapper";
import {Formatter} from "@/formatters/Formatter";
import {TorrentioResponse} from "@/types/TorrentioResponse";
import StreamFetcher from "@/utils/StreamFetcher";
import {MagnetStream} from "@/types/MagnetStream";
import {constructMagnet} from "@/utils/MagnetConstructor";
import {APPLICATION_CONFIG} from "@/configuration/configuration";
import {Stream} from "stremio-addon-sdk";
import testQueue, {testQueueEvents} from "@/bullmq/queues/streamTaskQueue";
import {Job} from "bullmq";

export class StreamService {
    private static redis = new RedisWrapper()

    public async getStream(type: string, id: string) {
        const key: string = Formatter.formatStreamKey(type, id)
        const cachedStreams: Stream[] = await StreamService.redis.get(key) ?? []

        if (cachedStreams.length > 0) {
            return cachedStreams
        }

        const fetchedStreams: TorrentioResponse = await StreamFetcher.fetch(type, id)
        const streamsOrderedByPeers = fetchedStreams.streams.sort((streamA, streamB) => {
                return (streamB.peers ?? 0) - (streamA.peers ?? 0)
            }
        ).slice(0, 15)

        const streamsWithMagnets: MagnetStream[] = streamsOrderedByPeers.map((stream) => constructMagnet(stream))
        const validStreams= await this.checkValidStreams(streamsWithMagnets)
        await StreamService.redis.save(key, validStreams)
        return validStreams
    }

    private async checkValidStreams(magnets: MagnetStream[]) {
        const jobPromiseList: Promise<Job>[] = []

        magnets.forEach(magnet => {
            jobPromiseList.push(
                testQueue.add("testQueue", magnet)
            )
        })

        const results = []
        for (const jobPromise of jobPromiseList) {
            const job = await jobPromise
            const data = await job.waitUntilFinished(testQueueEvents)
            results.push(data)
        }

        return results.filter(stream =>
            stream.speed >= APPLICATION_CONFIG.speedThreshold &&
            stream.peers >= APPLICATION_CONFIG.minPeersForValidTest
        ).sort((a, b) => b.speed - a.speed)
    }
}