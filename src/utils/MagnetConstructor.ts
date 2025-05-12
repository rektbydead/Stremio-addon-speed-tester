import {Stream} from "../type/TorrentioResponse";

export function constructMagnet(stream: Stream) {
	const infoHash = stream.infoHash
	const filename = stream.behaviorHints.filename || stream.title.split('\n')[0]

	const encodedFilename = encodeURIComponent(filename)
	let magnet = `magnet:?xt=urn:btih:${infoHash}&dn=${encodedFilename}`

	if (stream.sources) {
		const trackers = stream.sources
			.filter(src => src.startsWith('tracker:'))
			.map(src => src.substring(8))

		trackers.slice(0, 10).forEach(tracker => {
			magnet += `&tr=${encodeURIComponent(tracker)}`
		})
	}

	return {
		...stream,
		magnet,
	}
}