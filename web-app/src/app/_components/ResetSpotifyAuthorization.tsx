import React from "react";

/**
 * Function that enables user to logout from Spotify.
 * @constructor
 */
export default function ResetSpotifyAuthorization() {
  /**
   * Remove the traces that the user has logged in to Spotify. And reload the page.
   */
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
