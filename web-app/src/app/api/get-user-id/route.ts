import axios from "axios";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const auth_token = request.headers.get("Authorization");

    // User profile URL
    const userProfileUrl = "https://api.spotify.com/v1/me";

    // Headers for Spotify API
    const headers = {
      Authorization: "Bearer " + auth_token,
      "Content-Type": "application/json",
    };

    // Fetch user profile to get user ID and display name
    const userProfileResponse = await axios.get(userProfileUrl, { headers });

    // Return the user ID and display name
    return new Response(JSON.stringify(userProfileResponse.data), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    // Adjust the error handling logic as needed
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
    });
  }
}
