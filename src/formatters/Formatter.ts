export class Formatter {
    public static formatStreamKey(type: string, id: string): string {
        return `stream:${type}:${id}`
    }
}