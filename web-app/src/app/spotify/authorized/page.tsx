import Link from "next/link";

export default function SpotifyAuthorized(){
    return(
     <div className={"flex  flex-col h-screen justify-center items-center bg-spotify-black text-white p-4 space-y-4"}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
             className="size-24 text-spotify-green">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
        </svg>
        <span>Thank you! We successfully connected to your Spotify Account.</span>
        <Link className={"py-2 px-4 font-bold bg-spotify-green text-spotify-black rounded-full"} href={"/"}>Go Home</Link>

    </div>)

}