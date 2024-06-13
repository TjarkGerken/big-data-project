import { useRouter } from "next/navigation";

import { AuthCode } from "../_interfaces/AuthCode";
import axios from "axios";
import { useState } from "react";
import { GetLastSongsResponse } from "../_interfaces/GetLastSongsResponse";
import { Kafka } from "kafkajs";

export default function sendDemoRequest() {

    const kafka = new Kafka({
        clientId: "tracker-" + Math.floor(Math.random() * 100000),
        brokers: ["my-cluster-kafka-bootstrap:9092"]
    })


    async function sendTracksToKafka(tracks: GetLastSongsResponse) {
        const producer = kafka.producer()
        await producer.connect()
        await producer.send({
            topic: 'spotify-track-data',
            messages:
                tracks.items.map((track) => {
                    // TODO: We somehow have to add the user id to the message
                    return { value: JSON.stringify(track) }
                })
            ,
        })
        await producer.disconnect()
    }

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
