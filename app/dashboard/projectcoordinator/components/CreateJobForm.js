"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "./Modal";

const CreateJobForm = ({ isOpen, onClose }) => {
  const [job, setJob] = useState({
    creationDate: "",
    jobName: "",
    projectId: "",
    designerId: [], // Store selected designer IDs
    deadline: "",
    createdBy: "", // Automatically set from employeeId
  });
  const [isDirectJob, setIsDirectJob] = useState(false); // Track "Direct Job" checkbox
  const [designerOptions, setDesignerOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [employeeId, setEmployeeId] = useState(null);

  // Fetch all designer names on component mount
  useEffect(() => {
    axios
      .get(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_designer_name"
      )
      .then((response) => {
        const data = response.data["body-json"]["body"];
        if (
          Array.isArray(data) &&
          data.every((designer) => designer.id && designer.name)
        ) {
          setDesignerOptions(data);
        } else {
          setError("Unexpected response format for designer names.");
          console.error("Received data:", data);
        }
      })
      .catch((error) => {
        setError("Failed to load designer names.");
        console.error("API Error:", error);
      });
  }, []);

  // Fetch employeeId from localStorage
  useEffect(() => {
    const id = localStorage.getItem("employeeId");
    if (id) {
      setEmployeeId(id);
      setJob((prevJob) => ({
        ...prevJob,
        createdBy: id, // Set createdBy as employeeId
      }));
    } else {
      console.error("Employee ID not found. Please log in.");
    }
  }, []);

  // Fetch all project names on component mount
  useEffect(() => {
    axios
      .get(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_all_projects_names"
      )
      .then((response) => {
        if (response.data["body-json"]["statusCode"] == 200) {
          const data = response.data["body-json"]["body"];
          if (
            Array.isArray(data) &&
            data.every((project) => project.projectId && project.projectName)
          ) {
            setProjectOptions(data);
          } else {
            setError("Unexpected response format for project names.");
            console.error("Received data:", data);
          }
        }
      })
      .catch((error) => {
        setError("Failed to load project names.");
        console.error("API Error:", error);
      });
  }, []);

  const handleJobChange = (e) => {
    const { name, value } = e.target;
    setJob({
      ...job,
      [name]: value,
    });
  };

  const handleDesignerChange = (e, designerId) => {
    if (e.target.checked) {
      setJob((prevJob) => ({
        ...prevJob,
        designerId: [...prevJob.designerId, designerId],
      }));
    } else {
      setJob((prevJob) => ({
        ...prevJob,
        designerId: prevJob.designerId.filter((id) => id !== designerId),
      }));
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    const { jobName, projectId, designerId, deadline, createdBy } = job;
    if (!jobName || !projectId || designerId.length === 0 || !deadline || !createdBy) {
      setError("All fields are required.");
      return;
    }

    // Prepare the data for submission
    const formattedJob = {
      jobName: jobName,
      projectId: projectId,
      designerId: designerId, // Include all selected designer IDs
      deadline: new Date(deadline).toLocaleDateString("en-GB"),
      createdBy: createdBy,
      isDirectJob: isDirectJob, // Include the "Direct Job" field
    };

    try {
      console.log(formattedJob);
      
      const productionUrl =
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_particular_project_job_creation";

      const response = await axios.post(productionUrl, formattedJob);
      setJob({
        creationDate: "",
        jobName: "",
        projectId: "",
        designerId: [],
        deadline: "",
        createdBy: employeeId, // Reset to employeeId
      });
      console.log(response.data);
      
      setIsDirectJob(false); // Reset the checkbox
      setError("");
      setSuccessMessage(`Job "${job.jobName}" successfully created!`);
      setTimeout(() => {
        setSuccessMessage("");
        onClose();
      }, 2000);
    } catch (error) {
      setError("Failed to submit job data.");
      console.error("Submission Error:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
  <div className="container mx-auto p-6">
    <div className="flex items-center justify-between space-x-16 mb-4">
      <h2 className="text-2xl font-semibold">Create Job</h2>
      <label className="ml-4 text-lg flex items-center">
        <input
          type="checkbox"
          checked={isDirectJob}
          onChange={(e) => setIsDirectJob(e.target.checked)}
          className="mr-2 h-4 w-4"
        />
        Direct Job
      </label>
    </div>
    {error && <div className="mb-4 text-red-500">{error}</div>}
    {successMessage && (
      <div className="mb-4 text-green-500">{successMessage}</div>
    )}
    <form onSubmit={handleSubmit}>
      <div className="mb-4 border p-4 rounded shadow-sm bg-white">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Project Name</label>
          <select
            name="projectId"
            value={job.projectId}
            onChange={handleJobChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="" disabled>
              Select Project
            </option>
            {projectOptions.length > 0 ? (
              projectOptions.map((project) => (
                <option key={project.projectId} value={project.projectId}>
                  {project.projectName}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No projects available
              </option>
            )}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Job Name</label>
          <input
            type="text"
            name="jobName"
            value={job.jobName}
            onChange={handleJobChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Designer</label>
          <div className="border rounded p-2 max-h-40 overflow-y-auto">
            {designerOptions.length > 0 ? (
              designerOptions.map((designer) => (
                <div key={designer.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`designer-${designer.id}`}
                    value={designer.id}
                    checked={job.designerId.includes(designer.id)}
                    onChange={(e) => handleDesignerChange(e, designer.id)}
                    className="mr-2 h-4 w-4"
                  />
                  <label
                    htmlFor={`designer-${designer.id}`}
                    className="text-gray-700"
                  >
                    {designer.name}
                  </label>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No designers available</div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Deadline</label>
          <input
            type="date"
            name="deadline"
            value={job.deadline}
            onChange={handleJobChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
        >
          Submit
        </button>
      </div>
    </form>
  </div>
</Modal>

  );
};

export default CreateJobForm;
