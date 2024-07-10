import * as mariadb from "mariadb";

export const dynamic = "force-dynamic";

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

  const top_songs = await queryTopSongs();
  const top_artist = await queryTopArtists();
  const total_ms_played = await queryTotalPlayTime();

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
  console.log(jsonString);

  return new Response(jsonString, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
