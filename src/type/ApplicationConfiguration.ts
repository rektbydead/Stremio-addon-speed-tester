export interface ApplicationConfiguration {
    maxConcurrentTests: number,
    testDuration: number,
    downloadStartedDuration: number,
    minPeersForValidTest: number,
    speedThreshold: number,
    batchTimeout: number,
    streamExpirationTime: number,
}