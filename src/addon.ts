import { addonBuilder } from 'stremio-addon-sdk'
import {obtainValidMagnets} from "./validator/ValidateStream";
import {fetchStreams} from "./utils/StreamFetcher";
import {constructMagnet} from "./utils/MagnetConstructor";
import {APPLICATION_CONFIG} from "./configuration/configuration";
import {TorrentioResponse} from "./type/TorrentioResponse";
import {MagnetStream} from "./type/MagnetStream";
import {RedisWrapper} from "./wrapper/RedisWrapper";
import {Formatter} from "./formatter/Formatter";

const builder = new addonBuilder({
	id: 'org.speed.torrent',
	version: '1.0.0',
	name: 'Smart Torrent Selector',
	description: 'Ranks torrents by actual download speed before streaming',
	resources: ['stream'],
	types: ['movie', 'series'],
	catalogs: [],
})

const streamHandler = async ({ type, id }: StreamParams) => {
	try {
        const redis = new RedisWrapper()
        const key: string = Formatter.formatStreamKey(type, id)

        if (await redis.has(key)) {
            const cachedStreams = await redis.get(key)
            return { streams: cachedStreams }
        }

		const fetchedStreams: TorrentioResponse = await fetchStreams(type, id)
		const streamsWithMagnets: MagnetStream[] = fetchedStreams.streams.map((stream) => constructMagnet(stream))

		console.log(`Starting to validate ${streamsWithMagnets.length} magnets.`)
		const validStreams = await obtainValidMagnets(
			APPLICATION_CONFIG,
			streamsWithMagnets
		)

        await redis.save(key, validStreams)

		console.log(`Total of number of valid streams: ${validStreams.length}`)
		return { streams: validStreams }
	} catch (error) {
		console.error("Error in streamHandler:", error)
		return { streams: [] }
	}
}

builder.defineStreamHandler(streamHandler)

export { streamHandler, builder }