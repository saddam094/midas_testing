"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import CreateProjectModal from "./CreateProjectModal";

import NotStartedIcon from "../../../assets/images/not_started.png";
import OngoingIcon from "../../../assets/images/in_progress.png";
import OnHoldIcon from "../../../assets/images/on_hold.png";
import CompletedIcon from "../../../assets/images/done.png";

const Jobs = () => {
  const [isLoading, setIsLoading] = useState(true);
  // const [projectData, setProjectData] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [lastKey, setLastKey] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(false);

  const fetchData = async (lastKey = "", append = false) => {
    try {
      console.log(lastKey);

      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_job_sheet",
        {
          limit: 200,
          lastKey: lastKey,
        }
      );
      console.log(response.data);

      const data = response.data["body-json"]["body"];

      console.log("data");
      console.log(data);

      if (append) {
        setCurrentData((prevData) => [...prevData, ...data.jobWIthDetails]);
      } else {
        setCurrentData(data.jobWIthDetails); // data reset on initial load
      }
      setLastKey(data.lastKey || "");
      setIsLoading(false);
      setIsDataLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData("", false);
  }, [modalKey]);

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
        <div className="flex flex-row">
          <input
            type="text"
            placeholder="Search by Job or Project Name"
            value={searchTerm}
            onChange={() => {}}
            // onChange={handleSearch}
            className="w-full p-2 mb-4 mr-2 border rounded"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th
                  rowSpan="2"
                  className="border bg-white text-white sticky left-0 block"
                  style={{ minWidth: "200px", width: "200px" }}
                >
                  &nbsp;
                </th>
                <th
                  colSpan="6"
                  className="border bg-yellow-600 text-white italic"
                >
                  Particulars
                </th>
                <th colSpan="4" className="border bg-sky-800 text-white italic">
                  Production
                </th>
                <th
                  colSpan="2"
                  className="border bg-gray-800 text-white italic"
                >
                  Accounts
                </th>
                <th
                  colSpan="3"
                  className="border bg-green-800 text-white italic"
                >
                  Installation
                </th>
                <th rowSpan="1" className="border px-2 bg-red-800 text-white">
                  Overdue
                </th>
              </tr>
              <tr>
                <th
                  className="border bg-gray-800 text-white sticky left-0 block"
                  style={{ minWidth: "200px", width: "200px" }}
                >
                  Job Sheet
                </th>
                <th
                  className="border bg-yellow-200"
                  style={{ minWidth: "120px", width: "120px" }}
                >
                  Date
                </th>
                <th
                  className="border bg-yellow-200"
                  style={{ minWidth: "200px", width: "200px" }}
                >
                  Project
                </th>
                <th
                  className="border bg-yellow-200"
                  style={{ minWidth: "150px", width: "150px" }}
                >
                  Type
                </th>

                <th
                  className="border bg-yellow-200"
                  style={{ minWidth: "250px", width: "250px" }}
                >
                  Designer
                </th>
                <th
                  className="border bg-yellow-200"
                  style={{ minWidth: "200px", width: "200px" }}
                >
                  Coordinator
                </th>
                <th
                  className="border bg-yellow-200"
                  style={{ minWidth: "120px", width: "120px" }}
                >
                  Deadline
                </th>
                <th
                  className="border bg-sky-200"
                  style={{ minWidth: "120px", width: "120px" }}
                >
                  Start Date
                </th>
                <th
                  className="border bg-sky-200"
                  style={{ minWidth: "55px", width: "55px" }}
                >
                  Status
                </th>
                <th
                  className="border bg-sky-200"
                  style={{ minWidth: "120px", width: "120px" }}
                >
                  Completed On
                </th>
                <th
                  className="border bg-sky-200"
                  style={{ minWidth: "200px", width: "200px" }}
                >
                  Remarks
                </th>
                <th
                  className="border bg-gray-400"
                  style={{ minWidth: "200px", width: "200px" }}
                >
                  DC No
                </th>
                <th
                  className="border  bg-gray-400"
                  style={{ minWidth: "120px", width: "120px" }}
                >
                  Date
                </th>
                <th
                  className="border bg-green-400"
                  style={{ minWidth: "120px", width: "120px" }}
                >
                  Start Date
                </th>
                <th
                  className="border bg-green-400"
                  style={{ minWidth: "55px", width: "55px" }}
                >
                  Status
                </th>
                <th
                  className="border bg-green-400"
                  style={{ minWidth: "200px", width: "200px" }}
                >
                  Remarks
                </th>
              </tr>
            </thead>

            <tbody>
              {currentData.map((project, index) => (
                <tr key={index} className="items-stretch">
                  <td
                    className={`border p-2 text-blue-700 flex flex-start sticky left-0 z-10 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-200"
                    }`}
                    style={{ minWidth: "200px", width: "200px" }}
                  >
                    {project.status === "not_started" && (
                      <Image src={NotStartedIcon} height={10} width={25} />
                    )}
                    {project.status === "in_process" && (
                      <Image src={OngoingIcon} height={10} width={20} />
                    )}
                    {project.status === "complete" && (
                      <Image src={CompletedIcon} height={10} width={25} />
                    )}
                    {project.status === "on hold" && (
                      <Image src={OnHoldIcon} height={10} width={25} />
                    )}
                    &nbsp; {project.jobName?.toUpperCase()}
                  </td>

                  <td
                    className={`border p-2 ${
                      index % 2 === 0 ? "bg-white" : "bg-yellow-100"
                    } text-center`}
                    style={{
                      minWidth: "120px",
                      width: "120px",
                    }}
                  >
                    {project.jobCreationDate}
                  </td>

                  <td
                    className={`border p-2 ${
                      index % 2 === 0 ? "bg-white" : "bg-yellow-100"
                    } text-center`}
                    style={{ minWidth: "150px", width: "150px" }}
                  >
                    {project.projectName?.toUpperCase()}
                  </td>

                  <td
                    className={`border p-2 ${
                      index % 2 === 0 ? "bg-white" : "bg-yellow-100"
                    } text-center`}
                    style={{ minWidth: "150px", width: "150px" }}
                  >
                    Type Here
                  </td>

                  <td
                    className={`border p-2 ${
                      index % 2 === 0 ? "bg-white" : "bg-yellow-100"
                    } text-center`}
                    style={{ minWidth: "200px", width: "200px" }}
                  >
                    {project.designerNames.join(", ").toUpperCase()}
                  </td>

                  <td
                    className={`border p-2 ${
                      index % 2 === 0 ? "bg-white" : "bg-yellow-100"
                    } text-center`}
                    style={{ minWidth: "200px", width: "200px" }}
                  >
                    {project.projectCoordinator.toUpperCase()}
                  </td>

                  <td
                    className={`border p-2 ${
                      index % 2 === 0 ? "bg-white" : "bg-yellow-100"
                    } text-center`}
                    style={{ minWidth: "120px", width: "120px" }}
                  >
                    {project.jobDeadline}
                  </td>

                  <td
                    className={`border p-2 ${
                      index % 2 === 0 ? "bg-white" : "bg-sky-100"
                    } text-center`}
                    style={{ minWidth: "120px", width: "120px" }}
                  >
                    {project.production.startDate || "-"}
                  </td>

                  <td
                    className={`border p-2 ${
                      index % 2 === 0 ? "bg-white" : "bg-sky-100"
                    } text-center`}
                    style={{ minWidth: "55px", width: "55px" }}
                  >
                    {project.production.status === "" && (
                      <div className="flex justify-center">
                        <Image
                          src={NotStartedIcon}
                          alt="status_image"
                          height={25}
                          width={25}
                          style={{ height: "25px", width: "25px" }}
                        />
                      </div>
                    )}
                    {project.production.status === "complete" && (
                      <div className="flex justify-center">
                        <Image
                          src={CompletedIcon}
                          alt="status_image"
                          height={25}
                          width={25}
                          style={{ height: "25px", width: "25px" }}
                        />
                      </div>
                    )}
                    {project.production.status === "in_production" && (
                      <div className="flex justify-center">
                        <Image
                          src={OngoingIcon}
                          alt="status_image"
                          height={25}
                          width={25}
                          style={{ height: "25px", width: "25px" }}
                        />
                      </div>
                    )}
                    {project.production.status === "not_started" && (
                      <div className="flex justify-center">
                        <Image
                          src={NotStartedIcon}
                          alt="status_image"
                          height={25}
                          width={25}
                          style={{ height: "25px", width: "25px" }}
                        />
                      </div>
                    )}
                  </td>

                  <td
                    className={`border p-2 ${
                      index % 2 === 0 ? "bg-white" : "bg-sky-100"
                    } text-center`}
                    style={{ minWidth: "120px", width: "120px" }}
                  >
                    {project.production.completeDate || "-"}
                  </td>

                  <td
                    className={`border p-2 ${
                      index % 2 === 0 ? "bg-white" : "bg-sky-100"
                    } text-center`}
                    style={{ minWidth: "200px", width: "200px" }}
                  >
                    {project.production.remark.toUpperCase() || "-"}
                  </td>

                  <td
                    className={`border p-2 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-100"
                    } text-center`}
                    style={{ minWidth: "200px", width: "200px" }}
                  >
                    {project.accounts.dc_number || "-"}
                  </td>

                  <td
                    className={`border p-2 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-100"
                    } text-center`}
                    style={{ minWidth: "120px", width: "120px" }}
                  >
                    {project.accounts.completeDate || "-"}
                  </td>

                  <td
                    className={`border p-2 ${
                      index % 2 === 0 ? "bg-white" : "bg-green-100"
                    } text-center`}
                    style={{ minWidth: "120px", width: "120px" }}
                  >
                    {project.installation.startDate || "-"}
                  </td>

                  <td
                    className={`border p-2 ${
                      index % 2 === 0 ? "bg-white" : "bg-green-100"
                    } text-center`}
                    style={{ minWidth: "55px", width: "55px" }}
                  >
                    {project.installation.status === "not_started" && (
                      <div className="flex justify-center">
                        <Image
                          src={NotStartedIcon}
                          alt="status_image"
                          height={25}
                          width={25}
                          style={{ height: "25px", width: "25px" }}
                        />
                      </div>
                    )}
                    {project.installation.status === "" && (
                      <div className="flex justify-center">
                        <Image
                          src={NotStartedIcon}
                          alt="status_image"
                          height={25}
                          width={25}
                          style={{ height: "25px", width: "25px" }}
                        />
                      </div>
                    )}
                    {project.installation.status === "in_installation" && (
                      <div className="flex justify-center">
                        <Image
                          src={OngoingIcon}
                          alt="status_image"
                          height={25}
                          width={25}
                          style={{ height: "25px", width: "25px" }}
                        />
                      </div>
                    )}
                    {project.installation.status === "complete" && (
                      <div className="flex justify-center">
                        <Image
                          src={CompletedIcon}
                          alt="status_image"
                          height={25}
                          width={25}
                          style={{ height: "25px", width: "25px" }}
                        />
                      </div>
                    )}
                  </td>

                  <td
                    className={`border p-2 ${
                      index % 2 === 0 ? "bg-white" : "bg-green-100"
                    } text-center`}
                    style={{ minWidth: "200px", width: "200px" }}
                  >
                    {project.installation.reamrk || "-"}
                  </td>

                  <td
                    className={`border p-2 text-center ${
                      index % 2 === 0 ? "bg-white" : "bg-red-100"
                    }`}
                    style={{ minWidth: "120px", width: "120px" }}
                  >
                    Overdue
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

      {isModalOpen && (
        <CreateProjectModal
          onClose={closeModal}
          isOpen={isModalOpen}
          key={modalKey}
        />
      )}
    </>
  );
};

export default Jobs;
