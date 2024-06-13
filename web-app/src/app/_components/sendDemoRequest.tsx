import { useRouter } from "next/navigation";

import { AuthCode } from "../_interfaces/AuthCode";
import axios from "axios";
import { useState } from "react";
import { GetLastSongsResponse } from "../_interfaces/GetLastSongsResponse";

export default function sendDemoRequest() {
  const router = useRouter();
  const [response, setResponse] = useState({} as GetLastSongsResponse);
  var token = null;
  function sendReq() {
    try {
      const authCode: AuthCode = JSON.parse(
        localStorage.getItem("authCode") || "",
      );
      token = authCode.access_token;
    } catch (error) {
      return error;
    }

    if (!token) {
      return "No token found";
    }

    console.log(token);
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
