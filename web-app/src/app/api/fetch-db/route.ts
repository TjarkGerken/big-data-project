import * as mariadb from "mariadb";
import {Md5} from 'ts-md5';

export const dynamic = "force-dynamic";


const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface TrackData {
  UID: string;
  trackName: string;
  artistName: string;
  total_msPlayed: bigint;
}
interface ArtistData {
  UID: string;
  artistName: string;
  total_msPlayed: bigint;
}

interface TotalPlayTime {
  UID: string;
  total_msPlayed: bigint;
}

export interface ResponseData {
  spotify_uid: string;
  top_songs: TrackData[];
  top_artist: ArtistData[];
  total_ms_played?: TotalPlayTime[];
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  // Get the username parameter from the query string
  const uid = url.searchParams.get("uid");

  if (!uid) {
    return new Response("Please provide a uid", {
      status: 400,
    });
  }

  const pool = mariadb.createPool({
    host: "my-app-mariadb-service",
    port: 3306,
    user: "root",
    password: "mysecretpw",
    connectionLimit: 5,
    acquireTimeout: 20000,
    database: "spotify",
  });

  async function queryTopArtists() {
    let conn;
    try {
      conn = await pool.getConnection();
      const rows: ArtistData[] = await conn.query(
        "SELECT * FROM top_artists WHERE UID = ?",
        [uid],
      );
      return rows;
    } catch (err) {
      console.error(err);
      throw new Error("something went wrong");
    } finally {
      if (conn) await conn.release();
    }
  }

  async function queryTopSongs() {
    let conn;
    try {
      conn = await pool.getConnection();
      const rows: TrackData[] = await conn.query(
        "SELECT * FROM top_songs WHERE UID = ?",
        [uid],
      );
      return rows;
    } catch (err) {
      console.error(err);
      throw new Error("something went wrong");
    } finally {
      if (conn) await conn.release();
    }
  }

  async function queryTotalPlayTime() {
    let conn;
    try {
      conn = await pool.getConnection();
      const rows: TotalPlayTime[] = await conn.query(
        "SELECT * FROM total_playtime WHERE UID = ? LIMIT 1",
        [uid],
      );
      return rows;
    } catch (err) {
      console.error(err);
      throw new Error("something went wrong");
    } finally {
      if (conn) await conn.release();
    }
  }

  function compareArrays(arr1:any[], arr2:any[]): boolean {
    if (arr1.length !== arr2.length) {
      return false;
    }
    return Md5.hashStr(JSON.stringify(arr1,bigintReplacer)) === Md5.hashStr(JSON.stringify(arr2,bigintReplacer));
  }

  const BUFFER_TIME = 10000
  const LOOK_BACK = 6
  const NEXT_RESPONSE_EMTPY_BREAK = 4


  async function loopQueryTopSongs(){
    let responseArray:TrackData[][] = []
    let currentResponse:TrackData[] = []
    let nextReponseEmptyCounter:number = 0
    let i = 0;

    while(i < LOOK_BACK){
      currentResponse = await queryTopSongs()
      responseArray.push(currentResponse)
      console.log(i)
      i += 1;
      await sleep(BUFFER_TIME)
    }

    while (true) {
      let newResponse = await queryTopSongs();
      console.log("New Response Length Song" + String(newResponse.length))
      if (currentResponse.length !== 0 && newResponse.length === 0){
                nextReponseEmptyCounter +=1
      }
     
      if (nextReponseEmptyCounter > NEXT_RESPONSE_EMTPY_BREAK) {
        console.log("==== BREAK SONG QUERY RESPONSE LENGTH ====")
        nextReponseEmptyCounter +=1
        break;
      }

      if (compareArrays(newResponse, responseArray[responseArray.length - LOOK_BACK])&& newResponse.length !== 0) {
        console.log("==== BREAK SONG QUERY ARRAY COMPARISON ====")
        break;
      }

      console.log("==== ARTIST SENDING REQUEST ====")
      currentResponse = newResponse;
      responseArray.push(currentResponse);
      await sleep(BUFFER_TIME);
    }

    console.log("====FULL STOPPED QUERY TOP SONGS ====\n\n\n\n\n\n\n\n")
    return currentResponse
  }

