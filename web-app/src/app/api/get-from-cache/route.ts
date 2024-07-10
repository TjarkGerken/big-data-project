import Memcached from "memcached";
import { RequestBody } from "@/app/api/send-to-kafka/route";
import { ResponseData } from "@/app/api/fetch-db/route";

async function checkCache(request: RequestBody) {
  const memcached = new Memcached("my-memcached-service");
  const cacheKey = request.uid || "";
  return new Promise<ResponseData | null>((resolve, reject) => {
    memcached.get(cacheKey, (err: any, data: any) => {
      memcached.end();
      if (err) {
        reject(err);
      } else if (data === undefined || data === null) {
        resolve(null);
      } else {
        resolve(data);
      }
    });
  });
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body: RequestBody = await request.json();
  const emptyResponse: ResponseData = {
    spotify_uid: body.uid,
    top_songs: [],
    top_artist: [],
    total_ms_played: [],
  };
  checkCache(body)
    .then((data) => {
      if (data === emptyResponse || data === null) {
        return new Response(null, { status: 204 });
      }
      return new Response(JSON.stringify(data), { status: 200 });
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
