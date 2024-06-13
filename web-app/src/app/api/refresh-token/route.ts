import axios from "axios";
import querystring from "querystring";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const refresh_token = await request.json();
  const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_SECRET;
  try {
    const result = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        refresh_token: refresh_token.refresh_token,
        grant_type: "refresh_token",
      }),
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + btoa(client_id + ":" + client_secret),
        },
      },
    );
    return new Response(JSON.stringify(result.data), { status: 200 });
  } catch (error) {
    console.error(error);

    return new Response(JSON.stringify(error), { status: 500 });
  }
}
