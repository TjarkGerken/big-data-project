"use client";

import SpotifyAuthorization from "@/app/_components/spotifyAuthorization";
import ResetSpotifyAuthorization from "./_components/ResetSpotifyAuthorization";
import React, { useEffect, useState } from "react";
import DataRequestForm from "@/app/_components/DataRequestForm";

export default function Home() {
  const [authCode, setAuthCode] = useState<{} | null>(null);
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const authCode = localStorage.getItem("authCode");
      if (authCode) {
        setAuthCode(JSON.parse(authCode));
        setIsDisabled(false);
      } else {
        setIsDisabled(true);
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <main className="flex min-h-screen h-screen max-w-screen bg-spotify-black items-center justify-between pt-56 px-48 pb-20 ">
      <div className={"flex flex-col w-1/2 h-full  space-y-36 items-center"}>
        <div
          className={
            "flex flex-col text-white text-7xl font-bold justify-self-start w-full"
          }
        >
          <span className={"text-spotify-green"}>Spotify</span>
          <span>Mini Wrapped</span>
          <div className={"text-white text-3xl mt-5"}>
            Analyse your spotify usage.
          </div>
        </div>
        {!authCode && (
          <div className={"w-3/4 flex justify-center"}>
            <SpotifyAuthorization />
          </div>
        )}
        {authCode && (
          <div className="flex flex-col justify-end w-full h-full">
            <ResetSpotifyAuthorization />
          </div>
        )}
      </div>

      <div className={"w-1/2 h-full justify-end"}>
        <DataRequestForm disabled={isDisabled} />
      </div>
    </main>
  );
}
