import Memcached from "memcached";
import { SetCacheRequestBody } from "@/app/api/set-cache/interfaces/setCacheRequestBody";

/**
 * Connect to the Memcached service to set the cache with the given key and data
 * @param key - The key to store the data under
 * @param data - The data to be stored in the cache as a string
 * @param ttl - Time to live in seconds
 * @returns {Promise<void>} A promise that resolves when the cache is set or rejects if an error occurs
 */
async function setCache(key: string, data: string, ttl: number): Promise<void> {
  const memcached = new Memcached("my-memcached-service");
  return new Promise((resolve, reject) => {
    memcached.set(key, data, ttl, (err) => {
      if (err) {
        memcached.end();
        reject(err);
      } else {
        memcached.end();
        resolve();
      }
    });
  });
}

export const dynamic = "force-dynamic";

/**
 * Send a POST request to set the cache with the given key and data
 * @param request
 * @constructor
 */
export async function POST(request: Request): Promise<Response> {
  const body: SetCacheRequestBody = await request.json();
  const TTL = 60 * 10;
  try {
    await setCache(body.uid, body.data, TTL);
    return new Response(JSON.stringify({ message: "Cache set successfully" }), {
      status: 201,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
    });
  }
}
