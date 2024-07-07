"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Image from 'next/image'

const Page = () => {
  const [result, setResult] = useState("");
  const [favoriteTrack, setFavoriteTrack] = useState<{ track_name: string; ms_played: number }>({
    track_name: "",
    ms_played: 0,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [favoriteTrackDisplayData, setFavoriteTrackDisplayData] = useState({
    preview_url: null,
    artists: [{ name: null }],
    album_name: null,
    album: { images: [{ url: null, width: 0, height: 0 }], name: null },
    name: null,
    image_url: null,
    ms_played: 0,
  });

  const [favoriteArtistDisplayData, setFavoriteArtistDisplayData] = useState({
    name: null,
    images: [{ url: null, width: 0, height: 0 }],
    genres: [],
    ms_played : 0,
  });

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    // Ensure audio is paused when the favorite track changes
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [favoriteTrackDisplayData.preview_url]);

  const [favoriteArtist, setFavoriteArtist] = useState<{ artist_name: string; ms_played: number }>({
    artist_name: "",
    ms_played: 0,
  });

  const user = {
    spotifyUserId: "your_spotify_user_id",
    topTracks: [
      { track_name: "Turandot", ms_played: 420000 },
      { track_name: "Bibi Blocksberg Lied", ms_played: 410000 },
      { track_name: "Was ist los", ms_played: 370000 },
    ],
    total_minutes_played_track: 30,
    topArtists: [
      { artist_name: "Vega", ms_played: 300000 },
      { artist_name: "Haftbefehl", ms_played: 240000 },
    ],
    total_minutes_played_artist: 30,
  };

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

  useEffect(() => {
  findFavorites();
}, []);

useEffect(() => {
  if (favoriteTrack) {
    getTrackData(favoriteTrack);
  }
}, [favoriteTrack]);

  useEffect(() => {
    if (favoriteArtist.artist_name) {
      getArtistData(favoriteArtist.artist_name);
    }
  }, [favoriteArtist]);

  async function getTrackData(track: { track_name: string; ms_played: number }) {
    try {
      const response = await axios.post(
        `/api/get-track-data`,
        { track_name: track.track_name },
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("authCode") || "").access_token,
          },
        }
      );

      const trackData = response.data;
      trackData.ms_played = track.ms_played;
      setFavoriteTrackDisplayData(trackData);
    } catch (error) {
      console.error("Error fetching track data:", error);
    }
  }

  async function getArtistData(artist_name: string) {
    try {
      const response = await axios.post(
        `/api/get-artist-data`,
        { artist_name },
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("authCode") || "").access_token,
          },
        }
      );

      const artistData = response.data;
      setFavoriteArtistDisplayData(artistData);
    } catch (error) {
      console.error("Error fetching artist data:", error);
    }
  }

  const fetchData = async () => {
    try {
      const response = await axios.get("/api/analyzed-data");
      setResult(response.data);
    } catch (error) {
      console.error("Error fetching analyzed data:", error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mt-10 mb-4 bg-spotify-green rounded-full box-border">
        Your favourite Artist
      </h1>
      {favoriteArtistDisplayData.name && (
        <div>
          <p className="text-xl mt-5">{favoriteArtistDisplayData.name}</p>
          {favoriteArtistDisplayData.images[0].url && (
            <Image
              src={favoriteArtistDisplayData.images[0].url}
              alt="Artist image"
              width={favoriteArtistDisplayData.images[0].width}
              height={favoriteArtistDisplayData.images[0].height}
            />
          )}
          <p className="text-xl mt-5">Genres: {favoriteArtistDisplayData.genres.join(", ")}</p>
        </div>
      )}
      <h1 className="text-2xl font-bold mt-80 mb-4 bg-spotify-green rounded-full">
        Your most listened track
      </h1>
      {favoriteTrackDisplayData.name && (
        <div>
          <p className="text-xl mt-5">{favoriteTrackDisplayData.name}</p>
          {favoriteTrackDisplayData.artists.map((artist, i) => (
            <p key={i} className="text-xl mt-5">{artist.name}</p>
          ))}
          <Image
            src={favoriteTrackDisplayData.album.images[0].url || ""}
            alt="Album cover"
            width={favoriteTrackDisplayData.album.images[0].width}
            height={favoriteTrackDisplayData.album.images[0].height}
          />
          <div className="flex flex-col items-center">
            <audio ref={audioRef} src={favoriteTrackDisplayData.preview_url || ""} autoPlay={true} controls />
            <button onClick={togglePlayPause}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
