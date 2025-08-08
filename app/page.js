"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MidasGif from "./assets/images/connectingpeople.png";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    console.log(token, role);

    if (token && role) {
      if (role === "admin") {
        router.push("/dashboard/admin");
      } else if (role === "designer") {
        router.push("/dashboard/designer");
      } else if (role === "production") {
        router.push("/dashboard/production");
      } else if (role === "accounts") {
        router.push("/dashboard/accounts");
      } else if (role === "installation") {
        router.push("/dashboard/installation");
      } else if (role === "project_coordinator") {
        router.push("/dashboard/projectcoordinator");
      }
    } else {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    updateOnlineStatus();

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex justify-center items-center h-screen">
          <svg
            className="animate-spin h-10 w-10 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-gradient-to-r from-blue-500 to-indigo-600">
      {!isOnline && (
        <div className="absolute top-0 w-full bg-red-600 text-white text-center py-2 z-50">
          ⚠️ No internet connection. Please check your network.
        </div>
      )}

      <header className="absolute top-0 left-0 w-full p-4 z-10">
        <nav>
          <div className="flex flex-row justify-end mx-8">
            <a
              href="/login"
              className="text-white bg-yellow-500 border border-yellow-500 rounded px-4 py-2 hover:bg-white hover:text-yellow-500 transition-colors shadow-lg transform hover:scale-105"
            >
              Login
            </a>
          </div>
        </nav>
      </header>
      <main className="flex flex-col md:flex-row w-full h-full">
        {/* Left Section */}
        <div className="flex-1 flex flex-col justify-center items-center text-white p-8">
          <h1 className="text-6xl font-bold mb-4 text-center">
            Midas Touch Control
          </h1>
          <p className="text-xl text-center">
            Elevating Your Experience with Excellence.
          </p>
        </div>
        {/* Right Section */}
        <div className="flex-1 relative flex items-center justify-center">
          <div className="w-full h-full relative">
            <Image
              unoptimized={true}
              src={MidasGif}
              layout="fill"
              objectFit="cover"
              alt="MidasGif"
            />
            {/* <div className="absolute inset-0 flex justify-center items-center">
              <h2 className="text-white text-4xl font-semibold bg-black bg-opacity-50 px-6 py-3 rounded-lg">
                Connecting People
              </h2>
            </div> */}
          </div>
        </div>
      </main>
    </div>
  );
}
