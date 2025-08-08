"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaEdit,
  FaForward,
  FaImage,
  FaFilePdf,
  FaRegCommentDots,
} from "react-icons/fa";
import { MdOutlineDone } from "react-icons/md";
import JobDataCards from "./JobDataCards";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Staff = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [jobsData, setJobsData] = useState([]);
  const [allJobsData, setAllJobsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState(false);
  const [notification, setNotification] = useState("");
  const [lastKey, setLastKey] = useState("");
  const [employeeId, setEmployeeId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [projectRemarks, setProjectRemarks] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!isUpdatePopupOpen) {
      fetchData();
    }
  }, [isUpdatePopupOpen]);

  const fetchData = async (lastKey = "", append = false) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_production_all_jobs",
        {
          limit: 200,
          lastKey: lastKey,
        }
      );

      const { detailedJobs, lastKey: newLastKey } =
        response.data["body-json"].body;
      console.log("Response:", response.data["body-json"]);
      const data = response.data["body-json"]["body"];
      if (append) {
        setAllJobsData((prevJobs) => [...prevJobs, ...data.detailedJobs]);
        setJobsData((prevData) => [...prevData, ...data.detailedJobs]);
      } else {
        setJobsData(data.detailedJobs);
      }
      setLastKey(newLastKey);
      setIsLoading(false);
      setIsDataLoading(false);
    } catch (error) {
      setIsLoading(false);
      setIsDataLoading(false);
      console.error("Error fetching data:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const searchQuery = e.target.value.toLowerCase();
    const filtered = jobsData.filter(
      (item) =>
        item.jobName.toLowerCase().includes(searchQuery) ||
        item.projectName.toLowerCase().includes(searchQuery) ||
        item.receiveByName.toLowerCase().includes(searchQuery)
    );
    if (searchQuery === "") {
      setJobsData(jobsData);
    } else {
      setJobsData(filtered);
    }
  };

  const handleNext = () => {
    setIsDataLoading(true);
    if (lastKey) {
      fetchData(lastKey, true);
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

  const handleJobUpdateSubmit = async () => {
    if (!projectRemarks || !newStatus) {
      alert("Please select a status and enter a remark.");
      return;
    }
    if (selectedJob) {
      try {
        const response = await axios.put(
          "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_production_jobs_status_update",
          {
            jobId: selectedJob.jobId,
            staffId: employeeId,
            status: newStatus,
            remark: projectRemarks,
          }
        );
        if (response.data["body-json"]?.statusCode === 200) {
          setNotification(response.data["body-json"].body);
          setIsUpdatePopupOpen(false);
        }
      } catch (error) {
        console.error("Error updating job status:", error);
        setNotification(
          `Failed to update job status. ${
            response.data["body-json"].body || ""
          }`
        );
        setIsUpdatePopupOpen(false);
      }
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleUpdate = (job) => {
    setSelectedJob(job);
    setNewStatus(job.status);
    setIsUpdatePopupOpen(true);
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "complete":
        return "Completed";
      case "in_production":
        return "In Production";

      case "on_hold":
        return "On Hold";
      case "not_started":
        return "Not Started";
      default:
        return "N/A";
    }
  };

  const sendToAccount = async (jobId, sentBy) => {
    try {
      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_job_send_to_accounts",
        {
          jobId,
          sentBy,
        }
      );

      setNotification(response.data["body-json"].body);
    } catch (error) {
      console.error("Error sending to account:", error);
      setNotification("Failed to send to account.");
    }
  };

  const generatePDF = () => {
    const input = document.getElementById("table-to-print"); // Get the table element
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgWidth = 190;
      const pageHeight = pdf.internal.pageSize.height;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      position += heightLeft;

      pdf.save("table-data.pdf");
    });
  };

  return isLoading ? (
    <div className="flex justify-center items-center h-screen">
      <svg
        className="animate-spin  h-10 w-10 text-blue-500"
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
    <div className="py-2">
      {notification && (
        <div className="fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-lg flex items-center space-x-2">
          <span>{notification}</span>
          <button
            className="text-blue-700 hover:text-blue-900"
            onClick={() => setNotification("")}
          >
            ✖
          </button>
        </div>
      )}

      <JobDataCards />

      <div className="flex flex-col md:flex-row justify-between">
        <div className="mb-4">
          <label className="mr-2">Filter by Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2 border rounded mr-2"
          >
            <option value="">All</option>
            <option value="not_started">Not Started</option>
            <option value="in_production">In Production</option>
            <option value="complete">Complete</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
        <div className="flex flex-row  mb-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border rounded mr-2"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 border rounded mr-2"
          />

          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setSelectedStatus("");
              fetchData();
            }}
            className="ml-2 p-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex flex-row justify-between">
        <input
          type="text"
          placeholder="Search by job name, project name, or receiver"
          value={searchTerm}
          onChange={handleSearch}
          className="w-2/3 p-2 mb-4 mr-2 border rounded"
        />
        <button
          onClick={generatePDF}
          className="mb-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Print
        </button>
      </div>

      <div className="overflow-x-auto " id="table-to-print">
        <table className="min-w-full max-w-4xl mx-auto border-collapse">
          <thead className="sticky top-0">
            <tr>
              <th className="border  bg-gray-800 px-1 py-3 text-white text-xs text-center sticky left-0 z-20 w-32">
                Job ID
              </th>
              <th className="border bg-gray-800 px-1 py-3 text-white text-xs text-center">
                Description
              </th>

              <th className="border bg-gray-800 px-1 py-3 text-white text-xs text-center">
                Project
              </th>

              <th className="border bg-gray-800 px-1 py-3 text-white text-xs text-center">
                Received By
              </th>

              <th className="border bg-gray-800 px-1 py-3 text-white text-xs text-center">
                Deadline
              </th>
              <th className="border bg-gray-800 px-1 py-3 text-white text-xs text-center">
                Received
              </th>
              <th className="border bg-gray-800 px-1 py-3 text-white text-xs text-center">
                File
              </th>
              <th className="border bg-gray-800 px-1 py-3 text-white text-xs text-center">
                Send to A/c
              </th>
              <th className="border bg-gray-800 px-1 py-3 text-white text-xs text-center">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {jobsData?.map((item, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-gray-100"
                } hover:bg-gray-200`}
              >
                <td className="border bg-white p-1 text-md text-gray-600 text-center sticky left-0 z-10">
                  {item.jobId}
                </td>
                <td className="border p-1 text-md text-left">
                  {item.jobName.length > 20
                    ? item.jobName.toUpperCase().slice(0, 20) + "..."
                    : item.jobName.toUpperCase()}
                </td>
                <td className="border p-1 text-md text-left">
                  {item.projectName.charAt(0).toUpperCase() +
                    item.projectName.slice(1)}
                </td>
                <td className="border p-1 text-md text-center">
                  {item.receiveByName.charAt(0).toUpperCase() +
                    item.receiveByName.slice(1)}
                </td>

                <td className="border p-1 text-md text-center">
                  {item.dueDate || "N/A"}
                </td>
                <td className="border p-1 text-md text-center">
                  {item.receiveDate}
                </td>
                <td className="border p-1 text-md text-center">
                  <a
                    href={item.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-center"
                  >
                    {item.imageUrl.endsWith(".pdf") ? (
                      <FaFilePdf
                        size={20}
                        className="cursor-pointer text-red-500 hover:text-red-700"
                      />
                    ) : (
                      <FaImage
                        size={20}
                        className="cursor-pointer text-blue-500 hover:text-blue-700"
                      />
                    )}
                  </a>
                </td>

                <td className="border p-1 text-md  flex justify-center items-center">
                  {item.flag ? (
                    <button className=" py-1 px-1 rounded" onClick={() => {}}>
                      <MdOutlineDone />
                    </button>
                  ) : (
                    <button
                      className=" py-1 px-1 rounded hover:border hover:border-black"
                      onClick={() => sendToAccount(item.jobId, employeeId)}
                    >
                      <FaForward />
                    </button>
                  )}
                </td>
                <td className="py-1 px-4 border-b">
                  {item?.isProjectCoordinator ? (
                    <div className="relative group flex items-center h-[5vh] justify-center rounded px-1">
                      <p className="text-red-600 font-bold text-xs">ON HOLD</p>
                      <FaRegCommentDots className="ml-4 text-red-500" />

                      {/* Tooltip */}
                      <div className="absolute top-6 right-0 z-10 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 w-48">
                        By Project Coordinator: {item?.quotation}
                      </div>
                    </div>
                  ) : (
                    <div className="flex space-x-1 items-center justify-center">
                      <p
                        className={`text-xs px-1 py-1 rounded-md 
         ${
           getStatusText(item.status) === "Completed"
             ? "bg-green-300"
             : getStatusText(item.status) === "Not Started"
             ? "bg-gray-300"
             : getStatusText(item.status) === "On Hold"
             ? "bg-orange-300"
             : getStatusText(item.status) === "In Progress"
             ? "bg-blue-300"
             : "bg-red-300"
         }`}
                      >
                        {getStatusText(item.status)}
                      </p>
                      <button
                        onClick={() => handleUpdate(item)}
                        className="p-1 text-md  rounded hover:border hover:border-gray-400 flex items-center justify-center"
                        title="Update Status"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                  disabled={newStatus === "complete"}
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_production">In Production</option>
                  <option value="complete">Complete</option>
                </select>
                <h6 className="text-red-500">
                  *After changing status to &apos;Completed&apos;, please send
                  job to Accounts
                </h6>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Remarks
                </label>
                <input
                  type="text"
                  placeholder="Remarks"
                  className="w-full p-2 mb-4 mr-2 border rounded"
                  onChange={(e) => setProjectRemarks(e.target.value)}
                  value={projectRemarks}
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleJobUpdateSubmit}
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
          hidden={!lastKey}
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

const CreateProfileModal = ({ isOpen, onRequestClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded">
        <h2 className="text-xl mb-4">Create Profile</h2>

        <button
          onClick={onRequestClose}
          className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Staff;
