import { addonBuilder } from 'stremio-addon-sdk'
import {obtainValidMagnets} from "./validator/ValidateStream";
import {fetchStreams} from "./utils/StreamFetcher";
import {constructMagnet} from "./utils/MagnetConstructor";
import {APPLICATION_CONFIG} from "./configuration/configuration";
import {TorrentioResponse} from "./type/TorrentioResponse";
import {MagnetStream} from "./type/MagnetStream";
import {RedisWrapper} from "@/wrapper/RedisWrapper";
import {Redis} from "@/Redis";

const builder = new addonBuilder({
	id: 'org.speed.torrent',
	version: '1.0.0',
	name: 'Smart Torrent Selector',
	description: 'Ranks torrents by actual download speed before streaming',
	resources: ['stream'],
	types: ['movie', 'series'],
	catalogs: [],
})

const CACHED_STREAMS = new Map()

setInterval(() => {
	CACHED_STREAMS.forEach((id, stream) => {
		const isExpired = (Date.now() - stream.date) > APPLICATION_CONFIG.streamExpirationTime
		if (isExpired === true) CACHED_STREAMS.delete(id)
	})
}, 20000)

const streamHandler = async ({ type, id }) => {
	try {
		if (CACHED_STREAMS.has(id)) {
			const stream = CACHED_STREAMS.get(id)
			const isExpired = (Date.now() - stream.date) > APPLICATION_CONFIG.streamExpirationTime

			if (isExpired === false) {
				return CACHED_STREAMS.get(id)
			}
		}

		const fetchedStreams: TorrentioResponse = await fetchStreams(type, id)
		const streamsWithMagnets: MagnetStream[] = fetchedStreams.streams.map((stream) => constructMagnet(stream))

		console.log(`Starting to validate ${streamsWithMagnets.length} magnets.`)
		const validStreams = await obtainValidMagnets(
			APPLICATION_CONFIG,
			streamsWithMagnets
		)

		CACHED_STREAMS.set(id, {
			date: Date.now(),
			streams: validStreams
		})

		console.log(`Total of number of valid streams: ${validStreams.length}`)
		return { streams: validStreams }
	} catch (error) {
		console.error("Error in streamHandler:", error)
		return { streams: [] }
	}
}

builder.defineStreamHandler(streamHandler)

export { streamHandler, builder }