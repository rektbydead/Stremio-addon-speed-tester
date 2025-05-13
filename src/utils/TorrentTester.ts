import WebTorrent from "webtorrent";
import {MagnetStream} from "../type/MagnetStream";
import {getTrackers} from "./TrackerObtainer";
import {ApplicationConfiguration} from "../type/ApplicationConfiguration";
import {bytesToMB} from "./SizeConvertion";

export async function testDownloadSpeed(client: WebTorrent, applicationConfig: ApplicationConfiguration, magnetStream: MagnetStream) {
    let totalBytes = 0
    let peerCount = 0
    let startTime = Date.now()

    const torrent = client.add(magnetStream.magnet, {
        destroyStoreOnDestroy: true,
        announce: getTrackers(),
        path: false
    })

    return new Promise((resolve) => {
        const maximumTestDuration = setTimeout(exit, applicationConfig.testDuration);
        const minimumDownloadAfterDuration = setTimeout(checkDownloadStarted, applicationConfig.testDuration);

        function exit()  {
            if (torrent.destroyed === false) torrent.destroy()

            const duration = (Date.now() - startTime) / 1000
            const speed = (totalBytes / (1024 * 1024) / duration).toFixed(3)
            return resolve({ duration, speed })
        }

        function checkDownloadStarted() {
            console.log(`Downloaded ${totalBytes} bytes.`)
            if (totalBytes === 0) {
                console.log("No bytes detected, cancelling.")
                clearTimeout(maximumTestDuration)
                return exit()
            }
        }

        torrent.on('download', (bytes) => {
            totalBytes += bytes

            /* Download maximum of 'maximumDownloadedMegaBytes' Megabytes */
            const megabytes = bytesToMB(totalBytes)
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