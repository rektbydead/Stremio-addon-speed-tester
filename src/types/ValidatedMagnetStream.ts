import {MagnetStream} from "@/types/MagnetStream";

export interface ValidatedMagnetStream extends MagnetStream {
    speed: number,
    peers: number,
}