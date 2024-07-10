import { Kafka, Partitioners } from "kafkajs";
import { StreamingHistoryTjark } from "@/app/api/send-to-kafka/StreamingHistoryTjark";
import { Track } from "@/app/api/send-to-kafka/StreamingHistoryType";
import { StreamingHistoryDavid } from "./StreamingHistoryDavid";
import { StreamingHistoryCarlos } from "@/app/api/send-to-kafka/StreamingHistoryCarlos";
import Memcached from "memcached";

export const dynamic = "force-dynamic";

const memcached = new Memcached("my-memcached-service");

type RequestBody = {
  uid: string;
}

const AVAILABLE_DATASETS = {
  tjark: StreamingHistoryTjark,
  david: StreamingHistoryDavid,
  carlos: StreamingHistoryCarlos,
  // "niklas": "Niklas",
};


async function sendToKafka(tracks: Track[], uid: string) {
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

async function getFromDB(uid: string) {
  console.log("Getting data from DB");
}


export async function checkCache(request: RequestBody) {
  const cacheKey = request.uid || "";
  return new Promise((resolve, reject) => {
    memcached.get(cacheKey, (err: any, data: any) => {
      memcached.end();
      if (err) {
        reject(err);
      } else if (data === undefined || data === null) {
        resolve(null);
      } else {
        resolve(data);
      }
    });
  });
}

export async function setCache(request: RequestBody, data: string, ttl: number): Promise<void> {
  const cacheKey = request.uid || '';

  return new Promise((resolve, reject) => {
    memcached.set(cacheKey, data, ttl, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}


export async function POST(request: Request) {
  const body : RequestBody = await request.json();
  console.log(body.uid);

  const cacheData = await checkCache(body).catch((err) => {
    console.error(err);
  });

  console.log("↓↓↓↓↓↓ Cached Data before Sending to Kafka ↓↓↓↓↓↓");
  console.log(cacheData);
  console.log("↑↑↑↑↑↑ Cached Data before Sending to Kafka ↑↑↑↑↑↑");

  if (cacheData && JSON.stringify(cacheData) !== JSON.stringify({"spotify_uid":body.uid,"top_songs":[],"top_artist":[],"total_ms_played":[]})) {
      return new Response(
      JSON.stringify(cacheData),
      { status: 200 },
      );
  }

  if (!AVAILABLE_DATASETS[body.uid as keyof typeof AVAILABLE_DATASETS]) {
    return new Response(
        JSON.stringify({ message: "No data found for this user" }),
        { status: 404 },
    );
  }

  const tracks: Track[] = AVAILABLE_DATASETS[body.uid as keyof typeof AVAILABLE_DATASETS];
  await sendToKafka(tracks, body.uid);
  return new Response(
    JSON.stringify({ message: "Data sent to Kafka" }),
    { status: 200 },
  );





}
