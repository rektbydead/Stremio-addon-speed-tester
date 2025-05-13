import {ApplicationConfiguration} from "../type/ApplicationConfiguration";

export const APPLICATION_CONFIG: ApplicationConfiguration = {
	maxConcurrentTests: 5,
	testDuration: 5000,
	downloadStartedDuration: 4000,
	maximumDownloadedMegaBytes: 5,
	minPeersForValidTest: 1,
	speedThreshold: 0.00000000000000001,
	batchTimeout: 100,
	streamExpirationTime: 1000 * 60 * 30, // 30 minutes
}