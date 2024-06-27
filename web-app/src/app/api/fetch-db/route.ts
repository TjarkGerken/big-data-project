import * as mongoDB from "mongodb";

export const dynamic = "force-dynamic";


export async function GET(request: Request) {

    const url = new URL(request.url);

    // Get the username parameter from the query string
    const uid = url.searchParams.get('uid');
    console.log(uid)
    console.log("ich auch hier")
    const collections: { popularTracks?: mongoDB.Collection } = {}

    const DB_CONN_STRING = process.env.DB_CONN_STRING || ""
    const DB_NAME = process.env.DB_CONN_NAME || ""
    const COLLECTION_NAME = "popularTracks"

    async function connectToDatabase () {
        const client: mongoDB.MongoClient = new mongoDB.MongoClient(DB_CONN_STRING);

        await client.connect();

        const db: mongoDB.Db = client.db(DB_NAME);

        const popularTrackCollection: mongoDB.Collection = db.collection(COLLECTION_NAME);

        collections.popularTracks = popularTrackCollection;

        console.log(`Successfully connected to database: ${db.databaseName} and collection: ${popularTrackCollection.collectionName}`);
    }

    await connectToDatabase()

    const popularTracks = await collections.popularTracks?.find({}).toArray()
    console.log(popularTracks)
    return Response.json(
            popularTracks,
        { status: 200 },
    );
}