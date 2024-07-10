import axios from "axios";

export default function fetchFromDB() {
  async function fetchFromDB() {
    axios.get("/api/fetch-db?uid=Tjark").then(() => {
    });
  }
  return (
    <button
      className={
        "bg-spotify-green text-spotify-black rounded-full px-8 py-4 text-center font-bold text-xl"
      }
      onClick={fetchFromDB}
    >
      Fetch from DB
    </button>
  );
}
