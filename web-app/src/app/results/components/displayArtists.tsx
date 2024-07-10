import axios from "axios";
import { useEffect } from "react";

export default function DisplayArtists() {
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
  /*useEffect(() => {
        if (favoriteArtist && favoriteArtist.artist_name !== "") {
            getArtistData(favoriteArtist.artist_name).then((r) => {
                setFavoriteArtistDisplayData(r);
            })
        }
    }, [favoriteArtist]);


    {favoriteArtistDisplayData.name && (
          <div className="bg-neutral-800 p-6 rounded-lg flex flex-col items-center mb-20 w-4/10">
            {" "}
<div className="flex items-center">
    <div className="mr-6">
        <p className="text-2xl text-spotify-green">
            Your favourite Artist is:
        </p>
        <p className="text-2xl font-bold text-white text-center">
            {favoriteArtistDisplayData.name}
        </p>
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

    */
}
