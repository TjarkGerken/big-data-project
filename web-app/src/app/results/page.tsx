"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { get } from "http";

const Page = () => {
  const [result, setResult] = useState("");
  const [favoriteTrack, setFavoriteTrack] = useState({track_name: "", ms_played: 0 } );
  const [favoriteArtist, setFavoriteArtist] = useState( {artist_name: "", ms_played: 0 } );
  const user = {
    spotifyUserId: "your_spotify_user_id",
    topTracks: [
      { track_name: "Song 1", ms_played: 360000 },
      { track_name: "Song 2", ms_played: 240000 },
      { track_name: "Song 3", ms_played: 180000 },
      { track_name: "Song 4", ms_played: 120000 },
      { track_name: "Song 5", ms_played: 60000 },
      { track_name: "Song 6", ms_played: 300000 },
      { track_name: "Song 7", ms_played: 240000 },
      { track_name: "Song 8", ms_played: 180000 },
      { track_name: "Song 9", ms_played: 120000 },
      { track_name: "Song 10", ms_played: 60000 },
    ],
    total_minutes_played_track: 30,
    topArtists: [
      { artist_name: "Artist 1", ms_played: 300000 },
      { artist_name: "Artist 2", ms_played: 240000 },
      { artist_name: "Artist 3", ms_played: 180000 },
      { artist_name: "Artist 4", ms_played: 120000 },
      { artist_name: "Artist 5", ms_played: 60000 },
      { artist_name: "Artist 6", ms_played: 360000 },
      { artist_name: "Artist 7", ms_played: 240000 },
      { artist_name: "Artist 8", ms_played: 180000 },
      { artist_name: "Artist 9", ms_played: 120000 },
      { artist_name: "Artist 10", ms_played: 60000 },
    ],
    total_minutes_played_artist: 30,
  };

  useEffect(() => {
    //fetchData();
    findFavorites();
    //getTrackData('Ich will es bar');
    //getArtistData();
  }, []);

  async function getTrackData(trackId: string) {
    const response = await axios.post(
      `/api/get-track-data`,
      { track_name: trackId },
      { headers: { Authorization: JSON.parse(localStorage.getItem("authCode")|| "").access_token } },
    );
    return response.data;
  }

  const getArtistData = async (artistID:string) => {
    const response = await axios.get(`/api/artist-data/${artistID}`);
    return response.data;
  };

  const fetchData = async () => {
    try {
      const response = await axios.get("/api/analyzed-data");
      setResult(response.data);
    } catch (error) {
      console.error("Error fetching analyzed data:", error);
    }
  };

  /*const trackId = ''; 
        getTrackData(trackId)
            .then(trackData => {
                console.log('Track data:', trackData);
            })
            .catch(error => console.error('Error fetching track data:', error));

    const artistID = '';
        /*getArtistData(artistID)
            .then(artistData => {
                const artistImages = artistData.images;
                const artistImageUrl = artistImages.length > 0 ? artistImages[0].url : null;
                console.log('Artist image URL:', artistImageUrl);
            })
            .catch(error => console.error('Error fetching artist data:', error)); */

  const findFavorites = () => {
    const favoriteTrack = user.topTracks.reduce((prev, current) => {
      return prev.ms_played > current.ms_played ? prev : current;
    });

    const favoriteArtist = user.topArtists.reduce((prev, current) => {
      return prev.ms_played > current.ms_played ? prev : current;
    });

    setFavoriteTrack(favoriteTrack);
    setFavoriteArtist(favoriteArtist);
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mt-10 mb-4 bg-spotify-green rounded-full box-border">
        Your favourite Artist
      </h1>
      {favoriteArtist && (
        <p className="text-xl mt-5">{favoriteArtist.artist_name}</p>
      )}
      <h1 className="text-2xl font-bold mt-80 mb-4 bg-spotify-green rounded-full">
        Your most listened track
      </h1>
      {favoriteTrack && (
        <p className="text-xl mt-5">{favoriteTrack.track_name}</p>
      )}
      <button
          onClick={() => getTrackData("Ich will es bar")}
        className="bg-spotify-green text-white font-bold rounded-full mt-10 px-5 py-2"
      >
        Get my data
      </button>
    </div>
  );
};

export default Page;
