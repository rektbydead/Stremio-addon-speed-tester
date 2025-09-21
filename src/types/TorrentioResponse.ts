export interface TorrentioResponse {
    streams: Stream[];
    "cacheMaxAge": number,
    "staleRevalidate": number,
    "staleError": number
}

export interface BehaviourHint {
    bingeGroup?: string;
    filename?: string;
}

export interface Stream {
    name: string,
    title: string,
    infoHash: string,
    fileIdx: number,
    behaviorHints: BehaviourHint,
    sources?: string[]
}