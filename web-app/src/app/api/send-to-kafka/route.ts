import { Kafka, Partitioners } from "kafkajs";
import { StreamingHistoryTjark } from "@/app/api/send-to-kafka/StreamingHistoryTjark";
import { Track } from "@/app/api/send-to-kafka/StreamingHistoryType";
import { StreamingHistoryDavid } from "./StreamingHistoryDavid";
import {StreamingHistoryCarlos} from "@/app/api/send-to-kafka/StreamingHistoryCarlos";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {

  const body = await request.json();
  console.log(body);
  console.log(body.uid);
  const datasets = {
    "tjark": StreamingHistoryTjark,
    "david": StreamingHistoryDavid,
    "carlos": StreamingHistoryCarlos,
    // "niklas": "Niklas",
  };

  const tracks: Track[] = datasets[body.uid as keyof typeof datasets];

  const kafka = new Kafka({
    clientId: "client-" + Math.floor(Math.random() * 100000),
    brokers: ["my-cluster-kafka-bootstrap:9092"],
  });

  const producer = kafka.producer({
    createPartitioner: Partitioners.DefaultPartitioner,
  });

  await producer.connect();
  function chunkArray(array: any[], chunkSize: number): any[][] {
    let index = 0;
    let arrayLength = array.length;
    let tempArray = [];

    for (index = 0; index < arrayLength; index += chunkSize) {
      let chunk = array.slice(index, index + chunkSize);
      tempArray.push(chunk);
    }

    return tempArray;
  }

  const trackChunks = chunkArray(tracks, 10);

  for (const trackChunk of trackChunks) {
    const messages = trackChunk.map((track) => {
      track.UID = body.uid;
      return { value: JSON.stringify(track) };
    });

    // Send messages
    await producer.send({
      topic: "spotify-track-data",
      messages: messages,
    });
  }

  await producer.disconnect();
  return Response.json(
    { message: "Tracks sent successfully" },
    { status: 200 },
  );
}
