import WebTorrent from "webtorrent";
import MemoryChunkStore from "memory-chunk-store";
import {ValidatedMagnetStream} from "../type/ValidatedMagnetStream";
import {MagnetStream} from "../type/MagnetStream";
import {ApplicationConfiguration} from "../type/ApplicationConfiguration";

const getTrackers = async () => {
	const response = await fetch("https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_all.txt")
	const text = await response.text()
	return text.split('\n')
		.filter(t => t.trim() && !t.startsWith('udp://'))
		.slice(0, 15)
};

const TRACKERS = await getTrackers()

async function testDownloadSpeed(client: WebTorrent, testDuration: number, magnet: MagnetStream) {
	let totalBytes = 0
	let peerCount = 0
	let startTime = 0

	return new Promise((resolve) => {
		const torrent = client.add(magnet, {
			destroyStoreOnDestroy: true,
			store: MemoryChunkStore,
			announce: TRACKERS,
			path: false
		})

		const exit = () => {
			try {
				if (torrent.destroyed === false) {
					torrent.destroy()
				}

				const duration = (Date.now() - startTime) / 1000
				const speed = (totalBytes / (1024 * 1024) / duration).toFixed(3)
				resolve({ speed: speed, peers: peerCount })
			} catch (err) {
                resolve({ speed: 0, peers: 0, error: err.message });
            }
		}

		const timer = setTimeout(exit, testDuration);

		torrent.on('download', (bytes) => {
			if (startTime === 0) {
				startTime = Date.now()
			}

			totalBytes += bytes
		})

		torrent.on('error', (err) => {
			clearTimeout(timer);
			resolve({ speed: 0, peers: 0, error: err.message });
		})

		torrent.on('wire', () => {
			peerCount = torrent.wires.length
		})
	})
}

async function evaluateNext(queue: MagnetStream[], client: WebTorrent, applicationConfig: ApplicationConfiguration, results: any[]) {
	if (queue.length === 0) { return results }

	console.log(`Remaining ${queue.length} magnets. `)

	const magnet: MagnetStream = queue.shift()
	const data: any = await testDownloadSpeed(client, applicationConfig.testDuration, magnet)
	results.push(data)

	return await evaluateNext(queue, client, applicationConfig, results)
}

export async function obtainValidMagnets(applicationConfig: ApplicationConfiguration, magnets: MagnetStream[]): Promise<ValidatedMagnetStream[]> {
	const queue: MagnetStream[] = [...magnets]
	const results: ValidatedMagnetStream[] = []

	const promiseList: Promise<any>[] = []
	/* Start 5 test maximum concurrently */
	for (let i = 0; i < queue.length && i < applicationConfig.maxConcurrentTests; i++) {
		const client = new WebTorrent({dht: false, lsd: false, webSeeds: false,utp: false})

		const promise = evaluateNext(queue, client, applicationConfig, []).then(data => {
			results.push(...data)
		})

		promiseList.push(promise)
	}

	await Promise.all(promiseList)

	return results.filter(stream =>
		stream.speed >= applicationConfig.speedThreshold &&
		stream.peers >= applicationConfig.minPeersForValidTest
	).sort((a, b) => b.speed - a.speed)
}