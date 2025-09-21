import {RedisClient} from "@/Redis";

export class RedisWrapper {

    public async save(key: string, value: any, expireSeconds?: number) {
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

        if (value === null) throw new Error("Key not found")

        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }
}