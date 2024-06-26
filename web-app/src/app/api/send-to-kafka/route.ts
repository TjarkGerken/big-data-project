
import { Kafka, Partitioners } from "kafkajs";
import {StreamingHistoryTjark} from "@/app/api/send-to-kafka/StreamingHistory_music";
import {Track} from "@/app/api/send-to-kafka/StreamingHistoryType";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const tracks: Track[] = StreamingHistoryTjark

  const kafka = new Kafka({
    clientId: "client-" + Math.floor(Math.random() * 100000),
    brokers: ["my-cluster-kafka-bootstrap:9092"],
  });

  const producer = kafka.producer({ createPartitioner: Partitioners.DefaultPartitioner })

  await producer.connect();
  await producer.send({
    topic: "spotify-track-data",
    messages: tracks.map((track) => {
      track.UID = "Spotify-UID-TJARK"
      return { value: JSON.stringify(track) };
    }),
  });

  await producer.disconnect();
  return Response.json(
    { message: "Tracks sent successfully" },
    { status: 200 },
  );
}
