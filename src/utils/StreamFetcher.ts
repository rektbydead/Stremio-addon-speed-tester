import axios from "axios";
import {TorrentioResponse} from "@/types/TorrentioResponse.js";
import {ShowType} from "@/types/ShowType";

export async function fetchStreams(type: ShowType, id: string): Promise<TorrentioResponse> {
	const url = `https://torrentio.strem.fun/stream/${type}/${id}.json`
	console.log("Fetching from:", url)

	const { data } = await axios.get<TorrentioResponse>(url)
	return data
}