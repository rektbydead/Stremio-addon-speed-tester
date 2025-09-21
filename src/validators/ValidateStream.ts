import WebTorrent from "webtorrent";
import {ValidatedMagnetStream} from "@/types/ValidatedMagnetStream";
import {MagnetStream} from "@/types/MagnetStream";
import {ApplicationConfiguration} from "@/types/ApplicationConfiguration";
import {testDownloadSpeed} from "../utils/TorrentTester";

async function evaluateNext(queue: MagnetStream[], client: WebTorrent, applicationConfig: ApplicationConfiguration, results: any[]) {
	console.log(`Remaining ${queue.length} magnets. `)

	const magnet: MagnetStream | undefined = queue.shift()
    if (magnet === undefined) return results

	const data: any = await testDownloadSpeed(client, applicationConfig, magnet)

	results.push({
		...magnet,
		...data
	})

	return await evaluateNext(queue, client, applicationConfig, results)
}

export async function obtainValidMagnets(applicationConfig: ApplicationConfiguration, magnets: MagnetStream[]): Promise<ValidatedMagnetStream[]> {
	const queue: MagnetStream[] = [...magnets]
	const results: ValidatedMagnetStream[] = []

	const promiseList: Promise<any>[] = []

	/* Start maximum of 'applicationConfig.maxConcurrentTests' test concurrently */
	for (let i = 0; i < queue.length && i < applicationConfig.maxConcurrentTests; i++) {
		const client: WebTorrent = new WebTorrent({dht: false, lsd: false, webSeeds: false,utp: false})

		const promise = evaluateNext(queue, client, applicationConfig, []).then(data => {
			results.push(...data)
			client.destroy()
		})

		promiseList.push(promise)
	}

	await Promise.all(promiseList)

	return results.filter(stream =>
		stream.speed >= applicationConfig.speedThreshold &&
		stream.peers >= applicationConfig.minPeersForValidTest
	).sort((a, b) => b.speed - a.speed)
}