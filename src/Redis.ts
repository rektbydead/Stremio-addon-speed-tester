import {createClient, RedisClientType} from "redis";

export class Redis {
    private static instance: RedisClientType | undefined = undefined;

    private constructor() {}

    public static async getInstance(): Promise<RedisClientType> {
        if (this.instance === undefined) {
            this.instance = await createClient({url: 'redis://redis:6379'})
                .on("error", (err) => console.log("Redis Client Error", err))
                .connect() as RedisClientType
        }

        return this.instance
    }

    public static async close() {
        if (this.instance) {
            await this.instance.quit()
            this.instance = undefined
        }
    }
}