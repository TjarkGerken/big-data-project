"use client";
import { useRouter } from "next/navigation";

/**
 * Generates a random string of a given length from a given set of characters.
 * @param length
 */
function generateRandomString(length: number) {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

export default function SpotifyAuthorization() {
  /**
   * The client_id and redirect_uri are required to initiate the authorization process with Spotify. The state can be used to prevent CSRF attacks.
   */
  const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "";
  const redirect_uri = process.env.NEXT_PUBLIC_REDIRECT_URI || "";
  const state = generateRandomString(16);

  /**
   * The scope of the authorization request describes which data can be accessed by the application from the Spotify API.
   */
  const scope =
    "user-read-private user-read-email user-read-recently-played user-read-private user-read-email";

  const router = useRouter();
  /**
   * The query string that the user is pushed towards to authorize the application with Spotify.
   */
  const query = `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${scope}&redirect_uri=${redirect_uri}&state=${state}`;

  /**
   * Initiates the authorization process with Spotify.
   */
  function initiateSpotifyAuthorization() {
    router.push(query);
  }

  return (
    <button
      onClick={initiateSpotifyAuthorization}
      className={
        "bg-spotify-green text-spotify-black rounded-full px-8 py-4 text-center font-bold text-2xl"
      }
    >
      Login with your Spotify Account
    </button>
  );
}
