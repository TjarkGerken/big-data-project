"use client";
import { useRouter } from "next/navigation";

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
  const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "";
  const redirect_uri = process.env.NEXT_PUBLIC_REDIRECT_URI || "";
  const state = generateRandomString(16);
  const scope =
    "user-read-private user-read-email user-read-recently-played user-read-private user-read-email";

  const router = useRouter();
  const query = `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${scope}&redirect_uri=${redirect_uri}&state=${state}`;

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
