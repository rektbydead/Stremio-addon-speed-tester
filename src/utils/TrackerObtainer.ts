const TRACKERS: string[] = []

export async function getTrackers(){
    if (TRACKERS.length > 0) {
        return TRACKERS
    }

    const response = await fetch("https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_all.txt")
    const text = await response.text()
    const trackerList: string[] = text.split('\n')
        .filter(t => t.trim() && !t.startsWith('udp://'))
        .slice(0, 15)

    TRACKERS.push(...trackerList)
    return TRACKERS
}