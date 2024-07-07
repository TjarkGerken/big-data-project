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
    ms_played: 0,
  });

  const [userName, setUserName] = useState("");

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
      { track_name: "Was ist los", ms_played: 450000 },
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

  useEffect(() => {
    getUserID();
  }, []);

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

  async function getUserID() {
    try {
      const response = await axios.get("/api/get-user-id", {
        headers: {
          Authorization: JSON.parse(localStorage.getItem("authCode") || "").access_token,
        },
      });
  
      const userData = response.data;
      setUserName(userData.displayName || userData.userId);
    } catch (error) {
      console.error("Error fetching user ID:", error);
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
    <div className="flex flex-col items-center w-full">
      <nav className="w-full fixed top-0 bg-black text-white shadow-md z-10 flex items-center justify-between px-4 h-16">
        <div className="flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7m-9 5v6m4 0v-6m-4 0h4"></path>
          </svg>
          <span>Home</span>
        </div>
        <div className="text-center text-lg">
          <p>Hey {userName},</p>
          <p className="text-spotify-green">This is Your Personal Spotify Recap</p>
        </div>
        <div>
          <img src="/path/to/spotify-logo.png" alt="Spotify" className="h-8" />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white"></div>
      </nav>
      <div className="flex text-2xl font-bold flex-col items-center mt-24">
        <h1>Top Artist</h1>
      </div>
      <div className="flex flex-col items-center mt-6 w-full"> {/* Anpassung der Breite */}
        {favoriteArtistDisplayData.name && (
          <div className="bg-neutral-800 p-6 rounded-lg flex flex-col items-center mb-20 w-4/10"> {/* Anpassung der Breite */}
            <div className="flex items-center">
              <div className="mr-6">
                <p className="text-2xl text-spotify-green">Your most favourite Artist is:</p>
                <p className="text-2xl font-bold text-white text-center">{favoriteArtistDisplayData.name}</p>
              </div>
              {favoriteArtistDisplayData.images[0].url && (
                <div className="border-2 border-white p-1 ">
                  <Image
                    src={favoriteArtistDisplayData.images[0].url}
                    alt="Artist image"
                    width={150}
                    height={150}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex text-2xl font-bold flex-col items-center mt-50 mb-7">
          <h1>Top Track</h1>
        </div>
        {favoriteTrackDisplayData.name && (
          <div className="bg-neutral-800 p-6 rounded-lg flex flex-col items-center w-4/10"> {/* Anpassung der Breite */}
            <div className="flex items-center">
              <div className="mr-6">
                <p className="text-2xl text-spotify-green text-center">Your most favourite track is:</p>
                <p className="text-2xl font-bold text-white text-center">{favoriteTrackDisplayData.name}</p>
                {favoriteTrackDisplayData.artists.map((artist, i) => (
                  <p key={i} className="text-xl text-center">{artist.name}</p>
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
                <audio ref={audioRef} src={favoriteTrackDisplayData.preview_url} autoPlay={true} controls />
                <button onClick={togglePlayPause} className="mt-2">
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
