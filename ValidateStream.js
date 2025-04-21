import webtorrent from "webtorrent";

const trackerListPromise = await fetch("https://raw.githubusercontent.com/ngosang/trackerslist/refs/heads/master/trackers_best.txt")
const unformattedList =  await trackerListPromise.text()
const trackerList = unformattedList.replaceAll("\n\n", "\n").split("\n")
const trackerListWithoutUDP = trackerList.filter((value) => value.startsWith("udp://") === false && value !== "")

async function testDownloadSpeed(client, testDuration, magnet) {
	let totalBytes = 0
	let peerCount = 0
	let startTime = 0

	return new Promise((resolve) => {
		const torrent = client.add(magnet, {
			destroyStoreOnDestroy: true,
			announce: trackerListWithoutUDP,
		})

		setTimeout(() => {
			resolve({ speed: totalBytes / (1024 * 1024), peers: peerCount })
		}, testDuration);

		torrent.on('download', (bytes) => {
			if (startTime === 0) {
				startTime = Date.now()
			}

			totalBytes += bytes
		})

		torrent.on('error', () => {
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
		if (queue.length > 0) await new Promise(resolve => setTimeout(resolve, 1000));
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