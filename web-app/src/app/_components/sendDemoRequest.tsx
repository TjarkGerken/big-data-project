"use client"
import { AuthCode } from "../_interfaces/AuthCode";
import axios from "axios";
import { useState } from "react";
import { GetLastSongsResponse } from "../_interfaces/GetLastSongsResponse";

export default function SendDemoRequest() {
  async function sendTracksToKafka(tracks: GetLastSongsResponse) {
    axios.post("/api/send-to-kafka", tracks).then((response) => { console.log(response)});
  }
  const [response, setResponse] = useState({} as GetLastSongsResponse);
  var token = null;

  async function sendReq() {
      console.log("sending request")
    try {
        console.log("sending request")

        const authCode: AuthCode = JSON.parse(
        localStorage.getItem("authCode") || "",
      );
        console.log(authCode);

      if (
          new Date(authCode.issuedAt).getTime() + (authCode.expires_in - 100 ) * 1000 <
        new Date().getTime()
      ) {

        await getRefreshedToken(localStorage.getItem("refreshToken") || "");
      }
      token = authCode.access_token;
      console.log(token);
    } catch (error) {
          console.log(error);
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
        sendTracksToKafka(response.data);
        setResponse(response.data);
      });
  }

  return (
    <div className={"bg-spotify-black h-full"}>
      <button
          className={
              "bg-spotify-green text-spotify-black rounded-full px-8 py-4 text-center font-bold text-xl"
          }
        onClick={() =>
          getRefreshedToken(localStorage.getItem("refreshToken") || "")
        }
      >
        get refresh token
      </button>
      <div

      >
        <button
            className={
                "bg-spotify-green text-spotify-black rounded-full px-8 py-4 text-center font-bold text-xl"
            }
            onClick={sendReq}>Send Request</button>
      </div>
        { response.items &&
      <div className={"text-white"}>
        <h1>Spotify Response</h1>
        {response.items?.map((item, i) => {
          return <div key={i}>{item.track.name}</div>;
        })}
      </div>}
    </div>
  );
}

export async function getRefreshedToken(refreshToken: string) {
    if (!refreshToken) {
        return;
    }
    axios
        .post("/api/refresh-token", { refresh_token: refreshToken })
        .then((response) => {
            localStorage.setItem(
                "authCode",
                JSON.stringify({ ...response.data, issuedAt: new Date() }),
            );
        });
}
