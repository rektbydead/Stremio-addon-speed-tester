import {addonBuilder} from 'stremio-addon-sdk'
import {StreamService} from "@/services/StreamService";
import testQueue from "@/bullmq/queues/streamTaskQueue";

const builder = new addonBuilder({
	id: 'org.speed.torrent',
	version: '1.0.0',
	name: 'Smart Torrent Selector',
	description: 'Ranks torrents by actual download speed before streaming',
	resources: ['stream'],
	types: ['movie', 'series'],
	catalogs: [],
})

const streamService = new StreamService()

const streamHandler = async ({ type, id }: StreamParams) => {
    // const streams = await streamService.getStream(type, id)

    for (let i = 0; i < 100; i++) {
        testQueue.add("carai", {type, id}, {
            removeOnComplete: true,
            removeOnFail: true,
        })
    }

    console.log("ACABOU CARALHO")
    return { streams: [] }
}

builder.defineStreamHandler(streamHandler)

export { streamHandler, builder }