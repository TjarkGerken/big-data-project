import { GetLastSongsResponse } from "@/app/_interfaces/GetLastSongsResponse";
import { Kafka } from "kafkajs";

export const dynamic = 'force-dynamic'

export async function POST(request : Request){
    const tracks: GetLastSongsResponse = await request.json();
    
    const kafka = new Kafka({
        clientId: "tracker-" + Math.floor(Math.random() * 100000),
        brokers: ["my-cluster-kafka-bootstrap:9092"]
    });

    const producer = kafka.producer();
    await producer.connect();
    await producer.send({
        topic: 'spotify-track-data',
        messages: tracks.items.map((track) => {
            return { value: JSON.stringify(track) }
        }),
    });
    await producer.disconnect();
    return Response.json({ message: 'Tracks sent successfully' }, { status: 200 });
}