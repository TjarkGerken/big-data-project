import { Kafka, Partitioners } from "kafkajs";
import { AVAILABLE_DATASETS } from "@/app/api/send-to-kafka/constants/AvailableDatasets";
import { chunkArray } from "@/app/api/send-to-kafka/utils/chunkArray";
import { RequestBody } from "@/app/api/send-to-kafka/interfaces/requestBody";
import { Track } from "@/app/api/send-to-kafka/interfaces/StreamingHistoryType";

export const dynamic = "force-dynamic";

/**
 * Sends an array of track data to a Kafka topic.
 *
 * Splits the message array into smaller chunks and send them to the Kafka topic. If this fails it retries for an additional
 * 10 attempts before giving up. If the data is successfully sent, the promise resolves to `true`, otherwise it resolves to `false`.
 *
 *
 * @param {Track[]} tracks - An array of track data to be sent.
 * @param {string} uid - The uid for the user, to be added to each track data.
 * @param {number} [attempts=0] - The current attempt count, used for recursive retries.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the data is successfully sent, or `false`
 *                            if it fails after the maximum number of attempts.
 */
async function sendToKafka(
  tracks: Track[],
  uid: string,
  attempts: number = 0,
): Promise<boolean> {
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
    return await sendToKafka(tracks, uid, attempts + 1);
  }
}

/**
 * Handles the POST request to send user's track data to a Kafka topic.
 *
 * @returns {Promise<Response>} A HTTP Response with either the status code 200, 404 if the uid is not available or 500 if the data could not be sent to Kafka.
 */
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
