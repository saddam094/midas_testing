import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaFilePdf, FaImage } from "react-icons/fa";

const CompletedJobs = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [jobsData, setJobsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [allJobsData, setAllJobsData] = useState([]);
  const [lastKey, setLastKey] = useState("");
  const [hasMoreData, setHasMoreData] = useState(true);
  const itemsPerPage = 200;

  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async (lastKey = "", append = false) => {
    try {
      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_production_job_filter",
        {
          status: "complete",
          limit: itemsPerPage,
          lastKey: lastKey,
        }
      );

      const { detailedJobs, lastKey: newLastKey } =
        response.data["body-json"].body;
      const data = response.data["body-json"]["body"];
      if (append) {
        setAllJobsData((prevJobs) => [...prevJobs, ...data.detailedJobs]);
        setJobsData((prevData) => [...prevData, ...data.detailedJobs]);
      } else {
        setJobsData(data.detailedJobs); //data reset on initial load
      }
      setLastKey(newLastKey);
      setIsLoading(false);
      setIsDataLoading(false);
    } catch (error) {
      setIsLoading(false);
      setIsDataLoading(false);
      console.error("Error fetching completed jobs:", error);
    }
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);

    if (searchValue.trim() === "") {
      // If search bar is cleared, show full data
      setJobsData(allJobsData);
    } else {
      const searchQuery = searchValue.toLowerCase();
      const filtered = allJobsData.filter(
        (item) =>
          item.jobName?.toLowerCase().includes(searchQuery) ||
          item.projectName?.toLowerCase().includes(searchQuery) ||
          item.receiveByName?.toLowerCase().includes(searchQuery)
      );
      setJobsData(filtered);
    }
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

      <div className="flex flex-row">
        <input
          type="text"
          placeholder="Search by job name, project name, or receiver"
          value={searchTerm}
          onChange={handleSearch}
          className="w-full p-2 mb-4 mr-2 border rounded"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full max-w-4xl mx-auto border-collapse">
          <thead>
            <tr>
              <th className="border p-1 bg-gray-800 text-white text-center sticky left-0 z-20 w-32">
                Job ID
              </th>
              <th className="border p-1 bg-gray-800 text-white text-center">
                Job Name
              </th>
              <th className="border p-1 bg-gray-800 text-white text-center">
                Project Name
              </th>
              <th className="border p-1 bg-gray-800 text-white text-center">
                Receiver Name
              </th>
              <th className={`border p-1 bg-gray-800 text-white`}>Status</th>
              <th className="border p-1 bg-gray-800 text-white text-center">
                Deadline Date
              </th>
              <th className="border p-1 bg-gray-800 text-white text-center">
                Received Date
              </th>
              <th className="border p-1 bg-gray-800 text-white text-center">
                Image
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
                <td className="border p-1 text-center sticky left-0 bg-white z-10 text-gray-500">
                  {item.jobId}
                </td>
                <td className="border p-1">{item.jobName?.toUpperCase()}</td>
                <td className="border p-1">
                  {item.projectName?.toUpperCase()}
                </td>
                <td className="border p-1 text-center">
                  {item.receiveByName?.toUpperCase()}
                </td>
                <td
                  className={`border p-1 text-center ${getStatusColor(
                    item.status
                  )} font-semibold`}
                >
                  {getStatusText(item.status)}
                </td>
                <td className="border p-1 text-center">
                  {item.dueDate || "N/A"}
                </td>
                <td className="border p-1 text-center">{item.receiveDate}</td>
                <td className="border p-1 text-center">
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
                        className="cursor-pointer text-blue-500 hover:text-blue-500"
                      />
                    )}
                  </a>
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
    </div>
  );
};

export default CompletedJobs;
