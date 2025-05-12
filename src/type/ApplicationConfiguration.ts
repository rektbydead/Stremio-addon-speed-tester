export interface ApplicationConfiguration {
    maxConcurrentTests: number,
    testDuration: number,
    minPeersForValidTest: number,
    speedThreshold: number,
    batchTimeout: number,
    streamExpirationTime: number,
}