import * as mongoDB from "mongodb";


export async function POST(request: Request) {
    const uid = await request.json()
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

}