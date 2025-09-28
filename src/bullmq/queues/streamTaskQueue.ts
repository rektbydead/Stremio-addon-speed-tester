
import {Queue, QueueEvents} from 'bullmq'
import Redis from 'ioredis'

const connection = new Redis({ host: "redis", port: 6379, maxRetriesPerRequest: null });
const testQueue = new Queue("testQueue", { connection });
const testQueueEvents = new QueueEvents("testQueue", { connection });

export default testQueue
export {testQueueEvents}