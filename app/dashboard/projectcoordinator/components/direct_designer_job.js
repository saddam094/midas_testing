"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FaUserPlus, FaUserMinus, FaEye, FaPause } from "react-icons/fa";
import { MdAssignmentAdd } from "react-icons/md";

import CreateJobForm from "./CreateJobForm";
import CreateDirectJobForm from "./CreateDirectJobForm";
import HoldDialog from "./OnHold";
import Reassign from "./Reassign";

const DirectProjectDetails = () => {
  const router = useRouter();
  const [jobDetails, setJobDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState(false);
  const [lastKey, setLastKey] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);
  const [flag, setFlag] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDirectJobModalOpen, setIsDirectJobModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [viewImage, setViewImage] = useState(null);
  const [showOnHoldDialog, setShowOnHoldDialog] = useState(false);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // newcodestart

  const [isModalOpens, setIsModalOpens] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedDesignerId, setSelectedDesignerId] = useState(null);
  const [actionType, setActionType] = useState(null); // "assign" or "unassign"

  const handleOpenModals = (jobId, type) => {
    setSelectedJobId(jobId);
    setActionType(type);
    setIsModalOpens(true);
  };

  const handleCloseModals = () => {
    setIsModalOpens(false);
    setSelectedJobId(null);
    setSelectedDesignerId(null);
    setActionType(null);
  };

  const handleAction = async () => {
    if (!selectedJobId || !selectedDesignerId) return;

    const url =
      actionType === "assign"
        ? "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_particular_job_assign_dessigner"
        : "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_particular_job_remove_designer";

    const body = {
      jobId: selectedJobId,
      designerId: selectedDesignerId,
    };

    try {
      console.log(body);

      const response = await axios.put(url, body);
      console.log(response);
      // alert(`Designer successfully ${actionType}ed!`);
      handleCloseModals();
      refreshPage();
    } catch (error) {
      console.error("Error in action:", error);
      // alert("Something went wrong. Please try again.");
      handleCloseModals();
      refreshPage();
    }
  };

  // newcodeend

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenDirectJobModal = () => setIsDirectJobModalOpen(true);
  const handleCloseDirectModal = () => setIsDirectJobModalOpen(false);

  const [designerOptions, setDesignerOptions] = useState([]);

  function refreshPage() {
    window.location.reload();
  }

  useEffect(() => {
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
        console.log("localLastKey");
        console.log(employeeId);

        const response = await axios.post(
          "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_particular_desinger_created_job_all_data",
          { ProjectCoordinatorId: employeeId }
        );
        console.log("JOB DETAILS:: ", response.data);

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
            const flagFromJobDetails = data.some((job) => job.flag === false);
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

  useEffect(() => {
    const fetchDesignerOptions = async () => {
      try {
        const response = await axios.get(
          "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_designer_name"
        );
        if (response.data["body-json"]["statusCode"] == 200) {
          const data = response.data["body-json"]["body"];
          if (Array.isArray(data)) {
            setDesignerOptions(data);
          } else {
            console.error("Unexpected response data format:", data);
            setDesignerOptions([]);
          }
        }
      } catch (error) {
        console.error("Error fetching designer names:", error);
        setDesignerOptions([]);
      }
    };

    fetchDesignerOptions();
  }, []);

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

  const handleOnHoldClick = (job) => {
    console.log("JOB DATA:: ", job);
    setSelectedJob({
      id: job.projectId,
      status: "on_hold",
      jobID: job.jobId,
      quotation: job.quotation || "",
      data: "",
    });
    setShowOnHoldDialog(true);
  };

  const handleReassignClick = (job) => {
    console.log("REASSIGN JOB DATA:: ", job);
    setSelectedJob({
      id: job.projectId,
      status: "reassign",
      jobID: job.jobId,
      quotation: job.quotation || "",
      data: {
        jobName: job.jobName,
        projectId: job.projectId,
        projectName: job.projectName,
        designerId: job.designerId,
        designerNames: job.designerNames,
        deadline: job.deadline,
        projectCreationDate: job.projectCreationDate,
        imageUrl: "",
        createdBy: job.createdBy,
        flag: false,
        forProduction: false,
        isDirectJob: job.isDirectJob,
      },
    });
    setShowReassignDialog(true);
  };

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

  return (
    <div className="container  p-1">
      <div className="container mb-5">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div>
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Create Job
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
          {jobDetails.length >= 0 ? (
            <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-gray-600">
                  <th className="py-3 px-4 border-b">Project</th>
                  <th className="py-3 px-4 border-b">Job ID</th>
                  <th className="py-3 px-4 border-b">Description</th>
                  <th className="py-3 px-4 border-b ">Designers</th>
                  <th className="py-3 px-4 border-b">Created On</th>
                  <th className="py-3 px-4 border-b">Deadline</th>
                  <th className="py-3 px-4 border-b">Designer</th>
                  <th className="py-3 px-4 border-b">File</th>
                  <th className="py-3 px-4 border-b">Hold/Re-assign</th>
                </tr>
              </thead>
              <tbody>
                {jobDetails.map((job) => (
                  <tr key={job.jobId} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      {job.projectName?.toUpperCase()}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {job.jobId?.toUpperCase()}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {job.jobName?.toUpperCase()}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex gap-3">
                        <div className="flex flex-col gap-2">
                          <span
                            className="text-green-500 cursor-pointer"
                            onClick={() =>
                              handleOpenModals(job.jobId, "assign")
                            }
                          >
                            <FaUserPlus size={20} />
                          </span>
                          <span
                            className="text-red-500 cursor-pointer"
                            onClick={() =>
                              handleOpenModals(job.jobId, "unassign")
                            }
                          >
                            <FaUserMinus size={20} />
                          </span>
                        </div>
                        {job.designerNames?.join(", ")?.toUpperCase() ||
                          "No designers assigned"}
                      </div>
                    </td>
                    <td className="py-2 px-4 border-b">
                      {job.projectCreationDate?.toUpperCase()}
                    </td>
                    <td className="py-2 px-4 border-b">{job.deadline}</td>
                    <td
                      className={`py-2 px-4 border-b ${getStatusColor(
                        job.status?.toUpperCase()
                      )}`}
                    >
                      {getStatusText(job.status?.toUpperCase())}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {job?.imageUrl ? (
                        <button onClick={() => setViewImage(job.imageUrl)}>
                          <FaEye size={24} className="text-blue-500" />
                        </button>
                      ) : (
                        <p>N/A</p>
                      )}
                    </td>

                    <td className="py-2 px-4 border-b  justify-around items-center">
                      {job?.isProjectCoordinator ? (
                        <button onClick={() => handleReassignClick(job)}>
                          <MdAssignmentAdd
                            color="blue"
                            size={28}
                            className="hover:cursor-pointer border p-1 rounded hover:border-black"
                          />
                        </button>
                      ) : (
                        <button onClick={() => handleOnHoldClick(job)}>
                          <FaPause
                            color="red"
                            size={24}
                            className="hover:cursor-pointer border p-1 rounded hover:border-black"
                          />
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

      {isModalOpens && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">
              {actionType === "assign"
                ? "Assign Designer"
                : "Unassign Designer"}
            </h2>

            <select
              value={selectedDesignerId || ""}
              onChange={(e) => setSelectedDesignerId(e.target.value)}
              className="w-full p-2 border rounded-lg mb-4"
            >
              <option value="" disabled>
                Select a Designer
              </option>
              {actionType === "assign"
                ? designerOptions.map((designer) => (
                    <option key={designer.id} value={designer.id}>
                      {designer.name}
                    </option>
                  ))
                : jobDetails
                    .find((job) => job.jobId === selectedJobId)
                    ?.designerNames?.map((designer, index) => (
                      <option
                        key={index}
                        value={
                          jobDetails.find((job) => job.jobId === selectedJobId)
                            ?.designerId?.[index]
                        }
                      >
                        {designer}
                      </option>
                    ))}
            </select>

            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCloseModals}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {viewImage && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="modal">
              {viewImage.includes(".pdf") ? (
                <embed
                  src={viewImage}
                  type="application/pdf"
                  width="600"
                  height="500"
                />
              ) : (
                <img
                  src={viewImage}
                  alt="View"
                  className="max-w-full max-h-[80vh] object-contain mx-auto"
                />
              )}
            </div>
            <button
              onClick={() => setViewImage(null)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <HoldDialog
        isOpen={showOnHoldDialog}
        onClose={() => setShowOnHoldDialog(false)}
        jobData={selectedJob}
      />
      <Reassign
        isOpen={showReassignDialog}
        onClose={() => setShowReassignDialog(false)}
        jobData={selectedJob}
      />
    </div>
  );
};

export default DirectProjectDetails;
