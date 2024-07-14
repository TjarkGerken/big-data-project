import axios from "axios";
export const dynamic = "force-dynamic";

/**
 * This function is responsible for handling the request to the Spotify API to search the  get the artist data.
 * @param request
 * @constructor
 */
export async function POST(request: Request) {
  try {
    /**
     * The artistData object contains the artist_name that is required to search for the artist in the Spotify API.
     */
    const artistData = await request.json();
    const authToken = request.headers.get("Authorization");

    /**
     * Set the parameters for the request to the Spotify API in the required format.
     */
    const params = {
      q: artistData.artist_name,
      type: "artist",
      market: "DE",
      limit: 20,
    };

    /**
     * Set the headers for the request to the Spotify API.
     */
    const headers = {
      Authorization: "Bearer " + authToken,
      "Content-Type": "application/json",
    };

    /**
     * Send a GET Request to the search endpoint of the Spotify API with the artist name and return the response.
     */
    const response = await axios.get("https://api.spotify.com/v1/search", {
      params,
      headers,
    });

    /**
     * Send a GET Request to the artist endpoint for the full artist data of the Spotify API with the artist id and return the response.
     */
    const artistResponse = await axios.get(
      "https://api.spotify.com/v1/artists/" + response.data.artists.items[0].id,
      { headers },
    );
    return new Response(JSON.stringify(artistResponse.data), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
    });
  }
}
