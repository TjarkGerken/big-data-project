import axios from "axios";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    /**
     * The trackData object contains the track_name that is required to search for the artist in the Spotify API.
     */
    const trackData = await request.json();
    const authToken = request.headers.get("Authorization");

    /**
     * Set the parameters for the request to the Spotify API in the required format.
     */
    const params = {
      q: trackData.track_name,
      type: "track",
      market: "DE",
      limit: 20,
    };

    /**
     * Set the headers for the request to the Spotify API with the provided authorization token.
     */
    const headers = {
      Authorization: "Bearer " + authToken,
      "Content-Type": "application/json",
    };

    /**
     * Send a GET Request to the search endpoint of the Spotify API with the track name and return the response.
     */
    const response = await axios.get("https://api.spotify.com/v1/search", {
      params,
      headers,
    });

    /**
     * Send a GET Request to the track endpoint for the full track data of the Spotify API with the track id and return the response.
     */
    const trackResponse = await axios.get(
      "https://api.spotify.com/v1/tracks/" + response.data.tracks.items[0].id,
      { headers },
    );
    return new Response(JSON.stringify(trackResponse.data), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
    });
  }
}
