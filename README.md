# 📺 Smart Torrent Selector
A Stremio addon that ranks torrents by actual download speed before streaming, ensuring you get the best possible performance.

## 🔥 Features
- **Real-time Speed Testing**: Tests torrent download speeds before offering streams.
- **Efficient Validation**: Concurrently tests multiple streams with configurable settings.
- **Smart Caching**: Caches valid streams for **30 minutes** to reduce repeated checks.
- **Automatic Cleanup**: Removes expired streams every **20 seconds** to keep memory usage low. 


## ⚙️ Configuration

The addon has the settings bellow, which can be modified in the `addon.js`.

| Setting                | Default Value         | Description                                          |  
|------------------------|-----------------------|------------------------------------------------------|  
| `maxConcurrentTests`   | `25`                  | Maximum number of torrents tested simultaneously.    |  
| `testDuration`         | `5000 ms`             | How long (ms) to test each torrent's speed.          |  
| `minPeersForValidTest` | `1`                   | Minimum peers required for a valid speed test.       |  
| `speedThreshold`       | `0.00000000000000001` | Minimum speed (Mb/s) to consider a torrent valid.    |  
| `batchTimeout`         | `100 ms`              | Delay between batch tests.                           |  
| `streamExpirationTime` | `30 minutes` (30 m)   | How long should streams be cached before re-testing. |  


## 🚀 Installation

1. **Install Stremio** (if you haven't already) from [stremio.com](https://www.stremio.com/).
2. **Install project dependencies**: ```npm ci```
3. **Run the project**: ```node server.js```
4. **Install addon**: Addons → Paste ```http://localhost:7000/manifest.json``` in search bar