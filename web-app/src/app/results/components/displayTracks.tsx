import axios from "axios";
import { useEffect } from "react";

export default function DisplayTracks() {
  async function getTrackData(track: {
    track_name: string;
    ms_played: number;
  }) {
    try {
      const response = await axios.post(
        `/api/get-track-data`,
        { track_name: track.track_name },
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("authCode") || "")
              .access_token,
          },
        },
      );

      const trackData = response.data;
      trackData.ms_played = track.ms_played;
    } catch (error) {
      console.error("Error fetching track data:", error);
    }
  }

  /*useEffect(() => {
        if (favoriteTrack && favoriteTrack.track_name !== "") {
            getTrackData(favoriteTrack).then((r) => {
                setFavoriteTrackDisplayData(r);
            });
            getUserID();
        }
    }, [favoriteTrack]);

     {favoriteTrackDisplayData.name && (
          <div className="bg-neutral-800 p-6 rounded-lg flex flex-col items-center w-4/10">
            {" "}
            {/* Anpassung der Breite
<div className="flex items-center">
    <div className="mr-6">
        <p className="text-2xl text-spotify-green text-center">
            Your favourite track is:
        </p>
        <p className="text-2xl font-bold text-white text-center">
            {favoriteTrackDisplayData.name}
        </p>
        {favoriteTrackDisplayData.artists.map((artist, i) => (
            <p key={i} className="text-xl text-center">
                {artist.name}
            </p>
        ))}
    </div>
    <div className="border-2 border-white p-1">
        <Image
            src={favoriteTrackDisplayData.album.images[0].url || ""}
            alt="Album cover"
            width={150}
            height={150}
        />
    </div>
</div>
{favoriteTrackDisplayData.preview_url && (
    <div className="flex flex-col items-center mt-5 mr-40">
        <audio
            ref={audioRef}
            src={favoriteTrackDisplayData.preview_url}
            autoPlay={true}
            controls
        />
        <button onClick={togglePlayPause} className="mt-2">
            {isPlaying ? "Pause" : "Play"}
        </button>
    </div>
)}
</div>
)}
    */

  return (
    <div>
      <h1>Display Tracks</h1>
    </div>
  );
}
