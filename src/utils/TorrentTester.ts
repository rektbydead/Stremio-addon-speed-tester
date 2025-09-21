import WebTorrent from "webtorrent"
import MemoryChunkStore from "memory-chunk-store"
import {MagnetStream} from "@/types/MagnetStream"
import {getTrackers} from "./TrackerObtainer"
import {ApplicationConfiguration} from "@/types/ApplicationConfiguration"

export async function testDownloadSpeed(client: WebTorrent, applicationConfig: ApplicationConfiguration, magnetStream: MagnetStream) {
    let totalBytes = 0
    let peerCount = 0
    let startTime = Date.now()

    const generalTrackers = await getTrackers()
    // const magnetTrackers = getTrackerFromSources(magnetStream.sources ?? [])
    // console.log([...generalTrackers, ...magnetTrackers])

    const torrent = client.add(magnetStream.magnet, {
        destroyStoreOnDestroy: true,
        store: MemoryChunkStore,
        announce: generalTrackers,
        private: true,
        storeCacheSlots: 0,
        skipVerify: true,
        alwaysChokeSeeders: false
    })

    return new Promise((resolve) => {
        const maximumTestDuration = setTimeout(exit, applicationConfig.testDuration)
        const minimumDownloadAfterDuration = setTimeout(checkDownloadStarted, applicationConfig.downloadStartedDuration)

        function exit()  {
            if (torrent.destroyed === false) torrent.destroy()

            clearTimeout(maximumTestDuration)
            clearTimeout(minimumDownloadAfterDuration)
            const duration = (Date.now() - startTime) / 1000
            const speed = (totalBytes / (1024 * 1024) / duration).toFixed(3)
            return resolve({ speed: speed, peers: peerCount })
        }

        function checkDownloadStarted() {
            if (totalBytes === 0) {
                console.log(`Cancelling magnet: ${magnetStream.infoHash}`)
                clearTimeout(maximumTestDuration)
                return exit()
            }
        }

        torrent.on('download', (bytes) => {
            totalBytes += bytes

            /* Download maximum of 'maximumDownloadedMegaBytes' Megabytes */
            const megabytes = totalBytes / (1024 * 1024)
            if (megabytes >= applicationConfig.maximumDownloadedMegaBytes) {
                return exit()
            }
        })

        torrent.on('wire', () => {
            peerCount = torrent.wires.length
        })

        torrent.on('error', (err) => {
            clearTimeout(maximumTestDuration)
            clearTimeout(minimumDownloadAfterDuration)
            resolve({ speed: 0, peers: 0, error: err.message })
        })
    })
}