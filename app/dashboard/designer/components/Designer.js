"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaChevronDown, FaEdit, FaRegCommentDots } from "react-icons/fa";
import { FaPlus, FaEye } from "react-icons/fa";
import CreateJobForm from "./CreateJobForm";
import CreateDirectJobForm from "./CreateDirectJobForm";
import Dashboard from "./Dashboard";

const ProjectDetails = () => {
  const [material, setMaterial] = useState("");
  const [measurement, setMeasurement] = useState("");
  const [jobDetails, setJobDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState(false);

  const [image, setImage] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [employeeId, setEmployeeId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDirectJobModalOpen, setIsDirectJobModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const [filterStatus, setFilterStatus] = useState("");
  const [viewImage, setViewImage] = useState(null);

  const handleCloseModal = () => setIsModalOpen(false);
  const handleCloseDirectModal = () => setIsDirectJobModalOpen(false);

  useEffect(() => {
    // Retrieve employeeId from localStorage
    const id = localStorage.getItem("employeeId");
    if (id) {
      setEmployeeId(id);
    } else {
      console.error("Employee ID not found. Please log in.");
    }
  }, []);

  useEffect(() => {
    if (
      !isModalOpen &&
      !isDirectJobModalOpen &&
      !isPopupOpen &&
      !isUpdatePopupOpen
    ) {
      fetchJobDetails();
    }
  }, [
    employeeId,
    isModalOpen,
    !isDirectJobModalOpen,
    isPopupOpen,
    !isUpdatePopupOpen,
  ]);

  const fetchJobDetails = async () => {
    setIsLoading(true);
    if (employeeId) {
      console.log("inside fwtchData:", employeeId);

      try {
        const response = await axios.post(
          "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_particular_designer_all_jobs",
          { staffId: employeeId }
        );
        console.log("inside fwtchData:", response);
        if (response.data["body-json"]["statusCode"] == 200) {
          const data = response.data["body-json"]["body"];
          console.log("Body response", data);
          if (Array.isArray(data)) {
            setJobDetails(data);
            setIsLoading(false);
          } else {
            setIsLoading(false);
            console.error("Unexpected response data format:", data);
            setJobDetails([]);
          }
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
        setJobDetails([]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUpdate = (job) => {
    setSelectedJob(job);
    setNewStatus(job.status);
    setIsUpdatePopupOpen(true);
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Modified handleSendToProduction function
  const handleSendToProduction = async (job) => {
    setSelectedJob(job);
    setIsPopupOpen(true);
  };

  const handleImageUpload = async () => {
    console.log(image);
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
          "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_jobs_send_to_production",
          payload
        );
        if (response.data["body-json"]["statusCode"] == 200) {
          console.log("Send to production response:", response.data);

          alert("Sent to production successfully!");
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
        console.error("Error sending to production:", error);
        const errorMessage = error.response
          ? error.response.data.message || "Failed to send to production."
          : "Failed to send to production.";
        alert(errorMessage);
      }
    } else {
      alert("Please select an image before sending to production.");
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
        return "bg-gray-500 text-white";
      case "in_progress":
        return "bg-yellow-500 text-white";
      case "on_hold":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  if (isLoading) {
    return <div className="text-center text-lg">Loading job details...</div>;
  }

  const filteredJobs = filterStatus
    ? jobDetails.filter((job) => job.status === filterStatus)
    : jobDetails;

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (a.status === "complete" && b.status !== "complete") return 1;
    if (a.status !== "complete" && b.status === "complete") return -1;
    return 0;
  });

  return (
    <div className="container mx-auto">
      <Dashboard />
      <div className="">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="p-6 flex space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded bg-white text-gray-700"
          >
            <option value="">All</option>
            <option value="complete">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="on_hold">On Hold</option>
            <option value="not_started">Not Started</option>
          </select>
        </div>
        <CreateJobForm isOpen={isModalOpen} onClose={handleCloseModal} />
        <CreateDirectJobForm
          isOpen={isDirectJobModalOpen}
          onClose={handleCloseDirectModal}
        />
      </div>

      <h1 className="text-2xl font-bold mb-6">Jobs</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {sortedJobs.length > 0 ? (
            <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-gray-600">
                  <th className="px-3 border-b text-sm">Job ID</th>
                  <th className="px-3 border-b text-sm">Project</th>
                  <th className="px-3 border-b text-sm">Description</th>
                  <th className="px-3 border-b text-sm">Coordinator</th>
                  <th className="px-3 border-b text-sm">Designers</th>
                  <th className="px-3 border-b text-sm">Created On</th>
                  <th className="px-3 border-b text-sm">Deadline</th>
                  <th className="px-3 border-b text-sm">Status</th>
                  <th className="px-3 border-b text-sm">Upload</th>
                </tr>
              </thead>
              <tbody>
                {sortedJobs.map((job) => (
                  <tr key={job.jobId} className="hover:bg-gray-50">
                    <td className="py-2 px-3 border-b text-sm">{job.jobId}</td>
                    <td className="py-2 px-3 border-b text-sm">
                      {job.projectName.toUpperCase()}
                    </td>
                    <td className="py-2 px-3 border-b text-sm">
                      {job.jobName.toUpperCase()}
                    </td>
                    <td className="py-2 px-3 border-b text-sm">
                      {job.coordinatorName.toUpperCase()}
                    </td>
                    <td className="py-2 px-3 border-b text-sm">
                      {job.designerNames?.join(", ").toUpperCase() ||
                        "No designers assigned"}
                    </td>
                    <td className="py-2 px-3 border-b text-sm">
                      {job.projectCreationDate}
                    </td>
                    <td className="py-2 px-3 border-b text-sm">
                      {job.deadline}
                    </td>
                    <td
                      className={`py-1 px-1 border-b text-xs  rounded-md flex flex-col justify-between content-center ${getStatusColor(
                        job.status
                      )}`}
                    >
                      <div className="flex flex-row items-center justify-between">
                        {job?.isProjectCoordinator ? (
                          <div className="relative group bg-white flex items-center h-[5vh] w-full rounded px-1">
                            <p className="text-red-600 font-bold text-xs">
                              ON HOLD
                            </p>
                            <FaRegCommentDots className="ml-4 text-red-500" />

                            {/* Tooltip */}
                            <div className="absolute top-6 right-0 z-10 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 w-48">
                              {job?.quotation}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-row items-center justify-between">
                            <p>{getStatusText(job.status)}</p>
                            <button
                              onClick={() => handleUpdate(job)}
                              className="px-2 py-2 text-white rounded-lg  transition-all"
                            >
                              <FaEdit size={20} />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3 border-b text-sm text-center">
                      {job.imageUrl ? (
                        <button onClick={() => setViewImage(job.imageUrl)}>
                          <FaEye size={20} className="text-blue-500" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendToProduction(job)}
                          className={`px-3 py-2 rounded w-full md:w-auto ${
                            !job.flag
                              ? "text-black hover:bg-gray-200"
                              : "text-gray-800 cursor-not-allowed"
                          }`}
                          disabled={job.flag}
                        >
                          <FaPlus size={20} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No job details available.</p>
          )}
        </div>
      )}

      {/* Popup for sending to production */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Upload file</h2>
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="border rounded-md p-2 w-full"
              />

              <div className="mb-4 mt-4">
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="Material"
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>

              {/* Measurement Input */}
              <div className="mb-4">
                <input
                  type="text"
                  value={measurement}
                  onChange={(e) => setMeasurement(e.target.value)}
                  placeholder="Note"
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleImageUpload}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Upload
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

      {viewImage && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full">
            <img
              src={viewImage}
              alt="Uploaded"
              className="max-w-full max-h-[80vh] object-contain mx-auto"
            />
            <button
              onClick={() => setViewImage(null)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
