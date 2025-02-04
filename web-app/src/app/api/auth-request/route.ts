import axios from "axios";
import querystring from "querystring";

export const dynamic = "force-dynamic";

/**
 * This function is responsible for handling the authorization request to the Spotify API, after the user has already been redirected to the callback page.
 * It will send a POST request to the Spotify API with the code received from the callback page and return the authorization token and the refresh token.
 * @param request
 * @constructor
 */
export async function POST(request: Request) {
  /**
   * The client_id, client_secret, and redirect_uri are required to authenticate the application with the Spotify API.
   */
  const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_SECRET;
  const redirect_uri = process.env.NEXT_PUBLIC_REDIRECT_URI;
  const data: { code: string } = await request.json();

  /**
   * The authOptions object contains the necessary information to authenticate the application with the Spotify API and receive the authorization token and the refresh token.
   * It transforms the data to a querystring, which is required by spotify.
   */
  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      code: data.code,
      redirect_uri: redirect_uri,
      grant_type: "authorization_code",
    }),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(client_id + ":" + client_secret),
    },
  };
  /**
   * Send the POST request to the Spotify API with the authOptions object and return the response.
   */
  try {
    return await axios
      .post(authOptions.url, authOptions.data, {
        headers: authOptions.headers,
      })
      .then((response) => {
        return new Response(JSON.stringify(response.data), { status: 200 });
      });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify(error), { status: 500 });
  }
}
