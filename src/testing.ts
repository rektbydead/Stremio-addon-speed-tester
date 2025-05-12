import {fetchStreams} from "./utils/StreamFetcher.ts";
import {constructMagnet} from "./utils/MagnetConstructor.ts";
import {obtainValidMagnets} from "./validator/ValidateStream.ts";

const CONFIG = {
	maxConcurrentTests: 25,
	testDuration: 5000,
	minPeersForValidTest: 1,
	speedThreshold: 0.00000000000000001,
}

const fetchedStreams = await fetchStreams("movie", "tt30988739")
const streamsWithMagnets = fetchedStreams.map((stream) => constructMagnet(stream))

console.log(`Starting to validate ${streamsWithMagnets.length} magnets.`)
const validMagnets = await obtainValidMagnets(
	CONFIG.maxConcurrentTests,
	CONFIG.testDuration,
	CONFIG.speedThreshold,
	CONFIG.minPeersForValidTest,
	streamsWithMagnets
)

console.log(`Total of valid: ${validMagnets.length} magnets`)