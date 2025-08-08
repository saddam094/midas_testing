"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import CreateProfileModal from "./CreateProfileModal";
import Link from "next/link";

const Staff = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [staffData, setStaffData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [currentItems, setCurrentItems] = useState([]);
  const [lastKey, setLastKey] = useState("");

  const fetchData = async (lastKey = "", append = false) => {
    try {
      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_staff_all_data",
        {
          limit: 200,
          lastKey: lastKey,
        }
      );

      // console.log("[STAFF]: ", response.data["body-json"]["body"]);
      const data = response.data["body-json"]["body"];

      if (append) {
        setCurrentItems((prevItems) => [...prevItems, ...data.data]);
      } else {
        setCurrentItems(data.data);
      }

      setLastKey(data.lastKey || "");
      setIsLoading(false);
      setIsDataLoading(false);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching Staff data: ", error);
    }
  };

  useEffect(() => {
    fetchData("", false);
  }, [modalKey]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setModalKey((prevKey) => prevKey + 1); // Update modalKey to trigger a rerender
  };

  const handleNext = () => {
    setIsDataLoading(true);
    if (lastKey) {
      fetchData(lastKey, true);
    }
  };

  return isLoading ? (
    <div className="flex justify-center items-center h-screen">
      <svg
        className="animate-spin  h-10 w-10"
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
  ) : (
    <div className="py-2" key={modalKey}>
      {" "}
      <div className="flex flex-row">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={() => {}}
          className="w-full p-2 mb-4 mr-2 border rounded"
        />
        <button
          className="w-1/4 bg-blue-500 hover:bg-blue-700 text-white mb-4 rounded"
          onClick={openModal}
        >
          Create Profile
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-800 text-white">Name</th>
              <th className="border p-2 bg-gray-800 text-white">Email</th>
              <th className="border p-2 bg-gray-800 text-white">Role</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-200"}
              >
                <td className="border p-2">
                  <Link href="" className="hover:underline text-blue-700">
                    {item.name.toUpperCase()}
                  </Link>
                </td>

                <td className="border p-2">{item.email}</td>
                <td className="border p-2">
                  {item.role.join(", ").toUpperCase()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* load more  */}
      <div className="flex justify-center mt-4">
        <button
          onClick={handleNext}
          disabled={!lastKey}
          className={`px-4 py-2 text-white rounded ${
            !lastKey
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isDataLoading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
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
          ) : (
            "Load More"
          )}
        </button>
      </div>
      <CreateProfileModal isOpen={isModalOpen} onRequestClose={closeModal} />
    </div>
  );
};

export default Staff;
