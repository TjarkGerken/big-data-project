"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import Image from "next/image";
import { TrackDisplayData } from "@/app/results/components/interfaces/trackDisplayData";
import { TrackData } from "@/app/results/interfaces/interfaces";

export default function DisplayTracks(props: { trackData: TrackData[] }) {
  const trackData = props.trackData;
  const [trackDisplayData, setArtistsDisplayData] = useState<
    TrackDisplayData[]
  >([]);
  const [count, setCount] = useState(5);

  /**
   * Fetches track data by track name from the backend.
   * @param track_name
   */
  async function getTrackData(track_name: string) {
    try {
      const response = await axios.post(
        `/api/get-track-data`,
        { track_name: track_name },
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("authCode") || "")
              .access_token,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching artist data:", error);
    }
  }

  useEffect(() => {
    // Fetches track data for each track in the trackData array
    const fetchTrackData = async () => {
      const trackDataPromises = trackData.map(async (track) => {
        const trackData = await getTrackData(track.trackName);
        return { ...trackData, total_msPlayed: track.total_msPlayed };
      });
      const allTrackData = await Promise.all(trackDataPromises);
      setArtistsDisplayData(
        allTrackData.filter(
          (data): data is TrackDisplayData => data !== undefined,
        ),
      );
    };
    fetchTrackData();
  }, [trackData]);

  return (
    <div className={"w-full"}>
      {trackDisplayData.length > 0 && (
        <div className={"flex flex-col justify-center items-center space-y-2"}>
          <p className={"text-2xl font-bold text-white"}>
            Your favourite Tracks
          </p>
          <div
            key={0}
            className="flex w-full h-full bg-spotify-black-light rounded-md items-center"
          >
            {trackDisplayData &&
              trackDisplayData[0] &&
              trackDisplayData[0].name &&
              trackDisplayData[0].album &&
              trackDisplayData[0].artists && (
                <Image
                  className={"h-96 w-96 object-cover rounded-l-md"}
                  src={trackDisplayData[0].album.images[0]?.url}
                  alt={trackDisplayData[0].name}
                  width={trackDisplayData[0].album.images[0]?.width}
                  height={trackDisplayData[0].album.images[0]?.height}
                />
              )}
            <div className={"flex flex-col w-full px-4"}>
              <div className={"flex items-center justify-center self-start"}>
                <div
                  className={
                    "flex text-spotify-green text-8xl font-bold h-full align-middle justify-center"
                  }
                >
                  #1
                </div>
                <div className={"flex flex-col justify-between h-max px-4"}>
                  <p className={"text-5xl font-bold self-start"}>
                    {trackDisplayData[0].name}
                  </p>
                  {trackDisplayData[0] && trackDisplayData[0].artists && (
                    <p className={"self-end"}>
                      {trackDisplayData[0].artists
                        .map((artist) => artist.name)
                        .join(", ")}
                    </p>
                  )}
                </div>
              </div>
              <div className={"py-8 flex flex-col justify-center"}>
                {trackDisplayData[0] && trackDisplayData[0].name && (
                  <p className={"text-xl text-left"}>
                    You listened to &quot;{trackDisplayData[0].name}&quot; for a
                    total of:
                  </p>
                )}
                <p
                  className={
                    "font-bold text-7xl text-spotify-green text-center"
                  }
                >
                  {trackDisplayData[0] &&
                    trackDisplayData[0].total_msPlayed && (
                      <>
                        {Math.round(
                          trackDisplayData[0].total_msPlayed / 3600000,
                        )}
                        <span className={"text-white"}>
                          {" "}
                          {Math.round(
                            trackDisplayData[0].total_msPlayed / 3600000,
                          ) === 1
                            ? " hour"
                            : " hours"}
                        </span>
                      </>
                    )}
                </p>
              </div>
            </div>
          </div>

          {trackDisplayData.slice(1, count).map((artist, index) => (
            <div
              className={
                "flex w-full bg-spotify-black-light rounded-md justify-between items-center"
              }
              key={index + 1}
            >
              <div className={"h-24 w-28 pr-5 min-w-28"}>
                {artist &&
                  artist.album &&
                  artist.album.images &&
                  artist.name && (
                    <Image
                      className={"h-24 w-28 object-cover rounded-l-md"}
                      src={artist.album.images[0]?.url}
                      alt={artist.name}
                      width={artist.album.images[0].width}
                      height={artist.album.images[0].height}
                    />
                  )}
              </div>
              <div className={"w-full flex flex-shrink"}>
                <p className={"text-left w-full text-3xl font-bold"}>
                  <span className={"text-spotify-green"}> #{index + 2}</span>{" "}
                  {artist.name}
                </p>
              </div>
              {artist && artist.total_msPlayed && (
                <p
                  className={
                    "font-bold text-3xl text-spotify-green text-center w-1/3"
                  }
                >
                  {Math.round(artist.total_msPlayed / 3600000)}{" "}
                  <span className={"text-white"}>
                    {Math.round(artist.total_msPlayed / 3600000) === 1
                      ? "hour"
                      : "hours"}
                  </span>
                </p>
              )}
            </div>
          ))}
          {count < trackDisplayData.length && (
            <button
              onClick={() => setCount((prevCount) => prevCount + 5)}
              className={
                "bg-spotify-green text-spotify-black rounded-full px-4 py-2 text-center font-bold text-xl"
              }
            >
              Show more
            </button>
          )}
          {5 < count && (
            <button
              onClick={() => setCount((prevCount) => prevCount - 5)}
              className={
                "bg-spotify-green text-spotify-black rounded-full px-4 py-2 text-center font-bold text-xl"
              }
            >
              Show less
            </button>
          )}
        </div>
      )}
      {trackDisplayData.length === 0 && (
        <div
          role="status"
          className={"flex flex-col py-24 justify-center items-center w-full"}
        >
          <p className={"text-2xl font-bold text-white py-12"}>
            Your favourite Tracks
          </p>
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
          <span className="sr-only">Loading...</span>
        </div>
      )}
    </div>
  );
}
