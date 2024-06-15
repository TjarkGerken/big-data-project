import { useRouter } from "next/navigation";

export default function ResetSpotifyAuthorization() {
  const router = useRouter();
  function resetAuth() {
    localStorage.removeItem("authCode");
    localStorage.removeItem("refreshToken");
    window.location.reload();
  }
  return (
    <div
      className={
        "bg-spotify-green text-spotify-black rounded-full px-8 py-4 text-center font-bold text-xl"
      }
    >
      <button onClick={resetAuth}>Reset Authorization</button>
    </div>
  );
}
