import { useRouter } from "next/navigation";
import React from "react";

export default function ResetSpotifyAuthorization() {
  const router = useRouter();
  function resetAuth() {
    localStorage.removeItem("authCode");
    localStorage.removeItem("refreshToken");
    window.location.reload();
  }
  return (
    <button onClick={resetAuth}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-14 text-white"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
        />
      </svg>
    </button>
  );
}
