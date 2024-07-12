"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { ArtistData } from "@/app/results/page";
import Image from "next/image";
export interface ArtistDisplayData {
  external_urls?: ExternalUrls;
  followers?: Followers;
  genres?: string[];
  href?: string;
  id?: string;
  images?: Image[];
  name?: string;
  popularity?: number;
  type?: string;
  uri?: string;
  total_msPlayed?: number;
}

export interface ExternalUrls {
  spotify: string;
}

export interface Followers {
  href: null;
  total: number;
}

export interface Image {
  url: string;
  height: number;
  width: number;
}

export default function DisplayArtists(props: { artistData: ArtistData[] }) {
  const [artistsDisplayData, setArtistsDisplayData] = useState<
    ArtistDisplayData[]
  >([]);
  const [count, setCount] = useState(5);
  async function getArtistData(artist_name: string) {
    try {
      const response = await axios.post(
        `/api/get-artist-data`,
        { artist_name },
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("authCode") || "")
              .access_token,
          },
        },
      );

      const artistData = response.data;
      return artistData;
    } catch (error) {
      console.error("Error fetching artist data:", error);
    }
  }

  useEffect(() => {
    const fetchArtistsData = async () => {
      const artistsDataPromises = props.artistData.map(async (artist) => {
        const artistData = await getArtistData(artist.artistName);
        return { ...artistData, total_msPlayed: artist.total_msPlayed };
      });
      const artistsData = await Promise.all(artistsDataPromises);
      setArtistsDisplayData(
        artistsData.filter(
          (data): data is ArtistDisplayData => data !== undefined,
        ),
      );
    };
    fetchArtistsData();
  }, [props.artistData]);

  const capitalizeWords = (s: string) =>
    s
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  return (
    <div className={"w-full"}>
      {artistsDisplayData.length > 0 && (
        <div className={"flex flex-col justify-center items-center space-y-2"}>
          <p className={"text-2xl font-bold text-white"}>
            Your favourite Artists
          </p>
          <div
            key={0}
            className="flex w-full h-full bg-spotify-black-light rounded-md items-center"
          >
            {artistsDisplayData &&
              artistsDisplayData[0] &&
              artistsDisplayData[0].images &&
              artistsDisplayData[0].images[0] && (
                <Image
                  className="h-96 w-96 object-cover rounded-l-md"
                  src={
                    artistsDisplayData[0].images[0]?.url ??
                    "/default-image-url.jpg"
                  }
                  alt={artistsDisplayData[0]?.name ?? "Default Artist Name"}
                  width={artistsDisplayData[0].images[0]?.width ?? 300}
                  height={artistsDisplayData[0].images[0]?.height ?? 300}
                />
              )}
            <div className={"flex flex-col px-4"}>
              <div className={"flex items-center justify-center"}>
                <div
                  className={
                    "flex text-spotify-green text-8xl font-bold h-full align-middle justify-center"
                  }
                >
                  #1
                </div>
                <div className={"flex flex-col justify-between h-max px-4"}>
                  {artistsDisplayData[0] && artistsDisplayData[0].name && (
                    <p className={"text-5xl font-bold self-start"}>
                      {artistsDisplayData[0].name}
                    </p>
                  )}
                  <p className={"self-end"}>
                    {artistsDisplayData &&
                      artistsDisplayData[0] &&
                      artistsDisplayData[0].genres &&
                      artistsDisplayData[0].genres
                        .map((genre) => capitalizeWords(genre))
                        .join(", ")}
                  </p>
                </div>
              </div>
              <div className={"py-8 flex flex-col justify-center"}>
                {artistsDisplayData[0] && artistsDisplayData[0].name && (
                  <p className={"text-xl text-left"}>
                    You listened to {artistsDisplayData[0].name} for a total of:
                  </p>
                )}
                {artistsDisplayData &&
                  artistsDisplayData[0] &&
                  artistsDisplayData[0].total_msPlayed && (
                    <p
                      className={
                        "font-bold text-7xl text-spotify-green text-center"
                      }
                    >
                      {Math.round(
                        artistsDisplayData[0].total_msPlayed / 3600000,
                      )}{" "}
                      <span className={"text-white"}>
                        {Math.round(
                          artistsDisplayData[0].total_msPlayed / 3600000,
                        ) === 1
                          ? "hour"
                          : "hours"}
                      </span>
                    </p>
                  )}
              </div>
            </div>
          </div>

          {artistsDisplayData.length > 0 &&
            artistsDisplayData.slice(1, count).map((artist, index) => (
              <div
                className={
                  "flex w-full bg-spotify-black-light rounded-md justify-between items-center"
                }
                key={index + 1}
              >
                <div className={"h-24 w-28 pr-5 min-w-28"}>
                  {artist &&
                    artist.images &&
                    artist.images[0] &&
                    artist.name && (
                      <Image
                        className={"h-24 w-28 object-cover rounded-l-md"}
                        src={artist.images[0]?.url}
                        alt={artist.name}
                        width={artist.images[0].width}
                        height={artist.images[0].height}
                      />
                    )}
                </div>
                <div className={"w-full flex flex-shrink"}>
                  {artist && artist.name && (
                    <p className={"text-left w-full text-3xl font-bold"}>
                      <span className={"text-spotify-green"}>
                        {" "}
                        #{index + 2}
                      </span>{" "}
                      {artist.name}
                    </p>
                  )}
                </div>
                {artist && artist.total_msPlayed && (
                  <p
                    className={
                      "font-bold text-3xl text-spotify-green text-center w-1/3"
                    }
                  >
                    {" "}
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

          {count < artistsDisplayData.length && (
            <button
              onClick={() => setCount((prevCount) => prevCount + 5)}
              className={
                "bg-spotify-green text-spotify-black rounded-full px-4 py-2 text-center font-bold text-xl"
              }
            >
              Show more
            </button>
          )}
          {count >= artistsDisplayData.length && (
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
      {artistsDisplayData.length === 0 && (
        <div
          role="status"
          className={"flex flex-col py-24 justify-center items-center w-full"}
        >
          <p className={"text-2xl font-bold text-white py-12"}>
            Your favourite Artists
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
