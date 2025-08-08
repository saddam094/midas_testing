"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import CreateProjectModal from "./CreateProjectModal";

import NotStartedIcon from "../../../assets/images/notstarted.png";
import OngoingIcon from "../../../assets/images/ongoing.png";
import OnHoldIcon from "../../../assets/images/onhold.png";
import CompletedIcon from "../../../assets/images/completed.png";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const Projects = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [lastKey, setLastKey] = useState("");
  const [currentData, setCurrentData] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const fetchData = async (localLastKey = "", append = false) => {
    try {
      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_accounts_direct_job",
        {
          limit: 200,
          lastKey: lastKey,
        }
      );
      console.log(response.data);
      const data = response.data["body-json"]["body"];

      if (append) {
        setCurrentData((prevData) => [...prevData, ...data.detailedJobs]);
      } else {
        setCurrentData(data.detailedJobs); //data reset on initial load
      }

      setLastKey(data.lastKey || "");
      setIsLoading(false);
      setIsDataLoading(false);
    } catch (error) {
      console.log("Error fetching project list");
    }
  };

  // useEffect(() => {
  //   fetchData("", false);
  // }, [modalKey, isModalOpen]);

  useEffect(() => {
    if (!modalKey && !isModalOpen) {
      fetchData("", false);
    }
  }, [modalKey, isModalOpen]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setModalKey((prevKey) => prevKey + 1);
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
    <>
      <div className="py-2" key={modalKey}>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th
                  className="border p-2 bg-emerald-300 sticky left-0 block"
                  style={{ minWidth: "200px", width: "200px" }}
                >
                  Name
                </th>
                <th
                  className="border p-2 bg-emerald-300"
                  style={{ minWidth: "150px", width: "150px" }}
                >
                  Date
                </th>
                <th
                  className="border p-2 bg-emerald-300"
                  style={{ minWidth: "200px", width: "200px" }}
                >
                  Job Name
                </th>
                <th
                  className="border p-2 bg-amber-300"
                  style={{ minWidth: "200px", width: "200px" }}
                >
                  Project ID
                </th>
                <th
                  className="border p-2 bg-gray-300"
                  style={{ minWidth: "200px", width: "200px" }}
                >
                  Received By
                </th>
                <th
                  className="border p-2 bg-gray-300"
                  style={{ minWidth: "200px", width: "200px" }}
                >
                  Received Date
                </th>
                <th
                  className="border p-2 bg-gray-700 text-white"
                  style={{ minWidth: "200px", width: "200px" }}
                >
                  Received Time
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((project, index) => (
                <tr key={index}>
                  <td
                    className={`border p-2 text-blue-700 flex flex-start sticky left-0 z-10 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-200"
                    }`}
                    style={{ minWidth: "200px", width: "200px" }}
                  >
                    {project.status === "not started" && (
                      <Image
                        src={NotStartedIcon}
                        alt="status_image"
                        height={10}
                        width={25}
                      />
                    )}
                    {project.status === "ongoing" && (
                      <Image
                        src={OngoingIcon}
                        alt="status_image"
                        height={10}
                        width={20}
                      />
                    )}
                    {project.status === "complete" && (
                      <Image
                        src={CompletedIcon}
                        alt="status_image"
                        height={10}
                        width={25}
                      />
                    )}
                    {project.status === "on hold" && (
                      <Image
                        src={OnHoldIcon}
                        alt="status_image"
                        height={10}
                        width={25}
                      />
                    )}
                    &nbsp; {project.projectName.toUpperCase()}
                  </td>
                  <td
                    className={`border p-2 ${
                      index % 2 === 0 ? "bg-white" : "bg-emerald-100"
                    } text-center`}
                    style={{ minWidth: "150px", width: "150px" }}
                  >
                    {project.receiveDate}
                  </td>
                  <td
                    className={`border p-2 ${
                      index % 2 === 0 ? "bg-white" : "bg-emerald-100"
                    } text-center`}
                    style={{ minWidth: "200px", width: "200px" }}
                  >
                    {project.jobName}
                  </td>
                  <td
                    className={`border p-2 ${
                      index % 2 === 0 ? "bg-white" : "bg-emerald-100"
                    } text-center`}
                    style={{ minWidth: "200px", width: "200px" }}
                  >
                    {project.projectId}
                  </td>
                  <td
                    className={`border p-2 ${
                      index % 2 === 0 ? "bg-white" : "bg-emerald-100"
                    } text-center`}
                    style={{ minWidth: "200px", width: "200px" }}
                  >
                    {project.receiveByName}
                  </td>
                  <td
                    className={`border p-2 ${
                      index % 2 === 0 ? "bg-white" : "bg-emerald-100"
                    } text-center`}
                    style={{ minWidth: "200px", width: "200px" }}
                  >
                    {project.receiveDate}
                  </td>
                  <td
                    className={`border p-2 ${
                      index % 2 === 0 ? "bg-white" : "bg-amber-100"
                    } text-center`}
                    style={{ minWidth: "200px", width: "200px" }}
                  >
                    {project.receiveTime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
        <CreateProjectModal isOpen={isModalOpen} onRequestClose={closeModal} />
      </div>
    </>
  );
};

export default Projects;
