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
  batchTimeout: 100
}

const streamHandler = async ({ type, id }) => {
  try {
    const fetchedStreams = await fetchStreams(type, id)
    const streamsWithMagnets = fetchedStreams.map((stream) => constructMagnet(stream))

    console.log(`Starting to validate ${streamsWithMagnets.length} magnets.`)
    const validMagnets = await obtainValidMagnets(
        CONFIG.maxConcurrentTests,
        CONFIG.testDuration,
        CONFIG.speedThreshold,
        CONFIG.minPeersForValidTest,
        CONFIG.batchTimeout,
        streamsWithMagnets
    )

    console.log(`Total of number of valid magnets ${validMagnets.length}:`)
    console.log(validMagnets.map((magnet) => {return { speed: magnet.speed, peers: magnet.peers }}))

    return { streams: validMagnets }
  } catch (error) {
    console.error("Error in streamHandler:", error)
    return { streams: [] }
  }
}

builder.defineStreamHandler(streamHandler)

export { streamHandler, builder }