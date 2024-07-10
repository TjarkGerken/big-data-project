import { Kafka, Partitioners } from "kafkajs";
import { StreamingHistoryTjark } from "@/app/api/send-to-kafka/StreamingHistoryTjark";
import { Track } from "@/app/api/send-to-kafka/StreamingHistoryType";
import { StreamingHistoryDavid } from "./StreamingHistoryDavid";
import { StreamingHistoryCarlos } from "@/app/api/send-to-kafka/StreamingHistoryCarlos";

export const dynamic = "force-dynamic";

export interface RequestBody {
  uid: string;
}

const AVAILABLE_DATASETS = {
  tjark: StreamingHistoryTjark,
  david: StreamingHistoryDavid,
  carlos: StreamingHistoryCarlos,
  // "niklas": "Niklas",
};

async function sendToKafka(tracks: Track[], uid: string) {
  console.log("===== Sending data to Kafka =====");
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
      track.UID = uid;
      return { value: JSON.stringify(track) };
    });

    // Send messages
    await producer.send({
      topic: "spotify-track-data",
      messages: messages,
    });
  }

  await producer.disconnect();
  return true;
}

export async function POST(request: Request) {
  const body: RequestBody = await request.json();
  console.log(body.uid);

  if (!AVAILABLE_DATASETS[body.uid as keyof typeof AVAILABLE_DATASETS]) {
    return new Response(
      JSON.stringify({ message: "No data found for this user" }),
      { status: 404 },
    );
  }
  const tracks: Track[] =
    AVAILABLE_DATASETS[body.uid as keyof typeof AVAILABLE_DATASETS];
  await sendToKafka(tracks, body.uid);
  return new Response(JSON.stringify({ message: "Data sent to Kafka" }), {
    status: 200,
  });
}
