"use client"
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {Suspense, useEffect, useRef, useState } from "react";
import axios from "axios";


function HandleAuth(){
  const [fetchError, setFetchError] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const isFirstRender = useRef(true);

  async function sendAuthRequest(setFetchError: React.Dispatch<React.SetStateAction<boolean>>) {
      console.log("About to send request...");
      await axios
        .post("/api/auth-request", { code: code })
        .then((response) => {
          localStorage.setItem(
              "authCode",
              JSON.stringify({ ...response.data, issuedAt: new Date() }),
          );
          localStorage.setItem("refreshToken", response.data.refresh_token);
          router.push("/spotify/authorized");
        })
        .catch((error) => {
          console.error(error);
          setFetchError(true);
        });
  }

  if (code == "access_denied") {
    setFetchError(true);
  }

  useEffect(() => {

        console.log("CP1 : ", code);
      if (code) {
          console.log("CP1 : ", code);
        sendAuthRequest(setFetchError);
          console.log("CP2 : ", code);
      }

  }, [code, sendAuthRequest] );

  return (
      <div>
        {(fetchError || !code) && (
            <div
                className={
                  "text-red-400 flex flex-col space-y-4 items-center justify-center"
                }
            >
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-24 text-spotify-green"
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
              <span className={"text-center"}>
            Something went wrong while connecting your Account.
          </span>
              <Link
                  className={
                    "py-2 px-4 font-bold bg-spotify-green text-spotify-black rounded-full"
                  }
                  href={"/"}
              >
                Go Home
              </Link>
            </div>
        )}

        {code && !fetchError && (
            <div role="status">
              <svg
                  aria-hidden="true"
                  className="w-24 h-24 text-spotify-green animate-spin dark:text-gray-600 fill-spotify-green"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
              >
                <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                />
                <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
        )}

        <div className={"text-sm flex flex-col mt-10"}>

            <span>Debug</span>
            <span>Callback: {code}</span>
            <span>State: {state}</span>

        </div>
      </div>
  )
}


export default function Callback({ params }: { params: { slug: string } }) {
  return (
    <div
      className={
        "flex  flex-col h-screen justify-center items-center bg-spotify-black text-white p-4"
      }
    >
      <Suspense fallback={<div>Loading...</div>}>
            <HandleAuth/>
      </Suspense>
    </div>
  );
}