  async function loopQueryTopArtists(){
    let responseArray:ArtistData[][] = []
    let currentResponse:ArtistData[] = []
    let nextReponseEmptyCounter:number = 0
    let i = 0;

    while(i < LOOK_BACK){
      currentResponse = await queryTopArtists()
      responseArray.push(currentResponse)
      console.log(i)
      i += 1;
      await sleep(BUFFER_TIME)
    }

    while (true) {
      let newResponse = await queryTopArtists();
      console.log("New Response Length" + String(newResponse.length))
      if (currentResponse.length !== 0 && newResponse.length === 0){
                nextReponseEmptyCounter +=1
      }
     
      if (nextReponseEmptyCounter > NEXT_RESPONSE_EMTPY_BREAK) {
        console.log("==== BREAK ARTIST QUERY RESPONSE LENGTH ====")
        nextReponseEmptyCounter +=1
        break;
      }

      if (compareArrays(newResponse, responseArray[responseArray.length - LOOK_BACK])&& newResponse.length !== 0) {
        console.log("==== BREAK ARTIST QUERY ARRAY COMPARISON ====")
        break;
      }

      console.log("==== ARTIST SENDING REQUEST ====")
      currentResponse = newResponse;
      responseArray.push(currentResponse);
      await sleep(BUFFER_TIME);
    }

    console.log("====FULL STOPPED QUERY TOP ARTISTS ====\n\n\n\n\n\n\n\n")
    return currentResponse
  }

  async function loopQueryTotalPlaytime(){
    let responseArray:TotalPlayTime[][] = []
    let currentResponse:TotalPlayTime[] = []
    let nextReponseEmptyCounter:number = 0
    let i = 0;

    while(i < LOOK_BACK){
      currentResponse = await queryTotalPlayTime()
      responseArray.push(currentResponse)
      console.log(i)
      i += 1;
      await sleep(BUFFER_TIME)
    }

    while (true) {
      let newResponse = await queryTotalPlayTime();
      console.log("New Response Length PLAYTIME" + String(newResponse.length))
      if (currentResponse.length !== 0 && newResponse.length === 0){
                nextReponseEmptyCounter +=1
      }
     
      if (nextReponseEmptyCounter > NEXT_RESPONSE_EMTPY_BREAK) {
        console.log("==== BREAK PLAYTIME QUERY RESPONSE LENGTH ====")
        nextReponseEmptyCounter +=1
        break;
      }

      if (compareArrays(newResponse, responseArray[responseArray.length - LOOK_BACK])&& newResponse.length !== 0) {
        console.log("==== BREAK PLAYTIME QUERY ARRAY COMPARISON ====")
        break;
      }

      console.log("==== PLAYTIME SENDING REQUEST ====")
      currentResponse = newResponse;
      responseArray.push(currentResponse);
      await sleep(BUFFER_TIME);
    }

    console.log("====FULL STOPPED QUERY PLAYTIME ====\n\n\n\n\n\n\n\n")
    return currentResponse
  }

  async function getAllData() {
    return await Promise.all([
      loopQueryTopSongs(),
      loopQueryTopArtists(),
      loopQueryTotalPlaytime()
    ]);
  }

  const [top_songs,top_artist, total_ms_played] = await getAllData()

  function convertBigIntToNumber(bigintValue: bigint) {
    if (
      bigintValue < Number.MIN_SAFE_INTEGER ||
      bigintValue > Number.MAX_SAFE_INTEGER
    ) {
      throw new RangeError(
        "The BigInt value is out of the safe range for conversion to Number.",
      );
    }
    return Number(bigintValue);
  }
  // Define a replacer function for JSON.stringify
  function bigintReplacer(key: string, value: any) {
    if (typeof value === "bigint") {
      return convertBigIntToNumber(value);
    } else {
      return value;
    }
  }

  const sortedTopSongs = top_songs.sort((a, b) => {
    const totalMsPlayedA = BigInt(a.total_msPlayed);
    const totalMsPlayedB = BigInt(b.total_msPlayed);
    return Number(totalMsPlayedB - totalMsPlayedA);
  });

  const sortedTopArtist = top_artist.sort((a, b) => {
    const totalMsPlayedA = BigInt(a.total_msPlayed);
    const totalMsPlayedB = BigInt(b.total_msPlayed);
    return Number(totalMsPlayedB - totalMsPlayedA);
  });

  const response: ResponseData = {
    spotify_uid: uid,
    top_songs: sortedTopSongs.slice(0, 10),
    top_artist: sortedTopArtist.slice(0, 10),
    total_ms_played: total_ms_played,
  };

  const jsonString = JSON.stringify(response, bigintReplacer);

  return new Response(jsonString, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
