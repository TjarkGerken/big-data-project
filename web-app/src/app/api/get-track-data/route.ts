import axios from "axios";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    const track_name = await request.json();
    const auth_token = request.headers.get("Authorization");

    const url = "https://api.spotify.com/v1/search";
    const params = {
      q: track_name.track_name,
      type: "track",
      market: "DE",
      limit: 20,
    };

    const headers = {
      Authorization: "Bearer " + auth_token,
      "Content-Type": "application/json",
    };

    const response = await axios.get(url, { params, headers });
    const trackResponse = await axios.get(
      "https://api.spotify.com/v1/tracks/" + response.data.tracks.items[0].id,
      { headers },
    );
    return new Response(JSON.stringify(trackResponse.data), { status: 200 });
  } catch (error) {
    console.error(error);
    // Adjust the error handling logic as needed
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
    });
  }
}
