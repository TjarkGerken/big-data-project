import { useRouter } from "next/navigation";

import { AuthCode } from "../_interfaces/AuthCode";
import axios from "axios";
import { useState } from "react";
import { GetLastSongsResponse } from "../_interfaces/GetLastSongsResponse";

export async function getRefreshedToken(refreshToken: string) {
  axios
    .post("/api/refresh-token", { refresh_token: refreshToken })
    .then((response) => {
      localStorage.setItem(
        "authCode",
        JSON.stringify({ ...response.data, issuedAt: new Date() }),
      );
    });
}

export default function sendDemoRequest() {
  async function sendTracksToKafka(tracks: GetLastSongsResponse) {
    axios.post("/api/send-to-kafka", tracks).then((response) => {});
  }
  const router = useRouter();
  const [response, setResponse] = useState({} as GetLastSongsResponse);
  var token = null;

  async function sendReq() {
    try {
      const authCode: AuthCode = JSON.parse(
        localStorage.getItem("authCode") || "",
      );

      if (
        authCode.issuedAt.getTime() + authCode.expires_in * 1000 <
        new Date().getTime()
      ) {
        await getRefreshedToken(authCode.refresh_token);
      }

      token = authCode.access_token;
    } catch (error) {
      return error;
    }

    if (!token) {
      return "No token found";
    }

    axios
      .get("https://api.spotify.com/v1/me/player/recently-played?limit=50", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setResponse(response.data);
      });
  }

  return (
    <div>
      <button
        onClick={() =>
          getRefreshedToken(
            "AQCziuSvuk43fpRwUxmkN2JLJPODnTVnTZ_29twRvXaEOK2dbyBS4E9m1ju1yfQpwJTVhMeWlgV17kiOCV-HNyBy_3BJXfzj8eMQBQ1_P49ZbS55-vGHuiKz6Zpvcz6wMWk",
          )
        }
      >
        get refresh token
      </button>
      <div
        className={
          "bg-spotify-green text-spotify-black rounded-full px-8 py-4 text-center font-bold text-xl"
        }
      >
        <button onClick={sendReq}>Send Request</button>
      </div>
      <div>
        <h1>Spotify Response</h1>
        {response.items?.map((item, i) => {
          return <div key={i}>{item.track.name}</div>;
        })}
      </div>
    </div>
  );
}
