import WebTorrent from "webtorrent";
import {MagnetStream} from "@/types/MagnetStream";
import {ApplicationConfiguration} from "@/types/ApplicationConfiguration";
import {testDownloadSpeed} from "@/utils/TorrentTester";

export async function getMeasuredStream(applicationConfig: ApplicationConfiguration, magnet: MagnetStream) {
    const client = new WebTorrent({dht: false, lsd: false, webSeeds: false,utp: false})
    const data: any = await testDownloadSpeed(client, applicationConfig, magnet)
    client.destroy()

	return {
		...magnet,
		...data
	}
}