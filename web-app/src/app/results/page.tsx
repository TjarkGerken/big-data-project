"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

interface TrackData {
  UID: string;
  trackName: string;
  artistName: string;
  total_msPlayed: number;
}

interface ArtistData {
  UID: string;
  artistName: string;
  total_msPlayed: number;
}

interface TotalPlayTime {
  UID: string;
  total_msPlayed: number;
}

export interface JSONResponseData {
  spotify_uid: string;
  top_songs: TrackData[];
  top_artist: ArtistData[];
  total_ms_played?: TotalPlayTime[];
}

function RenderResults() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid") || "";

  const [result, setResult] = useState<JSONResponseData>({
    spotify_uid: uid,
    top_songs: [],
    top_artist: [],
    total_ms_played: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");

  async function getUserID() {
    try {
      const response = await axios.post(
        "/api/get-user-id",
        {},
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("authCode") || "")
              .access_token,
          },
        },
      );

      const userData = response.data;
      setUserName(userData.displayName || userData.userId);
    } catch (error) {
      console.error("Error fetching user ID:", error);
    }
  }

  async function getFromCache(uid: string) {
    try {
      const response = await axios.get<JSONResponseData>(
        "/api/check-cache?uid=" + uid,
      );
      return response.data;
    } catch (error) {
      console.error("Error checking cache:", error);
      return null;
    }
  }

  async function fetchData(uid: string) {
    const response = await axios
      .get<JSONResponseData>("/api/fetch-db?uid=" + uid)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error("Error fetching analyzed data:", error);
      });
    if (response) {
      return response;
    }
  }

  async function sendTracksToKafka(uid: string) {
    if (!uid || uid === "") {
      return;
    }
    axios.post("/api/send-to-kafka", { uid: uid }).then((response) => {});
  }

  async function setCache(uid: string, data: JSONResponseData) {
    try {
      await axios.post("/api/set-cache", { uid: uid, data: data });
    } catch (error) {
      console.error("Error setting cache:", error);
    }
  }

  async function fetchDataLoop(
    uid: string,
    attempt = 0,
    maxAttempts = 60,
  ): Promise<JSONResponseData> {
    const data = await fetchData(uid);
    if (data && data.top_artist && data.total_ms_played && data.top_songs) {
      return data;
    } else if (attempt < maxAttempts) {
      return new Promise((resolve) =>
        setTimeout(
          () => resolve(fetchDataLoop(uid, attempt + 1, maxAttempts)),
          5000,
        ),
      );
    } else {
      throw new Error("Maximum attempts reached, data could not be fetched.");
    }
  }

  async function sortArrays() {
    const topSongs = result.top_songs.sort(
      (a, b) => b.total_msPlayed - a.total_msPlayed,
    );
    const topArtists = result.top_artist.sort(
      (a, b) => b.total_msPlayed - a.total_msPlayed,
    );
    setResult({ ...result, top_songs: topSongs, top_artist: topArtists });
  }

  useEffect(() => {
    const getData = async () => {
      const cachedData = await getFromCache(uid);
      if (cachedData) {
        setResult(cachedData);
        setIsLoading(false);
      } else {
        await sendTracksToKafka(uid);
        await fetchDataLoop(uid)
          .then((r) => {
            if (r) {
              setResult(r);
              setCache(uid, r);
              sortArrays();
              getUserID();
              setIsLoading(false);
            }
          })
          .catch((error) => {
            setError(true);
          });
      }
    };

    getData();
  }, [uid]);

  if (isLoading || !error) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex justify-center items-center h-screen">
          <p>Loading...</p>
        </div>
      </Suspense>
    );
  }

  if (error) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex justify-center items-center h-screen">
          <p>Error fetching data</p>
        </div>
      </Suspense>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <nav className="w-full fixed top-0 bg-black text-white shadow-md z-10 flex items-center justify-between px-4 h-16">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
          <span>Home</span>
        </div>
        <div className="text-center text-lg">
          <p>Hey {userName},</p>
          <p className="text-spotify-green">
            This is Your Personal Spotify Recap
          </p>
        </div>
        <div>
          <Image
            src="/Spotify.png"
            alt="Spotify"
            className="h-14 w-full object-cover"
            width={300}
            height={168}
          />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white"></div>
      </nav>
      <div className="flex text-2xl font-bold flex-col items-center mt-24">
        <h1>Top Artist</h1>
      </div>
      <div className="flex flex-col items-center mt-6 w-full">
        {" "}
        {/* Anpassung der Breite */}
        Artist
        <div className="flex text-2xl font-bold flex-col items-center mt-50 mb-7">
          <h1>Top Track</h1>
        </div>
        Top Track
      </div>
    </div>
  );
}

export default function Results() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col items-center w-full">
        <RenderResults />
      </div>
    </Suspense>
  );
}
