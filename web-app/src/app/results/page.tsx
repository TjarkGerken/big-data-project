"use client";
import {useEffect, useRef, useState} from "react";
import axios from "axios";
import Image from 'next/image'


const Page = () => {
  const [result, setResult] = useState("");
  const [favoriteTrack, setFavoriteTrack] = useState({
    track_name: "",
    ms_played: 0,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);


  const [favoriteTrackDisplayData, setFavoriteTrackDisplayData] = useState({
    preview_url: null,
    artists: [{name: null}],
    album_name: null,
    album: {images : [{url: null, width: 0, height: 0}], name: null},
    name: null,
    image_url: null,
    ms_played: 0,
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

  const [favoriteArtist, setFavoriteArtist] = useState({
    artist_name: "",
    ms_played: 0,
  });
  const user = {
    spotifyUserId: "your_spotify_user_id",
    topTracks: [
      { track_name: "Rap über Hass", ms_played: 420000 },
      { track_name: "Bibi Blocksberg Lied", ms_played: 410000 },
      { track_name: "Was ist los", ms_played: 370000 },
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
    // This effect only runs once on component mount to find favorites
  }, [findFavorites]);

  useEffect( () => {
    if (favoriteTrack.track_name) {
      // Ensure favoriteTrack has been set before calling getTrackData
      getTrackData(favoriteTrack);
    }
    // This effect runs whenever favoriteTrack changes, including after it's first set
  }, [favoriteTrack]);


  async function getTrackData(track: { track_name: string, ms_played: number}) {
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
    setFavoriteTrackDisplayData(trackData)
  }

  const sgetArtistData = async (artistID: string) => {
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
            <div>
              <p className="text-xl mt-5">{favoriteTrackDisplayData.name}</p>
              {favoriteTrackDisplayData.artists.map((artist, i) => (
                  <p key={i} className="text-xl mt-5">{artist.name}</p>
              ))}
            </div>
        )}
        <Image
            src={favoriteTrackDisplayData.album.images[0].url || ""}
            alt="Album cover"
            width={favoriteTrackDisplayData.album.images[0].width}
            height={favoriteTrackDisplayData.album.images[0].height}/>
        <div className="flex flex-col items-center">
          {/* Existing elements */}
          <audio ref={audioRef} src={favoriteTrackDisplayData.preview_url || ""} autoPlay={true} controls/>
          {/*<iframe src="./silence.mp3" allow="autoplay" id="audio" className={"invisible"}></iframe>*/}
          <button onClick={togglePlayPause}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          {/* More existing elements */}
        </div>
      </div>
  );
};

export default Page;
