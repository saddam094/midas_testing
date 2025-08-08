"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";

import NotStartedIcon from "../../../assets/images/not_started.png";
import OngoingIcon from "../../../assets/images/in_progress.png";
import OnHoldIcon from "../../../assets/images/on_hold.png";
import CompletedIcon from "../../../assets/images/done.png";
import Image from "next/image";

const ProjectDetailModal = ({ projectId, projectName, onClose, children }) => {
  const [lastKey, setLastKey] = useState("");
  const [currentData, setCurrentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const fetchData = async (lastKey = "", append = false) => {
    try {
      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_particular_project_all_jobs",
        {
          projectId: projectId,
          limit: "200",
          lastKey: lastKey,
        }
      );
      console.log("Project Data: ", response.data.body);
      const data = response.data.body;
      console.log(data.projectName);

      // Update data depending on whether we append or reset
      if (append) {
        setCurrentData((prevData) => [...prevData, ...data.jobWIthDetails]);
      } else {
        setCurrentData(data.jobWIthDetails);
      }

      // Update the lastKey if it exists
      setLastKey(data.lastKey || "");
      setIsLoading(false); // Stop loading after data is fetched
      setIsDataLoading(false);
    } catch (error) {
      console.error("Error fetching particular project data: ", error);
    }
  };

  useEffect(() => {
    console.log("Project ID: ", projectId);
    fetchData("", false);
  }, [projectId]);

  const handleNext = () => {
    setIsDataLoading(true);
    if (lastKey) {
      fetchData(lastKey, true);
    }
  };

  const stages = ["Not Started", "In Progress", "On Hold", "Completed"];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg
          className="animate-spin h-10 w-10"
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
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 sm:px-0">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-7xl w-full relative overflow-y-auto max-h-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-12 h-12 flex items-center justify-center text-gray-800 hover:bg-gray-200 rounded-full"
          style={{ fontSize: "40px" }}
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4">{projectName}</h2>

        {/* table data */}
        <div className="mt-6">
          {/* <h3 className="text-lg font-semibold mb-2">Jobs</h3> */}
          <div className="overflow-x-auto">
            <table className="table-auto border-collapse w-full text-left">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border-b sticky left-0 bg-gray-200 text-center">
                    Job
                  </th>
                  <th className="p-2 border-b text-center">Job Deadline</th>
                  <th className="p-2 border-b text-center">Designer Stage</th>
                  {/* <th className="p-2 border-b">Project Coordinator</th> */}
                  <th className="p-2 border-b text-center">Production Stage</th>
                  <th className="p-2 border-b text-center">
                    Installation Stage
                  </th>
                  <th className="p-2 border-b text-center">Accounts Stage</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((job, index) => (
                    <tr key={index}>
                      <td className="p-2 border-b bg-white sticky left-0 bg-gray-100">
                        {job.jobName.toUpperCase()}
                      </td>
                      <td className="p-2 border-b text-center">
                        {job.jobDeadline}
                      </td>
                      <td className="p-2 border-b">
                        {job.designerStatus === "complete" && (
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
                        {job.designerStatus === "not_started" && (
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
                        {job.designerStatus === "on_hold" && (
                          <div className="flex justify-center">
                            <Image
                              src={OnHoldIcon}
                              alt="status_image"
                              height={25}
                              width={25}
                              style={{ height: "25px", width: "25px" }}
                            />
                          </div>
                        )}
                        {job.designerStatus === "in_process" && (
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
                      </td>
                      {/* <td className="p-2 border-b">{job.projectCoordinator}</td> */}

                      <td className="p-2 border-b">
                        {job.production.status === "in_process" && (
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
                        {job.production.status === "complete" && (
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
                        {job.production.status === "on_hold" && (
                          <div className="flex justify-center">
                            <Image
                              src={OnHoldIcon}
                              alt="status_image"
                              height={25}
                              width={25}
                              style={{ height: "25px", width: "25px" }}
                            />
                          </div>
                        )}
                        {job.production.status === "not_started" && (
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
                        {job.production.status === "" && (
                          <div className="flex justify-center">N/A</div>
                        )}
                      </td>
                      <td className="p-2 border-b">
                        {job.installation.status === "not_started" && (
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
                        {job.installation.status === "complete" && (
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
                        {job.installation.status === "on_hold" && (
                          <div className="flex justify-center">
                            <Image
                              src={OnHoldIcon}
                              alt="status_image"
                              height={25}
                              width={25}
                              style={{ height: "25px", width: "25px" }}
                            />
                          </div>
                        )}
                        {job.installation.status === "in_process" && (
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
                        {job.installation.status === "" && (
                          <div className="flex justify-center">N/A</div>
                        )}
                      </td>
                      <td className="p-2 border-b">
                        {job.accounts.status === "in_process" && (
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
                        {job.accounts.status === "complete" && (
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
                        {job.accounts.status === "on_hold" && (
                          <div className="flex justify-center">
                            <Image
                              src={OnHoldIcon}
                              alt="status_image"
                              height={25}
                              width={25}
                              style={{ height: "25px", width: "25px" }}
                            />
                          </div>
                        )}
                        {job.accounts.status === "not_started" && (
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
                        {job.accounts.status === "" && (
                          <div className="flex justify-center">N/A</div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-2 text-center">
                      No jobs available for this project.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="flex justify-center mt-6">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;
