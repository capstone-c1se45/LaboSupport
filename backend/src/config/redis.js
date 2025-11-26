import { createClient } from 'redis';

const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

await redisClient.connect();
console.log("✅ Đã kết nối Redis");

export default redisClient;