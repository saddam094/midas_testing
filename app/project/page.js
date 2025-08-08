"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const ProjectDetails = () => {
  const [jobDetails, setJobDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [employeeId, setEmployeeId] = useState(null);
  const [flag, setFlag] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [editFormData, setEditFormData] = useState({
    jobId: "",
    jobName: "",
    designerId: [],
    deadline: "",
    updatedBy: "",
  });
  const [designerOptions, setDesignerOptions] = useState([]);

  // State to manage the current page
  const [currentPage, setCurrentPage] = useState(1);

  // State for the number of items per page
  const [itemsPerPage] = useState(4); // Adjusted to 5 items per page

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
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const idFromHash = window.location.hash;
      setProjectId(idFromHash);
    }
  }, []);
  // console.log(" this is the project id ", projectId);

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
    const fetchJobDetails = async () => {
      if (projectId) {
        try {
          const response = await axios.post(
            "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_particular_project_all_jobs",
            { projectId: projectId }
          );

          const data = response.data["body"];
          if (Array.isArray(data)) {
            setJobDetails(data);
            const flagFromJobDetails = data.some((job) => job.flag === false); // Adjust flag logic as needed
            setFlag(flagFromJobDetails);
          } else {
            console.error("Unexpected response data format:", data);
            setJobDetails([]);
          }
        } catch (error) {
          console.error("Error fetching job details:", error);
          setJobDetails([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchJobDetails();
  }, [projectId]);

  useEffect(() => {
    const fetchDesignerOptions = async () => {
      try {
        const response = await axios.get(
          "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_designer_name"
        );

        const data = response.data["body-json"]["body"];
        if (Array.isArray(data)) {
          setDesignerOptions(data);
        } else {
          console.error("Unexpected response data format:", data);
          setDesignerOptions([]);
        }
      } catch (error) {
        console.error("Error fetching designer names:", error);
        setDesignerOptions([]);
      }
    };

    fetchDesignerOptions();
  }, []);

  const handleUpdate = (job) => {
    setSelectedJob(job);
    setNewStatus(job.status);
    setIsUpdatePopupOpen(true);
  };

  const handleEdit = (job) => {
    setSelectedJob(job);
    setEditFormData({
      jobId: job.jobId,
      jobName: job.jobName,
      designerId: job.designerId,
      deadline: job.deadline,
      updatedBy: employeeId,
    });
    setIsEditPopupOpen(true);
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
          imageUrl: presignedUrl.split("?")[0], // Use the URL without query params
        };

        // Then, send the job to production with the image URL
        const response = await axios.post(
          "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_jobs_send_to_production",
          payload
        );

        console.log("Send to production response:", response.data);
        alert("Sent to production successfully!");
        setIsPopupOpen(false);
        setImage(null); // Clear image after successful upload
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

  const handleEditJob = async () => {
    try {
      const response = await axios.put(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_job_details_update",
        editFormData
      );

      console.log("Edit job response:", response.data);
      alert("Job details updated successfully!");

      setIsEditPopupOpen(false);

      setJobDetails((prevDetails) =>
        prevDetails.map((job) =>
          job.jobId === selectedJob.jobId ? { ...editFormData } : job
        )
      );
    } catch (error) {
      console.error(
        "Error updating job details:",
        error.response ? error.response.data : error.message
      );
      alert("Failed to update job details.");
    }
  };

  const handleAddDesigner = () => {
    setEditFormData((prevData) => ({
      ...prevData,
      designerId: [...prevData.designerId, ""],
    }));
  };

  const handleRemoveDesigner = (index) => {
    setEditFormData((prevData) => ({
      ...prevData,
      designerId: prevData.designerId.filter((_, i) => i !== index),
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleDesignerChange = (index, value) => {
    const newDesignerIds = [...editFormData.designerId];
    newDesignerIds[index] = value;
    setEditFormData((prevData) => ({
      ...prevData,
      designerId: newDesignerIds,
    }));
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "complete":
        return "bg-green-200 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "on_hold":
        return "bg-blue-100 text-blue-800";
      case "not_started":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isSendToProductionEnabled = (status) =>
    !flag || status?.toLowerCase() === "complete" || false;
  if (isLoading) {
    return <div className="text-center text-lg">Loading job details...</div>;
  }

  // if (jobDetails.length === 0) {
  //   return <div className="text-center text-lg">No job details found.</div>;
  // }

  return (
    <div className="container mx-auto p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Back
      </button>
      <h1 className="text-3xl font-bold mb-6">Job Details</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {currentItems.length > 0 ? (
            <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-gray-600">
                  <th className="py-3 px-4 border-b">Project Name</th>
                  <th className="py-3 px-4 border-b">Job Name</th>
                  <th className="py-3 px-4 border-b">Designer Names</th>
                  <th className="py-3 px-4 border-b">Creation Date</th>
                  <th className="py-3 px-4 border-b">Deadline</th>
                  <th className="py-3 px-4 border-b">Status</th>
                  <th className="py-3 px-4 border-b">Actions</th>
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
                      {job.projectCreationDate}
                    </td>
                    <td className="py-2 px-4 border-b">{job.deadline}</td>
                    <td
                      className={`py-2 px-4 border-b ${getStatusColor(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex flex-col md:flex-row gap-2">
                        <button
                          onClick={() => handleUpdate(job)}
                          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 w-full md:w-auto"
                        >
                          Update Status
                        </button>
                        <button
                          onClick={() => handleEdit(job)}
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full md:w-auto"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleSendToProduction(job)}
                          className={`px-4 py-2 rounded w-full md:w-auto ${
                            isSendToProductionEnabled(job.status)
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "bg-gray-400 text-gray-800 cursor-not-allowed"
                          }`}
                          disabled={!isSendToProductionEnabled(job.status)}
                        >
                          Send to Production
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No job available.</p>
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

      {/* Popup for editing job */}
      {isEditPopupOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Job Details</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Job Name</label>
              <input
                type="text"
                name="jobName"
                value={editFormData.jobName}
                onChange={handleInputChange}
                className="border rounded-md p-2 w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Designer</label>
              {editFormData.designerId.map((designerId, index) => (
                <div key={index} className="flex items-center mb-2">
                  <select
                    value={designerId}
                    onChange={(e) =>
                      handleDesignerChange(index, e.target.value)
                    }
                    className="border rounded-md p-2 w-full"
                  >
                    <option value="">Select Designer</option>
                    {designerOptions.map((designer) => (
                      <option key={designer.id} value={designer.id}>
                        {designer.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRemoveDesigner(index)}
                    className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddDesigner}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Designer
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Deadline</label>
              <input
                type="date"
                name="deadline"
                value={editFormData.deadline}
                onChange={handleInputChange}
                className="border rounded-md p-2 w-full"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleEditJob}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditPopupOpen(false)}
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

export default ProjectDetails;
