'use client'
import {useRouter} from "next/navigation";

function generateRandomString(length: number) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

export default function SpotifyAuthorization() {
    const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "";
    const redirect_uri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || "localhost:3000/activate-spotify";
    const state = generateRandomString(16);
    const scope =    'user-read-private user-read-email';

    const router = useRouter()
    const query = 'https://accounts.spotify.com/authorize?'+ querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
    })

     function initiateSpotifyAuthorization(){
             router.push(query);
    }

    return (
        <div className={"bg-black text-green-800 rounded-full py-4 px-2"}>
            <button onClick={initiateSpotifyAuthorization}>Authorize with your Spotify Account</button>
        </div>
    );
}
