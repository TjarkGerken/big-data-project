import * as mariadb from "mariadb";
import {
  bigintReplacer,
  compareArrays,
  getUID,
  sleep,
} from "@/app/api/fetch-db/utils";
import {
  ArtistData,
  ResponseData,
  TotalPlayTime,
  TrackData,
} from "@/app/api/fetch-db/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const uidOrResponse = getUID(request);
  if (uidOrResponse instanceof Response) {
    return uidOrResponse;
  }
  /**
   * The UID of the user that is requested.
   */
  const uid = uidOrResponse;

  /**
   * A connection pool to the MariaDB.
   * @type {mariadb.Pool}
   */
  const pool: mariadb.Pool = mariadb.createPool({
    host: "my-app-mariadb-service",
    port: 3306,
    user: "root",
    password: "mysecretpw",
    connectionLimit: 5,
    acquireTimeout: 20000,
    database: "spotify",
  });

  /**
   * Query all the artists from the database for the requested UID.
   * @returns {Promise<ArtistData[]>} - All artists from the database, that are currently available in the MariaDB.
   * @throws {Error} - Throws an error if the connection to the Database fails-
   */
  async function queryTopArtists(): Promise<ArtistData[]> {
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

  /**
   * Query all the songs from the database for the requested UID.
   * @returns {Promise<TrackData[]>} - All songs from the database, that are currently available in the MariaDB.
   * @throws {Error} - Throws an error if the connection to the Database fails-
   */
  async function queryTopSongs(): Promise<TrackData[]> {
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

  /**
   * Query the total playtime for the requested UID.
   * @returns {Promise<TotalPlayTime[]>} - The total playtime for the requested UID that is currently available in the MariaDB.
   * @throws {Error} - Throws an error if the connection to the Database fails-
   */
  async function queryTotalPlayTime(): Promise<TotalPlayTime[]> {
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

  /**
   * The time between each request to the database.
   */
  const BUFFER_TIME = 10000;
  /**
   * The number of postions the loop should look back to compare the arrays. If the response from the database is
   * consistent for the last X requests it is assumed that Spark finished the processing and the loop can be stopped.
   */
  const LOOK_BACK = 6;
  /**
   * The number of empty responses that should be received before the loop is stopped, when a valid response has already
   * been received. This ensures that the loop is stopped when spark overwrites the table with an empty table, after
   * the response has been received.
   */
  const NEXT_RESPONSE_EMPTY_BREAK = 4;

  /**
   * Loop the query for all songs. The function ensures that the data processing by Spark is finished by comparing
   * the responses from the database over the <LOOK_BACK> Intervall and stopping the loop if the response is consistent.
   * Additionally, the loop will stop when it received a valid response and the next <NEXT_RESPONSE_EMPTY_BREAK> responses
   * are empty.
   * @returns {Promise<TrackData[]>} - The aggregated results of the songs for the requested UID, that have been processed by Spark and stored in the Maria DB.
   */
  async function loopQueryTopSongs(): Promise<TrackData[]> {
    let responseArray: TrackData[][] = [];
    let currentResponse: TrackData[] = [];
    let nextReponseEmptyCounter: number = 0;
    let i = 0;

    // Establishes the foundation for the array to be able to compare backwards
    while (i < LOOK_BACK) {
      currentResponse = await queryTopSongs();
      responseArray.push(currentResponse);
      i += 1;
      await sleep(BUFFER_TIME);
    }
    // Compares the Arrays and checks if the function should stop
    while (true) {
      let newResponse = await queryTopSongs();
      if (currentResponse.length !== 0 && newResponse.length === 0) {
        nextReponseEmptyCounter += 1;
      }

      if (nextReponseEmptyCounter > NEXT_RESPONSE_EMPTY_BREAK) {
        nextReponseEmptyCounter += 1;
        break;
      }

      if (
        compareArrays(
          newResponse,
          responseArray[responseArray.length - LOOK_BACK],
        ) &&
        newResponse.length !== 0
      ) {
        break;
      }

      currentResponse = newResponse;
      responseArray.push(currentResponse);
      await sleep(BUFFER_TIME);
    }

    return currentResponse;
  }

  /**
   * Loop the query for all artist data. The function ensures that the data processing by Spark is finished by comparing
   * the responses from the database over the <LOOK_BACK> Intervall and stopping the loop if the response is consistent.
   * Additionally, the loop will stop when it received a valid response and the next <NEXT_RESPONSE_EMPTY_BREAK> responses
   * are empty.
   * @returns {Promise<ArtistData[]>} - The aggregated results of the artists for the requested UID, that have been processed by Spark and stored in the Maria DB.
   */
  async function loopQueryTopArtists(): Promise<ArtistData[]> {
    let responseArray: ArtistData[][] = [];
    let currentResponse: ArtistData[] = [];
    let nextResponseEmptyCounter: number = 0;
    let i = 0;

    // Establishes the foundation for the array to be able to compare backwards
    while (i < LOOK_BACK) {
      currentResponse = await queryTopArtists();
      responseArray.push(currentResponse);
      i += 1;
      await sleep(BUFFER_TIME);
    }
    // Compares the Arrays and checks if the function should stop
    while (true) {
      let newResponse = await queryTopArtists();
      if (currentResponse.length !== 0 && newResponse.length === 0) {
        nextResponseEmptyCounter += 1;
      }

      if (nextResponseEmptyCounter > NEXT_RESPONSE_EMPTY_BREAK) {
        nextResponseEmptyCounter += 1;
        break;
      }

      if (
        compareArrays(
          newResponse,
          responseArray[responseArray.length - LOOK_BACK],
        ) &&
        newResponse.length !== 0
      ) {
        break;
      }

      currentResponse = newResponse;
      responseArray.push(currentResponse);
      await sleep(BUFFER_TIME);
    }
    return currentResponse;
  }

  /**
   * Loop the query for the total playtime. The function ensures that the data processing by Spark is finished by comparing
   * the responses from the database over the <LOOK_BACK> Intervall and stopping the loop if the response is consistent.
   * Additionally, the loop will stop when it received a valid response and the next <NEXT_RESPONSE_EMPTY_BREAK> responses
   * are empty.
   * @returns {Promise<TotalPlayTime[]>} - The aggregated results of the total playtime for the requested UID, that have been processed by Spark and stored in the Maria DB.
   */
  async function loopQueryTotalPlaytime(): Promise<TotalPlayTime[]> {
    let responseArray: TotalPlayTime[][] = [];
    let currentResponse: TotalPlayTime[] = [];
    let nextReponseEmptyCounter: number = 0;
    let i = 0;

    // Establishes the foundation for the array to be able to compare backwards
    while (i < LOOK_BACK) {
      currentResponse = await queryTotalPlayTime();
      responseArray.push(currentResponse);
      i += 1;
      await sleep(BUFFER_TIME);
    }
    // Compares the Arrays and checks if the function should stop
    while (true) {
      let newResponse = await queryTotalPlayTime();
      if (currentResponse.length !== 0 && newResponse.length === 0) {
        nextReponseEmptyCounter += 1;
      }

      if (nextReponseEmptyCounter > NEXT_RESPONSE_EMPTY_BREAK) {
        nextReponseEmptyCounter += 1;
        break;
      }

      if (
        compareArrays(
          newResponse,
          responseArray[responseArray.length - LOOK_BACK],
        ) &&
        newResponse.length !== 0
      ) {
        break;
      }
      currentResponse = newResponse;
      responseArray.push(currentResponse);
      await sleep(BUFFER_TIME);
    }
    return currentResponse;
  }

  /**
   * Executes multiple queries in parallel to fetch data related to top songs, top artists, and total playtime for a specific user.
   *
   * @returns {Promise<[TrackData[], ArtistData[], TotalPlayTime[]]>} A promise that contains the data for the user in the following format:
   * - The first array contains `TrackData` objects for the songs of the user.
   * - The second array contains `ArtistData` objects for the artists of the user.
   * - The third array contains `TotalPlayTime` objects for the total playtime of the user.
   */
  async function getAllData(): Promise<
    [TrackData[], ArtistData[], TotalPlayTime[]]
  > {
    return await Promise.all([
      loopQueryTopSongs(),
      loopQueryTopArtists(),
      loopQueryTotalPlaytime(),
    ]);
  }

  const [top_songs, top_artist, total_ms_played] = await getAllData();

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

  /**
   * Returns the response for the get request, with the top 10 songs, top 10 artists, and the total playtime for the requested UID.
   */
  const response: ResponseData = {
    spotify_uid: uid,
    top_songs: sortedTopSongs.slice(0, 50),
    top_artist: sortedTopArtist.slice(0, 50),
    total_ms_played: total_ms_played,
  };

  const jsonString = JSON.stringify(response, bigintReplacer);

  return new Response(jsonString, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
