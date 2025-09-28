import axios from "axios";
import {Stream, TorrentioResponse} from "@/types/TorrentioResponse.js";
import {RedisWrapper} from "@/wrappers/RedisWrapper";
import {Formatter} from "@/formatters/Formatter";

export default class StreamFetcher {
    private static redis = new RedisWrapper()


    public static async fetch(type: string, id: string): Promise<TorrentioResponse> {
        const formattedKey = Formatter.formatTorrentioKey(type, id)
        const cachedTorrentioMagnets = await this.redis.get(formattedKey)
        if (cachedTorrentioMagnets) return cachedTorrentioMagnets

        const url = `https://torrentio.strem.fun/stream/${type}/${id}.json`
        const { data } = await axios.get<TorrentioResponse>(url)

        data.streams = data.streams.map((stream) => this.extractTorrentInfo(stream))

        await this.redis.save(formattedKey, data, 60 * 60 * 24 * 7)
        return data
    }

    private static extractTorrentInfo(stream: Stream) {
        const info = {
            peers: 0,
            size: "",
        };

        const peersMatch = stream.title.match(/👤\s*(\d+)/);
        if (peersMatch) {
            info.peers = parseInt(peersMatch[1], 10);
        }

        const sizeMatch = stream.title.match(/💾\s*([\d.,]+\s*(?:GB|MB))/i);
        if (sizeMatch) {
            info.size = sizeMatch[1];
        }

        return {
            ...stream,
            ...info
        }
    }
}