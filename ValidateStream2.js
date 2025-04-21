import WebTorrent from "webtorrent";

// Cache for working peers (magnet -> peer list)
// const peerCache = new Map();

// Optimized tracker list processing
const getTrackers = async () => {
	const response = await fetch("https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_all.txt");
	const text = await response.text();
	return text.split('\n')
		.filter(t => t.trim() && !t.startsWith('udp://'))
		.slice(0, 15); // Top 15 TCP trackers
};

const TRACKERS = await getTrackers();

async function testDownloadSpeed(client, testDuration, magnet) {
	const cachedPeers = [] //peerCache.get(magnet) || [];

	console.log(cachedPeers.length ? { addPeers: cachedPeers } : {})

	return new Promise((resolve) => {
		const startTime = Date.now();
		let totalBytes = 0;
		let peerCount = 0;

		const torrent = client.add(magnet, {
			announce: TRACKERS,
			destroyStoreOnDestroy: true,
			// Use cached peers if available
			rtConfig: cachedPeers.length ? { addPeers: cachedPeers } : {}
		});

		const cleanup = () => {
			if (torrent.destroyed) return;

			// Cache working peers before destroying
			const workingPeers = torrent.wires.map(w => w.peer);
			if (workingPeers.length > 2) {
				peerCache.set(magnet, workingPeers);
			}

			torrent.destroy();

			const durationSec = (Date.now() - startTime) / 1000;
			const speed = durationSec > 0 ? (totalBytes / (1024 * 1024)) / durationSec : 0;
			resolve({ speed, peers: peerCount });
		};

		const timer = setTimeout(cleanup, testDuration);

		torrent.on('download', bytes => {
			totalBytes += bytes;
		});

		torrent.on('wire', wire => {
			peerCount = torrent.wires.length;
		});

		torrent.on('error', cleanup);
	});
}

export async function obtainValidMagnets(maxConcurrentTests, testDuration, speedThreshold, minPeers, magnets) {
	const results = [];
	const globalConnectionLimit = 30; // Total connections across all clients

	// Process in smart batches
	for (let i = 0; i < magnets.length; i += maxConcurrentTests) {
		const batch = magnets.slice(i, i + maxConcurrentTests);
		const client = new WebTorrent({
			maxConns: Math.floor(globalConnectionLimit / maxConcurrentTests),
			dht: false,
			lsd: false,
			webSeeds: false,
			utp: false // Force TCP only
		});

		try {
			const batchResults = await Promise.all(
				batch.map(magnet => testDownloadSpeed(client, testDuration, magnet))
			);

			batchResults.forEach((result, idx) => {
				results.push({ magnet: batch[idx], ...result });
			});

			console.log(`Batch ${i/maxConcurrentTests + 1} complete - ${results.length}/${magnets.length} tested`);
		} finally {
			await new Promise(resolve => client.destroy(resolve));
			await new Promise(resolve => setTimeout(resolve, 1500)); // Throttle
		}
	}

	const a = results
		.filter(r => r.speed >= speedThreshold && r.peers >= minPeers)
		.sort((a, b) => b.speed - a.speed)

	console.log(a)

	return results
		.filter(r => r.speed >= speedThreshold && r.peers >= minPeers)
		.sort((a, b) => b.speed - a.speed);
}