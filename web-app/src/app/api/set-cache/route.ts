import Memcached from "memcached";
import { ResponseData } from "@/app/api/fetch-db/route";

interface SetCacheRequestBody {
  uid: string;
  data: ResponseData;
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

export async function POST(request: Request) {
  const body: SetCacheRequestBody = await request.json();

  setCache(body.uid, JSON.stringify(body.data), 3600)
    .then(() => {
      return new Response(
        JSON.stringify({ message: "Cache set successfully" }),
        { status: 201 },
      );
    })
    .catch((err) => {
      console.error(err);
      return new Response(JSON.stringify({ error: "An error occurred" }), {
        status: 500,
      });
    });

  return new Response(JSON.stringify({ error: "An error occurred" }), {
    status: 500,
  });
}
