import {MagnetStream} from "./MagnetStream";

export interface ValidatedMagnetStream extends MagnetStream {
    speed: number,
    peers: number,
}