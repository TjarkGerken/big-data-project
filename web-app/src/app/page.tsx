"use client"

import SpotifyAuthorization from "@/app/_components/spotifyAuthorization";
import ResetSpotifyAuthorization from "./_components/ResetSpotifyAuthorization";
import SendDemoRequest from "./_components/sendDemoRequest";

export default function Home() {
  const authCode = localStorage.getItem("authCode")

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between  text-sm flex flex-col space-y-4">
        {!authCode && <div> <SpotifyAuthorization/> </div>}
        {authCode && <div className={"flex flex-col space-y-4"}><p>Auth Code: {authCode}</p> <ResetSpotifyAuthorization/>  <SendDemoRequest/> </div>}
      </div>
    </main>
  );
}
