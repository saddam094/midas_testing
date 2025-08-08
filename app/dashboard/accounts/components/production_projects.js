"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import CreateProjectModal from "./CreateProjectModal";
import { FaEdit, FaTruck, FaEye, FaUpload } from "react-icons/fa";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const ProductionProjects = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dcNumber, setDcNumber] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState(false);
  const [isSendingToInstallPopupOpen, setIsSendingToInstallPopupOpen] =
    useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [currentData, setCurrentData] = useState([]);
  const [lastKey, setLastKey] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [isFileUploaded, setIsFileUploaded] = useState(false);

  const handleViewClick = (url) => {
    console.log("This is image ", url);
    if (url) {
      setMediaUrl(url);
      setShowModal(true);
    }
  };

  const closeModal1 = () => {
    setShowModal(false);
    setMediaUrl("");
  };

  const fetchData = async (lastKey = "", append = false) => {
    try {
      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_account_all_job_from_production",
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
        setCurrentData(data.detailedJobs);
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
            value: 0,
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

  const handleAddDc = async (dcNumber) => {
    if (selectedJob) {
      try {
        const response = await axios.post(
          "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_job_send_for_installation",
          {
            jobId: selectedJob.jobId,
            sentBy: employeeId,
            dc_number: dcNumber, //"DC21643133"
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
          setIsSendingToInstallPopupOpen(false);
          setDcNumber("");
        } else {
          alert(
            "Job status updated successfully!",
            response.data["body-json"]["body"]
          );
          setIsSendingToInstallPopupOpen(false);
          setDcNumber("");
        }
      } catch (error) {
        console.error(
          "Error updating job status:",
          error.response ? error.response.data : error.message
        );
        alert("Failed to update job status.");
      }
    }
  };

  useEffect(() => {
    if (!modalKey && !isUpdatePopupOpen && !isSendingToInstallPopupOpen) {
      fetchData("", false);
    }
  }, [
    modalKey,
    isUpdatePopupOpen,
    isSendingToInstallPopupOpen,
    isFileUploaded,
  ]);

  useEffect(() => {
    handleNext();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setModalKey((prevKey) => prevKey + 1);
  };

  const handleSendToInstallation = async (job) => {
    setSelectedJob(job);
    setIsSendingToInstallPopupOpen(true);
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
        return "bg-green-200 text-green-800";
      case "in_production":
        return "bg-yellow-100 text-yellow-800";
      case "in_process":
        return "bg-yellow-100 text-yellow-800";
      case "on_hold":
        return "bg-blue-100 text-blue-800";
      case "not_started":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "complete":
        return "Completed";
      case "in_production":
        return "In Production";
      case "in_process":
        return "In Process";
      case "on_hold":
        return "On Hold";
      case "not_started":
        return "Not Started";
      default:
        return "N/A";
    }
  };

  const uploadFile = async (file) => {
    setIsFileUploading(true);
    try {
      const fileType = file.type.includes("pdf")
        ? "pdf"
        : file.type.includes("image")
        ? "image"
        : null;

      if (!fileType) {
        alert("Invalid file type. Please upload a PDF or an image.");
        return;
      }

      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_account_dc_upload_presigned",
        {
          fileName: [file.name],
          type: fileType,
        }
      );

      const presignedUrl = response.data["body-json"]["body"][0];
      console.log("This is the presign url ", presignedUrl);

      await axios.put(presignedUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      const fileUrl = presignedUrl.split("?")[0];
      setIsFileUploaded(true);

      return fileUrl;
    } catch (error) {
      console.error("Error uploading the file:", error);
      alert("Failed to upload the file.");
      return null;
    } finally {
      setIsFileUploading(false);
    }
  };

  const handleUpdateDc = async (jobId, fileUrl) => {
    try {
      const response = await axios.put(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_account_dc_upload",
        {
          jobId: jobId,
          imageUrl: fileUrl,
        }
      );
      if (response.status === 200) {
        alert("Delivery Challan updated successfully!");
      } else {
        alert("Failed to update Delivery Challan.");
      }
    } catch (error) {
      console.error("Error updating DC:", error);
      alert("Failed to update Delivery Challan.");
    }
  };

  const handleUploadChallan = (jobId) => {
    const inputFile = document.createElement("input");
    inputFile.type = "file";
    inputFile.accept = ".pdf, image/*";
    inputFile.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const fileUrl = await uploadFile(file);
        console.log(" file url is ", fileUrl);
        if (fileUrl) {
          await handleUpdateDc(jobId, fileUrl);
        } else {
          alert("File upload failed.");
        }
      }
    };
    inputFile.click();
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
                  className="border p-1 text-sm bg-gray-700 text-white sticky left-0 block"
                  style={{ minWidth: "200px", width: "200px" }}
                >
                  Project Name
                </th>
                <th
                  className="border p-1  text-sm bg-gray-700 text-white"
                  style={{ minWidth: "130px", width: "130px" }}
                >
                  PO No.
                </th>
                <th
                  className="border p-1 text-sm bg-gray-700 text-white"
                  style={{ minWidth: "200px", width: "200px" }}
                >
                  Job Name
                </th>
                <th
                  className="border p-1 text-sm bg-gray-700 text-white"
                  style={{ minWidth: "200px", width: "200px" }}
                >
                  Contact No.
                </th>
                <th
                  className="border p-1 text-sm bg-gray-700 text-white"
                  style={{ minWidth: "200px", width: "200px" }}
                >
                  Contact Person Name
                </th>
                <th
                  className="border p-1 text-sm bg-gray-700 text-white"
                  style={{ minWidth: "200px", width: "200px" }}
                >
                  Sales Person Name
                </th>
                <th
                  className="border p-1 text-sm bg-gray-700 text-white"
                  style={{ minWidth: "150px", width: "150px" }}
                >
                  Received Date
                </th>

                <th
                  className="border p-1 text-sm bg-gray-700 text-white"
                  style={{ minWidth: "150px", width: "150px" }}
                >
                  Current Status
                </th>
                <th
                  className="border p-1 text-sm bg-gray-700 text-white"
                  style={{ minWidth: "150px", width: "150px" }}
                >
                  Delivery Challan
                </th>

                <th
                  className="border p-1 text-sm bg-gray-600 text-white"
                  style={{ minWidth: "100px", width: "100px" }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((project, index) => {
                const isFileAvailable = project.dcImage !== "";
                return (
                  <tr key={index}>
                    <td
                      className={`border p-2 text-sm  sticky left-0  ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-200"
                      } text-center`}
                      style={{ minWidth: "150px", width: "150px" }}
                    >
                      {project.projectName.toUpperCase()}
                    </td>
                    <td
                      className={`border p-2 text-sm ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-200"
                      } text-center`}
                      style={{ minWidth: "150px", width: "150px" }}
                    >
                      {project.poNumber}
                    </td>
                    <td
                      className={`border p-2 text-sm ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-200"
                      } text-center`}
                      style={{ minWidth: "200px", width: "200px" }}
                    >
                      {project.jobName.toUpperCase()}
                    </td>
                    <td
                      className={`border p-2 text-sm ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-200"
                      } text-center`}
                      style={{ minWidth: "200px", width: "200px" }}
                    >
                      {project.contactPersonPhone}
                    </td>
                    <td
                      className={`border p-2 text-sm ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-200"
                      } text-center`}
                      style={{ minWidth: "200px", width: "200px" }}
                    >
                      {project.contactPerson}
                    </td>
                    <td
                      className={`border p-2 text-sm ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-200"
                      } text-center`}
                      style={{ minWidth: "200px", width: "200px" }}
                    >
                      {project.receiveByName.toUpperCase()}
                    </td>
                    <td
                      className={`border p-2 text-sm ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-200"
                      } text-center`}
                      style={{ minWidth: "200px", width: "200px" }}
                    >
                      {project.receiveDate}
                    </td>
                    <td
                      className={`py-2 px-4 border-b text-sm ${getStatusColor(
                        project.status
                      )}`}
                      style={{ minWidth: "100px", width: "100px" }}
                    >
                      {getStatusText(project.status)}
                    </td>
                    <td style={{ minWidth: "100px", width: "100px" }}>
                      <div className="flex flex-row justify-around">
                        <button
                          onClick={() => handleUploadChallan(project.jobId)}
                          className="border hover:bg-gray-100 hover:border-black text-sm px-2 py-1 rounded"
                          disabled={isFileUploading}
                        >
                          {isFileUploading ? <FaUpload /> : `Upload DC`}
                        </button>
                        <button
                          className={`border hover:border-gray-700 px-2 py-1 rounded flex items-center ${
                            !isFileAvailable
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={() => handleViewClick(project.dcImage)}
                          disabled={!isFileAvailable}
                        >
                          <FaEye
                            className={` ${
                              !isFileAvailable ? "text-gray-400" : "text-black"
                            }`}
                          />
                        </button>
                      </div>
                    </td>

                    <td className="py-2 px-4 border-b">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdate(project)}
                          className="p-1  rounded border hover:border-black flex items-center justify-center"
                          title="Update Status"
                        >
                          <FaEdit />
                        </button>
                        {
                          <button
                            onClick={() => handleSendToInstallation(project)}
                            className={`ml-2 px-1 rounded flex items-center justify-center ${
                              project.flag == false
                                ? "bg-green-500 text-white hover:bg-green-600"
                                : "bg-gray-400 text-gray-800 cursor-not-allowed"
                            }`}
                            disabled={project.flag}
                            title={
                              project.flag == false
                                ? "Send to Installation"
                                : "already sent to installation"
                            }
                          >
                            Send
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-2 rounded-lg max-w-4xl w-full">
                <div className="flex flex-row justify-end">
                  <button
                    onClick={closeModal1}
                    className=" text-2xl rounded-md border  px-2 mb-1 hover:font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="overflow-auto max-h-[80vh]">
                  {mediaUrl.endsWith(".pdf") ? (
                    <iframe
                      src={mediaUrl}
                      width="100%"
                      height="600px"
                      title="PDF Viewer"
                    />
                  ) : (
                    <img
                      src={mediaUrl}
                      alt="Delivery Challan"
                      className="h-full"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {isUpdatePopupOpen && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Update Job Status</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Select Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="border rounded-md p-2 w-full"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="on_hold">On Hold</option>
                    <option value="in_process">In Progress</option>
                  </select>
                  <h6>
                    Note* After changing status to &apos;In Progress&apos;,
                    please send job to installation
                  </h6>
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

          {isSendingToInstallPopupOpen && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Add DC Number</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    DC Number
                  </label>

                  <input
                    type="text"
                    placeholder="Enter DC number"
                    value={dcNumber}
                    onChange={(e) => setDcNumber(e.target.value)}
                    className="w-full p-2 mb-4 mr-2 border rounded"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleAddDc(dcNumber)}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Add DC
                  </button>
                  <button
                    onClick={() => setIsSendingToInstallPopupOpen(false)}
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

export default ProductionProjects;
