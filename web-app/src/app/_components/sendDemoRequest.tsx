"use client"
import { AuthCode } from "../_interfaces/AuthCode";
import axios from "axios";
import { useState } from "react";
import { GetLastSongsResponse } from "../_interfaces/GetLastSongsResponse";

export default function SendDemoRequest() {
  async function sendTracksToKafka(tracks: GetLastSongsResponse) {
    axios.post("/api/send-to-kafka", tracks).then((response) => {});
      console.log(tracks.items.map((track) => {
          return { value: JSON.stringify(track) };
      }),);
  }
  const [response, setResponse] = useState({} as GetLastSongsResponse);
  var token = null;

  async function sendReq() {
    try {
        const authCode: AuthCode = JSON.parse(
        localStorage.getItem("authCode") || "",
      );
      if (
          new Date(authCode.issuedAt).getTime() + (authCode.expires_in - 100 ) * 1000 <
        new Date().getTime()
      ) {

        await getRefreshedToken(localStorage.getItem("refreshToken") || "");
      }
      token = authCode.access_token;
    } catch (error) {
          console.log(error);
      return error;
    }
    if (!token) {
      return "No token found";
    }

    const url = `https://api.spotify.com/v1/me/player/recently-played?limit=50`;
    
    const header = {
      headers: { Authorization: `Bearer ${token}` },
    }

    let latestResponseDate = -1
    
    const threeDaysInMilliSeconds = 3 * 24 * 60 * 60 * 1000;
    const unixTimestamp = new Date().getTime() - threeDaysInMilliSeconds;

    while (latestResponseDate > unixTimestamp || latestResponseDate === -1) {
      latestResponseDate = -2
      console.log("Hello")
      axios
      .get(url, header)
      .then((response) => {
        // sendTracksToKafka(response.data);
        console.log(response.data.items[response.data.items.length-1].played_at)
        latestResponseDate = new Date(response.data.items[response.data.items.length-1].played_at).getTime();
        console.log(latestResponseDate  )
        setResponse(response.data);
        
      });
    }  
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
