"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import CreateJobForm from "./CreateJobForm";
import CreateDirectJobForm from "./CreateDirectJobForm";
import Send from "../Images/send.png";
import Updaet from "../Images/updated.png";
import Image from "next/image";

const DirectProjectDetails = () => {
  const router = useRouter();
  const [material, setMaterial] = useState("");
  const [measurement, setMeasurement] = useState("");
  // const [sendPtoduction, setSendProduction] = useState("");
  const [jobDetails, setJobDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState(false);
  const [lastKey, setLastKey] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [employeeId, setEmployeeId] = useState(null);
  const [flag, setFlag] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDirectJobModalOpen, setIsDirectJobModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenDirectJobModal = () => setIsDirectJobModalOpen(true);
  const handleCloseDirectModal = () => setIsDirectJobModalOpen(false);

  const [designerOptions, setDesignerOptions] = useState([]);

  // State to manage the current page
  const [currentPage, setCurrentPage] = useState(1);

  // State for the number of items per page
  const [itemsPerPage] = useState(5); // Adjusted to 5 items per page

  // Calculate the index of the last item on the current page
  const indexOfLastItem = currentPage * itemsPerPage;

  // Calculate the index of the first item on the current page
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Slice the jobDetails array to get only the items to display on the current page
  const currentItems = jobDetails.slice(indexOfFirstItem, indexOfLastItem);

  // Calculate the total number of pages
  const totalPages = Math.ceil(jobDetails.length / itemsPerPage);

  // Function to handle page changes
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  useEffect(() => {
    // Retrieve employeeId from localStorage
    const id = localStorage.getItem("employeeId");
    if (id) {
      setEmployeeId(id);
    } else {
      console.error("Employee ID not found. Please log in.");
    }
  }, []);
  // const staffId = employeeId;
  // console.log("This is the staff id is ", staffId);

  useEffect(() => {
    if (
      !isModalOpen &&
      !isDirectJobModalOpen &&
      !isPopupOpen &&
      !isUpdatePopupOpen
    ) {
      // fetchJobDetails();
      fetchJobDetails("", false);
    }
  }, [
    employeeId,
    isModalOpen,
    isDirectJobModalOpen,
    isPopupOpen,
    isUpdatePopupOpen,
  ]);

  const fetchJobDetails = async (localLastKey = "", append = false) => {
    if (employeeId) {
      try {
        const response = await axios.post(
          "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_particular_designer_all_direct_jobs",
          { staffId: employeeId, limit: 200, lastKey: localLastKey }
        );
        if (response.data["body-json"]["statusCode"] == 200) {
          const data = response.data["body-json"]["body"];
          console.log("Body response", data);
          if (Array.isArray(data)) {
            if (append) {
              setJobDetails((prevData) => [...prevData, ...data]);
            } else {
              setJobDetails(data); // Reset data on initial load
            }
            setLastKey(data.lastKey || "");
            setIsLoading(false);
            setIsDataLoading(false);
            // setJobDetails(data);
            const flagFromJobDetails = data.some((job) => job.flag === false); // Adjust flag logic as needed
            setFlag(flagFromJobDetails);
          } else {
            console.error("Unexpected response data format:", data);
            setJobDetails([]);
            setIsLoading(false);
            setIsDataLoading(false);
          }
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
        setJobDetails([]);
        setIsLoading(false);
        setIsDataLoading(false);
      } finally {
        setIsLoading(false);
        setIsDataLoading(false);
      }
    }
  };

  const handleNext = () => {
    setIsDataLoading(true);
    if (lastKey) {
      fetchJobDetails(lastKey, true);
    }
  };

  // useEffect(() => {
  //   const fetchDesignerOptions = async () => {
  //     try {
  //       const response = await axios.get(
  //         "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_designer_name"
  //       );
  //       if(response.data["body-json"]['statusCode']==200){
  //       const data = response.data["body-json"]["body"];
  //       if (Array.isArray(data)) {
  //         setDesignerOptions(data);
  //       } else {
  //         console.error("Unexpected response data format:", data);
  //         setDesignerOptions([]);
  //       }
  //     }
  //     } catch (error) {
  //       console.error("Error fetching designer names:", error);
  //       setDesignerOptions([]);
  //     }
  //   };

  //   fetchDesignerOptions();
  // }, []);

  const handleUpdate = (job) => {
    setSelectedJob(job);
    setNewStatus(job.status);
    setIsUpdatePopupOpen(true);
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSendToProductionClick = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setImage(null);
  };
  // Modified handleSendToProduction function
  const handleSendToProduction = async (job) => {
    setSelectedJob(job);
    setIsPopupOpen(true);
  };

  const handleImageUpload = async () => {
    if (selectedJob && image) {
      try {
        // Request a presigned URL for the image upload
        const presignedResponse = await axios.post(
          "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_job_image_presigned",
          {
            fileName: [image.name], // Send the image name as an array
          }
        );

        const presignedUrl = presignedResponse.data["body-json"]["body"][0]; // Extract the presigned URL from the response
        console.log("This is presigne ", presignedResponse);

        // Now, upload the image using the presigned URL
        await axios.put(presignedUrl, image, {
          headers: {
            "Content-Type": image.type,
          },
        });

        // Prepare the payload for sending to production
        const payload = {
          designerId: employeeId, // Ensure this matches the format in Figma
          jobId: selectedJob.jobId, // Ensure this matches the format in Figma
          material: material,
          measurement: measurement,

          imageUrl: presignedUrl.split("?")[0], // Use the URL without query params
        };

        // Then, send the job to production with the image URL
        const response = await axios.post(
          "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_jobs_sent_to_accounts_from_designer",
          payload
        );
        if (response.data["body-json"]["statusCode"] == 200) {
          console.log("Send to accounts response:", response.data);

          alert("Sent to accounts successfully!");
          setIsPopupOpen(false);
          setImage(null); // Clear image after successful upload
          setMaterial(""); // Clear material field
          setMeasurement(""); // Clear measurement field
        } else {
          setError(response.data["body-json"]["body"]);
          setIsPopupOpen(false);
          setImage(null); // Clear image after successful upload
          setMaterial(""); // Clear material field
          setMeasurement("");
          setError(null);
        }
      } catch (error) {
        console.error("Error sending to accounts:", error);
        const errorMessage = error.response
          ? error.response.data.message || "Failed to send to accounts."
          : "Failed to send to accounts.";
        alert(errorMessage);
      }
    } else {
      alert("Please select an image before sending to accounts.");
    }
  };

  const handleStatusUpdate = async () => {
    if (selectedJob) {
      try {
        const response = await axios.put(
          "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_paticular_job_status_update",
          {
            jobId: selectedJob.jobId,
            status: newStatus,
          }
        );

        console.log("Status update response:", response.data);
        alert("Job status updated successfully!");

        setIsUpdatePopupOpen(false);

        setJobDetails((prevDetails) =>
          prevDetails.map((job) =>
            job.jobId === selectedJob.jobId
              ? { ...job, status: newStatus }
              : job
          )
        );
      } catch (error) {
        console.error(
          "Error updating job status:",
          error.response ? error.response.data : error.message
        );
        alert("Failed to update job status.");
      }
    }
  };

  // const getStatusColor = (status) => {
  //   switch (status?.toLowerCase()) {
  //     case "complete":
  //       return "bg-green-200 text-green-800";
  //     case "in_progress":
  //       return "bg-yellow-100 text-yellow-800";
  //     case "on_hold":
  //       return "bg-blue-100 text-blue-800";
  //     case "not_started":
  //       return "bg-red-100 text-red-800";
  //     default:
  //       return "bg-gray-100 text-gray-800";
  //   }
  // };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "complete":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "on_hold":
        return "On Hold";
      case "not_started":
        return "Not Started";
      default:
        return "N/A";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "complete":
        return "bg-green-500 text-white";
      case "not_started":
        return "bg-red-500 text-white";
      case "in_progress":
        return "bg-yellow-500 text-white";
      case "on_hold":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const isSendToProductionEnabled = (status) =>
    !flag || status?.toLowerCase() === "complete" || false;
  if (isLoading) {
    return (
      <div>
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
      </div>
    );
  }

  // if (jobDetails.length === 0) {
  //   return <div className="text-center text-lg">No job details found.</div>;
  // }

  return (
    <div className="container mx-auto p-6">
      {/* {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="p-6">
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Create Job
        </button>
        <CreateJobForm isOpen={isModalOpen} onClose={handleCloseModal} />
      </div>
      <div className="p-6">
        <button
          onClick={handleOpenDirectJobModal}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Create Direct Job
        </button>
        <CreateDirectJobForm isOpen={isDirectJobModalOpen} onClose={handleCloseDirectModal} />
      </div> */}
      <div className="container mx-auto p-6">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="p-6 flex space-x-4">
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Create Job
          </button>
          <button
            onClick={handleOpenDirectJobModal}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Create Direct Job
          </button>
        </div>
        <CreateJobForm isOpen={isModalOpen} onClose={handleCloseModal} />
        <CreateDirectJobForm
          isOpen={isDirectJobModalOpen}
          onClose={handleCloseDirectModal}
        />
      </div>

      <h1 className="text-3xl font-bold mb-6">Job Details</h1>
      {isLoading ? (
        <div>
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
        </div>
      ) : (
        <div>
          {currentItems.length >= 0 ? (
            <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-gray-600">
                  <th className="py-3 px-4 border-b">Project Name</th>
                  <th className="py-3 px-4 border-b">Job Name</th>
                  <th className="py-3 px-4 border-b">Job Name</th>

                  <th className="py-3 px-4 border-b">Designer Names</th>
                  <th className="py-3 px-4 border-b">Coordinator Name</th>
                  <th className="py-3 px-4 border-b">Creation Date</th>
                  <th className="py-3 px-4 border-b">Deadline</th>
                  <th className="py-3 px-4 border-b">Status</th>
                  <th className="py-3 px-4 border-b">Update</th>
                  <th className="py-3 px-4 border-b">Send</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((job) => (
                  <tr key={job.jobId} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{job.projectName}</td>
                    <td className="py-2 px-4 border-b">{job.jobName}</td>
                    <td className="py-2 px-4 border-b">
                      {job.designerNames?.join(", ") || "No designers assigned"}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {job.coordinatorName}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {job.projectCreationDate}
                    </td>

                    <td className="py-2 px-4 border-b">{job.deadline}</td>
                    <td
                      className={`py-2 px-4 border-b ${getStatusColor(
                        job.status
                      )}`}
                    >
                      {getStatusText(job.status)}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => handleUpdate(job)}
                        className="px-4 py-2 text-black rounded hover:bg-yellow-600 w-full md:w-auto"
                      >
                        <Image
                          src={Updaet}
                          alt="user profile picture "
                          className="h-5 w-5"
                        />
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => handleSendToProduction(job)}
                        className={`px-4 py-2 rounded w-full md:w-auto ${
                          !job.flag
                            ? " text-black hover:bg-green-600"
                            : " text-gray-800 cursor-not-allowed"
                        }`}
                        disabled={job.flag}
                      >
                        <Image
                          src={Send}
                          alt="user profile picture"
                          className="h-5 w-5"
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No job details available.</p>
          )}

          {/* Pagination */}
          <div className="flex justify-center mt-4">
            {/* Previous button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 mr-2 ${
                currentPage === 1
                  ? "bg-gray-300"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              } rounded`}
            >
              Previous
            </button>

            {/* Page number buttons */}
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`px-4 py-2 ${
                  currentPage === index + 1
                    ? "bg-blue-700 text-white"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                } rounded mx-1`}
              >
                {index + 1}
              </button>
            ))}

            {/* Next button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 ml-2 ${
                currentPage === totalPages
                  ? "bg-gray-300"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              } rounded`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Popup for sending to production */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Send Job to Production</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="border rounded-md p-2 w-full"
              />

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Material
                </label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="Enter Material"
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>

              {/* Measurement Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Measurement
                </label>
                <input
                  type="text"
                  value={measurement}
                  onChange={(e) => setMeasurement(e.target.value)}
                  placeholder="Enter Measurement"
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleImageUpload}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Upload & Send
              </button>
              <button
                onClick={() => setIsPopupOpen(false)}
                className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Cancel
              </button>
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
                Select Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="border rounded-md p-2 w-full"
              >
                <option value="Select Any one">Select Any one</option>
                <option value="complete">Complete</option>
                <option value="in_progress">In Progress</option>
                <option value="on_hold">On Hold</option>
                <option value="not_started">Not Started</option>
              </select>
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
  );
};

export default DirectProjectDetails;
