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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInstDialogOpen, setIsInstDialogOpen] = useState(false);
  const [isInstBillDialogOpen, setIsInstBillDialogOpen] = useState(false);

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
      console.log("[Particular Project Data]: ", response.data.body);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 sm:px-0">
        <svg
          className="animate-spin h-8 w-8"
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
                    ID
                  </th>
                  <th className="p-2 border-b sticky left-0 bg-gray-200 text-center">
                    Job
                  </th>
                  <th className="p-2 border-b text-center">Deadline</th>
                  <th className="p-2 border-b text-center">Designer</th>
                  {/* <th className="p-2 border-b">Project Coordinator</th> */}
                  <th className="p-2 border-b text-center">Production</th>
                  <th className="p-2 border-b text-center">Installation</th>
                  <th className="p-2 border-b text-center">Accounts</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((job, index) => (
                    <tr key={index}>
                      <td className="p-2 border-b bg-white sticky left-0 bg-gray-100">
                        {job.jobId}
                      </td>
                      <td className="p-2 border-b bg-white sticky left-0 bg-gray-100">
                        {job.jobName.toUpperCase()}
                      </td>
                      <td className="p-2 border-b text-center">
                        {job.jobDeadline}
                      </td>
                      <td className="p-2 border-b">
                        {job.designerStatus === "complete" && (
                          <div className="flex justify-center">
                            <p className="text-green-500">●</p>
                          </div>
                        )}
                        {job.designerStatus === "not_started" && (
                          <div className="flex justify-center">
                            <p className="text-gray-500">●</p>
                          </div>
                        )}
                        {job.designerStatus === "on_hold" && (
                          <div className="flex justify-center">
                            <p className="text-red-500">●</p>
                          </div>
                        )}
                        {job.designerStatus === "in_process" && (
                          <div className="flex justify-center">
                            <p className="text-blue-500">●</p>
                          </div>
                        )}
                      </td>
                      {/* <td className="p-2 border-b">{job.projectCoordinator}</td> */}

                      <td className="p-2 border-b">
                        {job.production.status === "in_process" && (
                          <div className="flex justify-center">
                            <p className="text-blue-500">●</p>
                          </div>
                        )}
                        {job.production.status === "complete" && (
                          <div className="flex justify-center">
                            <p className="text-green-500 mr-2">●</p>

                            {job.accounts.dcImage && (
                              <>
                                <button
                                  onClick={() => setIsDialogOpen(true)}
                                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 px-1 rounded-md"
                                >
                                  🖺
                                </button>

                                {/* Dialog for displaying image/PDF */}
                                {isDialogOpen && (
                                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                                    <div className="w-full bg-white p-4 rounded-lg min-w-4xl h-[90vh] overflow-hidden relative">
                                      <button
                                        onClick={() => setIsDialogOpen(false)}
                                        className="absolute top-0 right-0 text-gray-600 hover:text-gray-800 text-2xl"
                                      >
                                        ✖
                                      </button>

                                      {job.accounts.dcImage
                                        ?.toLowerCase()
                                        .endsWith(".pdf") ? (
                                        <div className="w-full h-full">
                                          <iframe
                                            src={job.accounts.dcImage}
                                            className="w-full h-full"
                                            title="PDF"
                                          />
                                        </div>
                                      ) : (
                                        <div className="flex justify-center items-center w-full h-full">
                                          <Image
                                            src={job.accounts.dcImage}
                                            alt="Document"
                                            width={500}
                                            height={500}
                                            className="max-w-full max-h-full object-contain"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                        {job.production.status === "on_hold" && (
                          <div className="flex justify-center">
                            <p className="text-red-500">●</p>
                          </div>
                        )}
                        {job.production.status === "not_started" && (
                          <div className="flex justify-center">
                            <p className="text-gray-500">●</p>
                          </div>
                        )}
                        {job.production.status === "" && (
                          <div className="flex justify-center">N/A</div>
                        )}
                      </td>
                      <td className="p-2 border-b">
                        {job.installation.status === "not_started" && (
                          <div className="flex justify-center">
                            <p className="text-gray-500">●</p>
                          </div>
                        )}
                        {job.installation.status === "complete" && (
                          <div className="flex justify-center">
                            <p className="text-green-500 mr-2">●</p>
                            {job.accounts?.installationImage != null && (
                              <>
                                <button
                                  onClick={() => setIsInstDialogOpen(true)}
                                  className="text-blue-500 hover:text-blue-700 px-1 rounded-md hover:bg-blue-100"
                                >
                                  🖺
                                </button>

                                {isInstDialogOpen && (
                                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                                    <div className="w-full bg-white p-4 rounded-lg min-w-4xl h-[90vh] overflow-auto relative">
                                      <button
                                        onClick={() =>
                                          setIsInstDialogOpen(false)
                                        }
                                        className="absolute top-1 right-1 text-gray-600 hover:text-gray-800"
                                      >
                                        ✖
                                      </button>

                                      {job.accounts.installationImage !=
                                        null && (
                                        <div className="flex flex-wrap">
                                          {job.accounts.installationImage.map(
                                            (image, index) => (
                                              <Image
                                                key={index}
                                                src={image}
                                                height={200}
                                                width={200}
                                                alt="installation_images"
                                              />
                                            )
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                            {job.accounts?.installationBill != null && (
                              <>
                                <button
                                  onClick={() => setIsInstBillDialogOpen(true)}
                                  className="text-blue-500 hover:text-blue-700 px-1 rounded-md hover:bg-green-100"
                                >
                                  💸
                                </button>

                                {isInstBillDialogOpen && (
                                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                                    <div className="w-full bg-white p-4 rounded-lg min-w-4xl h-[90vh] overflow-auto relative">
                                      <button
                                        onClick={() =>
                                          setIsInstBillDialogOpen(false)
                                        }
                                        className="absolute top-1 right-1 text-gray-600 hover:text-gray-800"
                                      >
                                        ✖
                                      </button>

                                      {job.accounts.installationBill !=
                                        null && (
                                        <div className="flex flex-wrap gap-2">
                                          {/* Show Images First */}
                                          {job.accounts.installationBill
                                            .filter(
                                              (file) =>
                                                !file
                                                  .toLowerCase()
                                                  .endsWith(".pdf")
                                            )
                                            .map((image, index) => (
                                              <Image
                                                key={index}
                                                src={image}
                                                height={200}
                                                width={200}
                                                alt="installation_bill_image"
                                                className="rounded shadow"
                                              />
                                            ))}

                                          {/* Show PDFs as Viewable Links */}
                                          {job.accounts.installationBill
                                            .filter((file) =>
                                              file
                                                .toLowerCase()
                                                .endsWith(".pdf")
                                            )
                                            .map((pdf, index) => (
                                              <a
                                                key={index}
                                                href={pdf}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:text-blue-700 hover:underline"
                                              >
                                                View PDF {index + 1} 🔗
                                              </a>
                                            ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                        {job.installation.status === "on_hold" && (
                          <div className="flex justify-center">
                            <p className="text-red-500">●</p>
                          </div>
                        )}
                        {job.installation.status === "in_process" && (
                          <div className="flex justify-center">
                            <p className="text-blue-500">●</p>
                          </div>
                        )}
                        {job.installation.status === "" && (
                          <div className="flex justify-center">N/A</div>
                        )}
                      </td>
                      <td className="p-2 border-b">
                        {job.accounts.status === "in_process" && (
                          <div className="flex justify-center">
                            <p className="text-blue-500">●</p>
                          </div>
                        )}
                        {job.accounts.status === "complete" && (
                          <div className="flex justify-center">
                            <p className="text-green-500">●</p>
                          </div>
                        )}
                        {job.accounts.status === "on_hold" && (
                          <div className="flex justify-center">
                            <p className="text-red-500">●</p>
                          </div>
                        )}
                        {job.accounts.status === "not_started" && (
                          <div className="flex justify-center">
                            <p className="text-gray-500">●</p>
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
