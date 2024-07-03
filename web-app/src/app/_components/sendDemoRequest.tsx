"use client";
import { AuthCode } from "../_interfaces/AuthCode";
import axios from "axios";
import { useState } from "react";
import { GetLastSongsResponse } from "../_interfaces/GetLastSongsResponse";
import { Button } from "@/components/ui/button";

interface SendDemoRequestProps {
  uid: string;
}

export default function SendDemoRequest({ uid }: SendDemoRequestProps) {
  console.log("init");
  console.log("uid: " + uid);
  async function sendTracksToKafka() {
    if (!uid || uid === "") {
        return;
    }
    console.log("sending to kafka");
    console.log("uid: " + uid);
    axios.post("/api/send-to-kafka", { uid: uid}).then((response) => {

    });
  }
  const [response, setResponse] = useState({} as GetLastSongsResponse);
  var token = null;

  async function sendReq() {
    try {
      let authCode: AuthCode = JSON.parse(
        localStorage.getItem("authCode") || "",
      );
      if (
        new Date(authCode.issuedAt).getTime() +
          (authCode.expires_in - 100) * 1000 <
        new Date().getTime()
      ) {
        await getRefreshedToken(localStorage.getItem("refreshToken") || "");
      }

      authCode = JSON.parse(localStorage.getItem("authCode") || "");
      token = authCode.access_token;
    } catch (error) {
      console.log(error);
      return error;
    }
    if (!token) {
      return "No token found";
    }

    let url = `https://api.spotify.com/v1/me/player/recently-played?limit=50&time_range=long_term`;

    const header = {
      headers: { Authorization: `Bearer ${token}` },
    };

    let latestResponseDate = -1;

    const threeDaysInMilliSeconds = 3 * 24 * 60 * 60 * 1000;
    const unixTimestamp = new Date().getTime() - threeDaysInMilliSeconds;

      while (latestResponseDate > unixTimestamp || latestResponseDate === -1) {
        await axios.get(url, header).then((response) => {
          sendTracksToKafka();
          if (response.data.next === null) {
            latestResponseDate = -2;
            return;
          }
          latestResponseDate = new Date(
              response.data.items[response.data.items.length - 1].played_at,
          ).getTime();
          url = response.data.next + "&time_range=long_term";
          setResponse(response.data);
        });
      }

  }

  return (
    <div className={"bg-spotify-black h-full w-full flex flex-col space-y-4"}>
      {<Button
          className={
            "bg-spotify-green text-spotify-black rounded-full px-8 py-4 text-center font-bold text-xl"
          }
          onClick={() =>
              getRefreshedToken(localStorage.getItem("refreshToken") || "")
          }
      >
        get refresh token
      </Button>}
      <div>
        <Button
          className={
            "bg-spotify-green text-spotify-black rounded-full px-8 py-4 text-center font-bold text-xl w-full"
          }
          onClick={sendReq}
        >
          Send Request
        </Button>
      </div>
      {response.items && (
        <div className={"text-white"}>
          <h1>Spotify Response</h1>
          {response.items?.map((item, i) => {
            return <div key={i}>{item.track.name}</div>;
          })}
        </div>
      )}
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
