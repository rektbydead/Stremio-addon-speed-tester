import webtorrent from "webtorrent";

async function testDownloadSpeed(client, testDuration, magnet) {
	let totalBytes = 0
	let peerCount = 0
	let startTime = 0

	return new Promise((resolve) => {
		const torrent = client.add(magnet, {
			destroyStoreOnDestroy: true
		})

		const cleanup = () => {
			torrent.destroy()
		};

		setTimeout(() => {
			cleanup()
			resolve({ speed: totalBytes / (1024 * 1024), peers: peerCount })
		}, testDuration);

		torrent.on('download', (bytes) => {
			if (startTime === 0) {
				startTime = Date.now()
			}

			totalBytes += bytes
		})

		torrent.on('error', () => {
			cleanup()
			resolve({ speed: totalBytes / (1024 * 1024), peers: peerCount })
		})

		torrent.on('wire', () => {
			peerCount = torrent.wires.length
		})
	})
}

export async function obtainValidMagnets(maxConcurrentTests, testDuration, speedThreshold, minPeersForValidTest, magnets) {
	const queue = [...magnets]
	const results = []

	const client = new webtorrent()
	while (queue.length > 0) {
		const batch = queue.splice(0, maxConcurrentTests)

		const batchResults = await Promise.all(
			batch.map(magnet => testDownloadSpeed(client, testDuration, magnet))
		)

		batchResults.forEach((result, i) => {
			results.push({
				...batch[i],
				...result
			})
		})

		console.log(`Batch complete - Missing ${queue.length} magnets`)
		setInterval(() => {}, 100)
	}

	client.destroy()

	return results.filter(stream =>
		stream.speed >= speedThreshold &&
		stream.peers >= minPeersForValidTest
	).sort((a, b) => b.speed - a.speed)
}