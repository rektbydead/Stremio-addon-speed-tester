import {Stream} from "./TorrentioResponse";

export interface MagnetStream extends Stream {
    magnet: string,
}