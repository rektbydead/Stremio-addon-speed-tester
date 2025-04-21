import WebTorrent from 'webtorrent'

const testDuration = 7000 // 7 seconds timeout

async function testTorrentSpeed(magnetURI) {
  return new Promise((resolve) => {
    const client = new WebTorrent()
    const torrent = client.add(magnetURI, { path: './temp' })

    let maxSpeed = 0

    torrent.on('download', () => {
      maxSpeed = Math.max(maxSpeed, torrent.downloadSpeed)
    })

    torrent.on('error', err => {
      torrent.destroy()
      client.destroy()
      resolve({ magnetURI, speed: 0, error: err.message })
    })

    setTimeout(() => {
      const speedKBps = (maxSpeed / 1024).toFixed(2)
      torrent.destroy()
      client.destroy()
      resolve({ magnetURI, speed: parseFloat(speedKBps) })
    }, testDuration)
  })
}

export async function testTorrents(magnetLinks) {
  const results = []
  for (const link of magnetLinks) {
    const result = await testTorrentSpeed(link)
    results.push(result)
  }

  return results.sort((a, b) => b.speed - a.speed)
}