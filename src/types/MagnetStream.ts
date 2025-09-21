import {Stream} from "@/types/TorrentioResponse";

export interface MagnetStream extends Stream {
    magnet: string,
}