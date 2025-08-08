"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import CreateProjectModal from "./CreateProjectModal";
import { FaEdit, FaImage } from "react-icons/fa";
import NotStartedIcon from "../../../assets/images/notstarted.png";
import OngoingIcon from "../../../assets/images/ongoing.png";
import OnHoldIcon from "../../../assets/images/onhold.png";
import CompletedIcon from "../../../assets/images/completed.png";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const InstallationProjects = () => {
  const [isLoading, setIsLoading] = useState(true);
  // const [searchTerm, setSearchTerm] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [exactNumber, setExactNumber] = useState("");
  // const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  // const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState(false);
  // const [isSendingToInstallPopupOpen, setIsSendingToInstallPopupOpen] =
  // useState(false);
  // const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [lastKey, setLastKey] = useState("");
  const [currentData, setCurrentData] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  // const [flag, setFlag] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [mediaUrl, setMediaUrl] = useState([]);

  const handleViewClick = (imgUrls) => {
    console.log("thisi sthe installation images", imgUrls);
    if (typeof imgUrls === "string" && imgUrls.trim() !== "" > 0) {
      setMediaUrl([imgUrls]);
      setShowModal(true);
    } else if (Array.isArray(imgUrls) && imgUrls.length > 0) {
      setMediaUrl(imgUrls);
      setShowModal(true);
    }
  };

  const fetchData = async (lastKey = "", append = false) => {
    try {
      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_account_all_job_from_installation",
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

  useEffect(() => {
    const id = localStorage.getItem("employeeId");
    if (id) {
      setEmployeeId(id);
    } else {
      console.error("Employee ID not found. Please log in.");
    }
  }, []);

  const handleStatusUpdate = async () => {
    if (selectedJob) {
      try {
        const response = await axios.put(
          "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_accounts_status_update",
          {
            jobId: selectedJob.jobId,
            staffId: employeeId,
            status: newStatus,
            invoiceNumber: invoiceNumber,
            value: parseInt(exactNumber) || "",
          }
        );
        if (response.data["body-json"]["statusCode"] == 200) {
          console.log(
            "Status update response:",
            response.data["body-json"]["body"]
          );
          alert(
            "Job status updated successfully!",
            response.data["body-json"]["body"]
          );
          setIsUpdatePopupOpen(false);
        }
      } catch (error) {
        console.error(
          "Error updating job status:",
          error.response ? error.response.data : error.message
        );
        setIsUpdatePopupOpen(false);
        alert("Failed to update job status.");
      }
    }
  };

  useEffect(() => {
    if (!modalKey && !isUpdatePopupOpen) {
      fetchData("", false);
    }
  }, [modalKey, isUpdatePopupOpen]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setModalKey((prevKey) => prevKey + 1);
  };

  const handleUpdate = (job) => {
    setSelectedJob(job);
    setNewStatus(job.status);
    setIsUpdatePopupOpen(true);
  };

  const handleNext = () => {
    setIsDataLoading(true);
    if (lastKey) {
      fetchData(lastKey, true);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "complete":
        return "text-green-800";
      case "in_process":
        return "text-yellow-800";
      case "on_hold":
        return "text-blue-800";
      case "not_started":
        return " text-red-800";
      default:
        return " text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "complete":
        return "Completed";
      case "in_process":
        return "In Progress";
      case "on_hold":
        return "On Hold";
      case "not_started":
        return "Not Started";
      default:
        return "N/A";
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
                  className="border p-1 text-sm bg-gray-600 text-white sticky left-0 block"
                  style={{ minWidth: "200px", width: "200px" }}
                >
                  Project
                </th>
                <th
                  className="border p-1 text-sm bg-gray-600 text-white"
                  style={{ minWidth: "150px", width: "150px" }}
                >
                  PO No.
                </th>
                <th
                  className="border p-1 text-sm bg-gray-600 text-white"
                  style={{ minWidth: "150px", width: "150px" }}
                >
                  Project Coord.
                </th>
                <th
                  className="border p-1 text-sm bg-gray-600 text-white"
                  style={{ minWidth: "200px", width: "200px" }}
                >
                  Job
                </th>

                <th
                  className="border p-1 text-sm bg-gray-600 text-white"
                  style={{ minWidth: "200px", width: "200px" }}
                >
                  Contact Person
                </th>

                <th
                  className="border p-1 text-sm bg-gray-600 text-white"
                  style={{ minWidth: "200px", width: "200px" }}
                >
                  Contact No.
                </th>

                <th
                  className="border p-1 text-sm bg-gray-600 text-white"
                  style={{ minWidth: "150px", width: "150px" }}
                >
                  Received On
                </th>

                <th
                  className="border p-1 text-sm bg-gray-700 text-white"
                  style={{ minWidth: "150px", width: "150px" }}
                >
                  Status
                </th>
                <th
                  className="border p-1 text-sm bg-gray-700 text-white"
                  style={{ minWidth: "150px", width: "150px" }}
                >
                  DC
                </th>
                <th
                  className="border p-1 text-sm bg-gray-600 text-white"
                  style={{ minWidth: "80px", width: "80px" }}
                >
                  Inst.
                </th>
                <th
                  className="border p-1 text-sm bg-gray-600 text-white"
                  style={{ minWidth: "80px", width: "80px" }}
                >
                  Bill
                </th>
                <th
                  className="border p-1 text-sm bg-gray-500 text-white"
                  style={{ minWidth: "80px", width: "80px" }}
                >
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((project, index) => {
                const isFileAvailable = project.dcImage !== "";
                return (
                  <tr key={index}>
                    <td
                      className={`border p-1 text-sm text-gray-700 flex flex-start sticky left-0  ${
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
                      className={`border p-1 text-sm ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-100"
                      } text-left`}
                      style={{ minWidth: "150px", width: "150px" }}
                    >
                      {project.poNumber}
                    </td>
                    <td
                      className={`border p-1 text-sm ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-100"
                      } text-center`}
                      style={{ minWidth: "150px", width: "150px" }}
                    >
                      {project?.projectCoordinator.toUpperCase()}
                    </td>
                    <td
                      className={`border p-1 text-sm ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-100"
                      } text-left`}
                      style={{ minWidth: "200px", width: "200px" }}
                    >
                      {project.jobName.toUpperCase()}
                    </td>

                    <td
                      className={`border p-1 text-sm ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-100"
                      } text-center`}
                      style={{ minWidth: "200px", width: "200px" }}
                    >
                      {project.contactPerson}
                    </td>
                    <td
                      className={`border p-1 text-sm ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-100"
                      } text-center`}
                      style={{ minWidth: "200px", width: "200px" }}
                    >
                      {project.contactPersonPhone}
                    </td>

                    <td
                      className={`border p-1 text-sm ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-100"
                      } text-center`}
                      style={{ minWidth: "200px", width: "200px" }}
                    >
                      {project.receiveDate}
                    </td>
                    <td
                      className={`py-2 px-4 border-b text-sm  text-center ${getStatusColor(
                        project.status
                      )}`}
                      style={{ minWidth: "100px", width: "100px" }}
                    >
                      {getStatusText(project.status)}
                    </td>
                    <td
                      className={`border p-1 text-sm text-center ${
                        project.dcReceived
                          ? "bg-gray-100"
                          : "bg-red-500 text-white"
                      }`}
                      style={{ minWidth: "200px", width: "200px" }}
                    >
                      {project.dcReceived ? project.dc_number : "Not received"}
                    </td>
                    <td
                      className={`border p-1 text-sm ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-100"
                      } text-center`}
                      style={{ minWidth: "200px", width: "200px" }}
                    >
                      <div className="flex items-center justify-center">
                        <button
                          disabled={!isFileAvailable}
                          className="cursor-pointer"
                          onClick={() =>
                            handleViewClick(project.installationImage)
                          }
                        >
                          <FaImage />
                        </button>
                      </div>
                    </td>
                    <td
                      className={`border p-1 text-sm ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-100"
                      } text-center`}
                      style={{ minWidth: "200px", width: "200px" }}
                    >
                      <div className="flex items-center justify-center">
                        <button
                          disabled={!isFileAvailable}
                          className="cursor-pointer"
                          onClick={() =>
                            handleViewClick(project.installationBillImage)
                          }
                        >
                          <FaImage />
                        </button>
                      </div>
                    </td>

                    <td className="py-2 px-4 border-b">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdate(project)}
                          className="p-1 text-sm rounded border hover:border-black flex items-center justify-center"
                          title="Update Status"
                        >
                          <FaEdit />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="relative bg-white p-6 rounded-lg w-full max-w-4xl h-4/5 overflow-auto">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-1"
                >
                  Close
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                  {mediaUrl.map((url, idx) => {
                    const fileType = url.toLowerCase().endsWith(".pdf")
                      ? "pdf"
                      : "image";

                    return (
                      <div
                        className="border border-gray-300 rounded-md"
                        key={idx}
                      >
                        {/* Debugging log */}
                        {console.log(
                          "This is image/pdf section:",
                          url,
                          fileType
                        )}

                        {/* Conditional rendering */}
                        {fileType === "image" ? (
                          <img
                            src={url}
                            alt={`Production Image ${idx + 1}`}
                            className="rounded-md w-full"
                            height={200}
                            width={200}
                          />
                        ) : fileType === "pdf" ? (
                          <a
                            href={url}
                            download
                            className="text-blue-600 hover:underline"
                          >
                            Download PDF {idx + 1}
                          </a>
                        ) : (
                          <div>Invalid item type</div> // Optional fallback for invalid type
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Popup for updating job status */}
          {isUpdatePopupOpen && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Update Job Status</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Mark as Completed
                  </label>
                  <input
                    type="checkbox"
                    checked={newStatus === "complete"}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewStatus("complete");
                      } else {
                        setNewStatus("change_status");
                      }
                    }}
                    className="mr-2"
                  />
                  Completed
                  {newStatus === "complete" && (
                    <div>
                      <input
                        type="text"
                        placeholder="Enter invoice number"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        className="w-full p-2 mb-4 mr-2 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="Enter Exact used amount"
                        value={exactNumber}
                        onChange={(e) => setExactNumber(e.target.value)}
                        className="w-full p-2 mb-4 mr-2 border rounded"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleStatusUpdate}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Update Status
                  </button>
                  <button
                    onClick={() => setIsUpdatePopupOpen(false)}
                    className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
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

export default InstallationProjects;
