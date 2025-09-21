import {RedisClient} from "@/Redis";

export class RedisWrapper {

    public async save(key: string, value: any, expireSeconds: number = 30 * 60) {
        const client = await RedisClient.getInstance()

        await client.set(key,
            typeof value === 'object'
            ? JSON.stringify(value)
            : value,
            { EX: expireSeconds }
        )
    }

    public async get(key: string) {
        const client = await RedisClient.getInstance()
        const value = await client.get(key)

        if (value === null) return null

        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }

    public async has(key: string) {
        const client = await RedisClient.getInstance()
        return await client.exists(key)
    }
}