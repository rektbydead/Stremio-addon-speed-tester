import axios from "axios";
import {TorrentioResponse} from "../type/TorrentioResponse.js";

export async function fetchStreams(type: Type, id: string): Promise<TorrentioResponse> {
	const url = `https://torrentio.strem.fun/stream/${type}/${id}.json`
	console.log("Fetching from:", url)

	const { data } = await axios.get<TorrentioResponse>(url)
	return data
}