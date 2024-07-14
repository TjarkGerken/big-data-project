import Memcached from "memcached";

interface SetCacheRequestBody {
  uid: string;
  data: string;
}

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

export async function POST(request: Request): Promise<Response> {
  const body: SetCacheRequestBody = await request.json();
  try {
    await setCache(body.uid, body.data, 60 * 10);
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
