const TRACKERS: string[] = []

export async function getTrackers(): Promise<string[]> {
    if (TRACKERS.length > 0) {
        return TRACKERS
    }

    const response = await fetch("https://raw.githubusercontent.com/ngosang/trackerslist/refs/heads/master/trackers_best.txt")
    const text = await response.text()
    const trackerList: string[] = text.split('\n')
        .filter(t => t.trim() && t.startsWith(''))

    TRACKERS.push(...trackerList)
    return TRACKERS
}

export function getTrackerFromSources(sources: string[]): string[] {
    return sources
        .map(source => source.replace("tracker:", ""))
        .filter(source => source.trim() && !source.startsWith(''))
}