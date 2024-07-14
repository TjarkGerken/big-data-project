"use client";
import { Suspense, useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import DisplayArtists from "@/app/results/components/displayArtists";
import DisplayTracks from "@/app/results/components/displayTracks";
import Link from "next/link";
import DisplayTotalTime from "@/app/results/components/displayTotalTime";
import {
  JSONResponseData,
  UserDisplayData,
} from "@/app/results/interfaces/interfaces";

/**
 * Function to render the results page and be used within the suspense.
 * @constructor
 */
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
  const [userName, setUserName] = useState<UserDisplayData>({
    country: "",
    display_name: "",
    email: "",
    href: "",
    id: "",
    images: [],
    product: "",
    type: "",
    uri: "",
  });

  /**
   * Function to get the user ID from the backend.
   */
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
      setUserName(response.data);
    } catch (error) {
      console.error("Error fetching user ID:", error);
    }
  }

  /**
   * Function to get data from the cache.
   * @param uid Requested UID from the URL Parameters
   */
  async function getFromCache(uid: string) {
    try {
      const response = await axios.post<JSONResponseData>(
        "/api/get-from-cache",
        { uid: uid },
      );
      return response.data;
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status === 404
      ) {
        return null;
      }
      console.error("Error checking cache:", error);
      return null;
    }
  }

  /**
   * Function to fetch data from the backend.
   * @param uid
   * @returns {Promise<JSONResponseData | undefined>}
   */
  async function fetchData(uid: string): Promise<JSONResponseData | undefined> {
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

  /**
   * Function to send the userdata to Kafka via the backend.
   * @param uid {string}
   * @returns {Promise<boolean>}
   */
  async function sendTracksToKafka(uid: string): Promise<boolean> {
    if (!uid || uid === "") {
      return false;
    }
    await axios.post("/api/send-to-kafka", { uid: uid }).catch((error) => {
      return false;
    });
    return true;
  }

  /**
   *
   * @param uid
   * @param data
   * @returns {Promise<void>} A promises that resolves
   */
  async function setCache(uid: string, data: JSONResponseData): Promise<void> {
    try {
      await axios.post("/api/set-cache", { uid: uid, data: data });
    } catch (error) {}
  }
  useEffect(() => {
    /**
     * Function to get the appropriate Data. First the Cache is checked. If there is no data in the cache the user data
     * is sent to Kafka and then written to the cache. After loading the users personal data (name) is
     * fetched from the Spotify API.
     */
    const getData = async () => {
      const cachedData = await getFromCache(uid);
      if (cachedData) {
        setResult(cachedData);
        setIsLoading(false);
      } else {
        await sendTracksToKafka(uid)
          .then(async (r: boolean) => {
            if (r) {
              await fetchData(uid)
                .then((r) => {
                  if (r) {
                    setResult(r);
                    setCache(uid, r);
                    setIsLoading(false);
                    getUserID();
                  }
                })
                .catch((error) => {
                  setError(true);
                });
            } else {
              setError(true);
            }
          })
          .catch((error) => {
            setError(true);
          });
      }
    };

    getData();
  }, [uid]);

  if (isLoading && !error) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <div
          role="status"
          className={
            "flex flex-col py-24 justify-center items-center w-full space-y-5"
          }
        >
          <svg
            aria-hidden="true"
            className="w-24 h-24 text-spotify-green animate-spin dark:text-gray-600 fill-spotify-green"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <div>We are preparing your data.</div>
          <span className="sr-only">Loading...</span>
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
    <div className="flex flex-col bg-spotify-black items-center h-full w-full pb-12">
      <div className="flex flex-col items-center w-full mt-6">
        {userName && userName.display_name && (
          <p className="text-3xl font-bold text-white">
            Hey{" "}
            <span className={"text-spotify-green"}>
              {userName.display_name}
            </span>
            , here are your results!
          </p>
        )}
      </div>
      <div className="flex flex-col items-center mt-6 w-2/3 space-y-8">
        {result && result.top_artist.length >0 &&
          <DisplayArtists artistData={result.top_artist}/>}
        { result && result.top_songs.length > 0 &&
        <DisplayTracks trackData={result.top_songs} />}
        { result && result.total_ms_played.length > 0 &&
          <DisplayTotalTime totalTime={result.total_ms_played[0]}/>}
        <Link
          href={"/"}
          className={
            "bg-spotify-green text-spotify-black rounded-full px-4 py-2 text-center font-bold text-xl"
          }
        >
          Go Home
        </Link>
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
