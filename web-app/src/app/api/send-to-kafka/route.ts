import { Kafka, Partitioners } from "kafkajs";
import { StreamingHistoryTjark } from "@/app/api/send-to-kafka/StreamingHistoryTjark";
import { Track } from "@/app/api/send-to-kafka/StreamingHistoryType";
import { StreamingHistoryDavid } from "./StreamingHistoryDavid";
import { StreamingHistoryCarlos } from "@/app/api/send-to-kafka/StreamingHistoryCarlos";
import { StreamingHistoryNiklasHommie } from "@/app/api/send-to-kafka/StreamingHistoryNiklas";

export const dynamic = "force-dynamic";

export interface RequestBody {
  uid: string;
}

const AVAILABLE_DATASETS = {
  tjark: StreamingHistoryTjark,
  david: StreamingHistoryDavid,
  carlos: StreamingHistoryCarlos,
  niklas: StreamingHistoryNiklasHommie,
};

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

async function sendToKafka(tracks: Track[], uid: string, attempts = 1) {
  if (attempts >= 10) {
    return false;
  }
  try {
    const kafka = new Kafka({
      clientId: "client-" + Math.floor(Math.random() * 100000),
      brokers: ["my-cluster-kafka-bootstrap:9092"],
    });

    const producer = kafka.producer({
      createPartitioner: Partitioners.DefaultPartitioner,
    });

    await producer.connect();
    const trackChunks = chunkArray(tracks, 10);

    for (const trackChunk of trackChunks) {
      const messages = trackChunk.map((track) => {
        track.UID = uid;
        return { value: JSON.stringify(track) };
      });

      await producer.send({
        topic: "spotify-track-data",
        messages: messages,
      });
    }

    await producer.disconnect();
    return true;
  } catch (error) {
    await sendToKafka(tracks, uid, attempts + 1);
  }
}

export async function POST(request: Request) {
  const body: RequestBody = await request.json();

  if (!AVAILABLE_DATASETS[body.uid as keyof typeof AVAILABLE_DATASETS]) {
    return new Response(
      JSON.stringify({ message: "No data found for this user" }),
      { status: 404 },
    );
  }
  const tracks: Track[] =
    AVAILABLE_DATASETS[body.uid as keyof typeof AVAILABLE_DATASETS];
  const status = await sendToKafka(tracks, body.uid);
  if (status) {
    return new Response(JSON.stringify({ message: "Data sent to Kafka" }), {
      status: 200,
    });
  }
  return new Response(
    JSON.stringify({ message: "Data could not be sent to Kafka" }),
    {
      status: 500,
    },
  );
}
