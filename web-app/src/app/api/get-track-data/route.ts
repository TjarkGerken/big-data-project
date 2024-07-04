import axios from "axios";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const track_name = await request.json();
  const auth_token = request.headers.get("Authorization");
  // const refresh_token = request.headers.get("Refresh-Token");

  const url = "https://api.spotify.com/v1/search";
  const params = {
    q: encodeURIComponent(track_name.track_name),
    type: "track",
    market: "DE",
    limit: 1,
  };

  const headers = {
    Authorization: "Bearer " +  auth_token,
    'Content-Type': 'application/json',
  };

  axios
    .get(url, { params, headers })
    .then((response) => {
      console.log(response.data);
      return new Response(JSON.stringify(response.data), { status: 200 });
    })
    .catch((error) => {
      console.error(error);
      console.error(error.data);
      return new Response("error", { status: 500 });
    });
}
