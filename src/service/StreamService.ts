import {RedisWrapper} from "@/wrapper/RedisWrapper";
import {Formatter} from "@/formatter/Formatter";
import {TorrentioResponse} from "@/type/TorrentioResponse";
import {fetchStreams} from "@/utils/StreamFetcher";
import {MagnetStream} from "@/type/MagnetStream";
import {constructMagnet} from "@/utils/MagnetConstructor";
import {obtainValidMagnets} from "@/validator/ValidateStream";
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