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
  try{
  const cachedData = await checkCache(body)
    .then((data) => {
      return data
    })
    .catch((err) => {
      console.error(err);
      return new Response(JSON.stringify({ error: err }), {
        status: 500,
      });
    });

  if (cachedData === emptyResponse || cachedData === null) {
    return new Response(null, { status: 204 });
  }
  return new Response(JSON.stringify(cachedData), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
    });
  }
}
