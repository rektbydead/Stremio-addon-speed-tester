export async function fetchStreams(type, id) {
	const url = `https://torrentio.strem.fun/stream/${type}/${id}.json`
	console.log("Fetching from:", url)

	const res = await fetch(url)
	const json = await res.json()
	return json.streams
}