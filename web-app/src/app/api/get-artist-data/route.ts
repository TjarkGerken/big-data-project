import axios from "axios";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    const artist_name = await request.json();
    const auth_token = request.headers.get("Authorization");

    const url = "https://api.spotify.com/v1/search";
    const params = {
      q: artist_name.artist_name,
      type: "artist",
      market: "DE",
      limit: 20,
    };

    const headers = {
      Authorization: "Bearer " + auth_token,
      "Content-Type": "application/json",
    };

    const response = await axios.get(url, { params, headers });
    console.log(response.data.artists.items[0].uri);
    const artistResponse = await axios.get(
      "https://api.spotify.com/v1/artists/" + response.data.artists.items[0].id,
      { headers },
    );
    return new Response(JSON.stringify(artistResponse.data), { status: 200 });
  } catch (error) {
    console.error(error);
    // Adjust the error handling logic as needed
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
    });
  }
}
