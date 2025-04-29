import WebTorrent from "webtorrent";
import MemoryChunkStore from "memory-chunk-store";


const getTrackers = async () => {
	const response = await fetch("https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_all.txt")
	const text = await response.text()
	return text.split('\n')
		.filter(t => t.trim() && !t.startsWith('udp://'))
		.slice(0, 15)
};

const TRACKERS = await getTrackers()

async function testDownloadSpeed(client, testDuration, magnet) {
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

export async function obtainValidMagnets(maxConcurrentTests, testDuration, speedThreshold, minPeersForValidTest, batchTimeout, magnets) {
	const queue = [...magnets]
	const results = []

	while (queue.length > 0) {

		const client = new WebTorrent({
			dht: false,
			lsd: false,
			webSeeds: false,
			utp: false
		})

		client.setMaxListeners(maxConcurrentTests)

		const batch = queue.splice(0, maxConcurrentTests)

		try {
			const batchResults = await Promise.all(
				batch.map(magnet => testDownloadSpeed(client, testDuration, magnet))
			)

			batchResults.forEach((result, i) => {
				results.push({
					...batch[i],
					...result
				})
			})

			if (queue.length > 0) {
				console.log(`Batch complete - Missing ${queue.length} magnets`)
			}
		} finally {
			await new Promise(resolve => client.destroy(resolve))
			if (queue.length > 0) {
				await new Promise(resolve => setTimeout(resolve, batchTimeout))
			}
		}
	}

	return results.filter(stream =>
		stream.speed >= speedThreshold &&
		stream.peers >= minPeersForValidTest
	).sort((a, b) => b.speed - a.speed)
}

/*
The router crashes

function testing() {

	const promises = []
	const batchesList = []

	while (queue.length > 0) {
		const client = new webtorrent()
		const batch = queue.splice(0, maxConcurrentTests)
		batchesList.push(batch)

		promises.push(
			Promise.all(batch.map((magnet) => testDownloadSpeed(client, testDuration, magnet)))
		)
	}

	const results = []

	for (let i = 0; i < promises.length; i++) {
		const batchResults = await promises[i]
		console.log(batchResults)
		batchResults.forEach((result, i) => {
			results.push({
				...batchesList[i],
				...result
			})
		})
	}
}
*/