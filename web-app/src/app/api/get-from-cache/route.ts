import Memcached from "memcached";
import { ResponseData } from "@/app/api/fetch-db/interfaces";
import { RequestBody } from "@/app/api/send-to-kafka/interfaces/requestBody";

/**
 * Asynchronously checks if the user's data is already cached in Memcached.
 * This function connects to the Memcached service and attempts to retrieve the data for the requested UID.
 * If no data is found the promise is resolved with null else the data is returned.
 *
 * @param {RequestBody} request - The request body containing the UID of the user.
 * @returns {Promise<ResponseData | null>} A promise that resolves to the cached data
 *        or returns null if it does not exist.
 */
async function checkCache(request: RequestBody): Promise<ResponseData | null> {
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

/**
 * @api {post} /get-from-cache Get Data from Cache
 * @apiParam {String} uid The Spotify UID of the user.
 * @returns {ResponseData | null} The user's top songs, top artists, and total play time if the data is cached with status code 200. Else it returns a 204 status code.
 * @param request
 * @constructor
 */
export async function POST(request: Request) {
  const body: RequestBody = await request.json();
  const emptyResponse: ResponseData = {
    spotify_uid: body.uid,
    top_songs: [],
    top_artist: [],
    total_ms_played: [],
  };

  try {
    const cachedData = await checkCache(body)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        console.error(err);
        return new Response(JSON.stringify({ error: err }), {
          status: 500,
        });
      });

    /**
     * If the cached data is empty or null, return a 204 status code. Else return the data.
     */
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
