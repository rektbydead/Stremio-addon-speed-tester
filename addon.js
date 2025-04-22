import { addonBuilder } from 'stremio-addon-sdk'
import {obtainValidMagnets} from "./ValidateStream.js";
import {fetchStreams} from "./StreamFetcher.js";
import {constructMagnet} from "./MagnetConstructor.js";

const builder = new addonBuilder({
	id: 'org.speed.torrent',
	version: '1.0.0',
	name: 'Smart Torrent Selector',
	description: 'Ranks torrents by actual download speed before streaming',
	resources: ['stream'],
	types: ['movie', 'series'],
	catalogs: [],
})

const CONFIG = {
	maxConcurrentTests: 25,
	testDuration: 5000,
	minPeersForValidTest: 1,
	speedThreshold: 0.00000000000000001,
	batchTimeout: 100,
	streamExpirationTime: 1000 * 60 * 30, // 30 minutes
}

const CACHED_STREAMS = new Map()

setInterval(() => {
	CACHED_STREAMS.forEach((id, stream) => {
		const isExpired = (Date.now() - stream.date) > CONFIG.streamExpirationTime
		if (isExpired === true) CACHED_STREAMS.delete(id)
	})
}, 20000)

const streamHandler = async ({ type, id }) => {
	try {
		if (CACHED_STREAMS.has(id)) {
			const stream = CACHED_STREAMS.get(id)
			const isExpired = (Date.now() - stream.date) > CONFIG.streamExpirationTime

			if (isExpired === false) {
				return CACHED_STREAMS.get(id)
			}
		}

		const fetchedStreams = await fetchStreams(type, id)
		const streamsWithMagnets = fetchedStreams.map((stream) => constructMagnet(stream))

		console.log(`Starting to validate ${streamsWithMagnets.length} magnets.`)
		const validStreams = await obtainValidMagnets(
			CONFIG.maxConcurrentTests,
			CONFIG.testDuration,
			CONFIG.speedThreshold,
			CONFIG.minPeersForValidTest,
			CONFIG.batchTimeout,
			streamsWithMagnets
		)

		CACHED_STREAMS.set(id, {
			date: Date.now(),
			streams: validStreams
		})

		console.log(`Total of number of valid streams ${validStreams.length}:`)
		return { streams: validStreams }
	} catch (error) {
		console.error("Error in streamHandler:", error)
		return { streams: [] }
	}
}

builder.defineStreamHandler(streamHandler)

export { streamHandler, builder }