import {RedisWrapper} from "@/wrappers/RedisWrapper";
import {Formatter} from "@/formatters/Formatter";
import {TorrentioResponse} from "@/types/TorrentioResponse";
import {fetchStreams} from "@/utils/StreamFetcher";
import {MagnetStream} from "@/types/MagnetStream";
import {constructMagnet} from "@/utils/MagnetConstructor";
import {obtainValidMagnets} from "@/validators/ValidateStream";
import {APPLICATION_CONFIG} from "@/configuration/configuration";

export class StreamService {
    private static redis = new RedisWrapper()

    public async getStream(type: string, id: string) {
        const key: string = Formatter.formatStreamKey(type, id)

        const value = await StreamService.redis.get(key)
        if (value) return { streams: value }

        try {
            const fetchedStreams: TorrentioResponse = await fetchStreams(type, id)
            const streamsWithMagnets: MagnetStream[] = fetchedStreams.streams.map((stream) => constructMagnet(stream))
            const validStreams = await obtainValidMagnets(APPLICATION_CONFIG, streamsWithMagnets)
            await StreamService.redis.save(key, validStreams)
            return validStreams
        } catch (error) {
            return []
        }
    }
}