"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "./Modal";

const CreateDirectJobForm = ({ isOpen, onClose }) => {
  const [job, setJob] = useState({
    creationDate: "",
    jobName: "",
    projectId: "",
    designerId: [], // This will store the employeeId and the selected designerId
    deadline: "",
    createdBy: "", // Store createdBy, automatically set from employeeId
  });

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
        designerId: [id], // Initialize designerId array with employeeId
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
        if(response.data["body-json"]['statusCode']==200){
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

  const handleDesignerChange = (e) => {
    const selectedDesignerId = e.target.value;
    setJob((prevJob) => ({
      ...prevJob,
      designerId: [employeeId, selectedDesignerId], // Keep the employeeId and add the selected designerId
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    const { jobName, projectId, designerId, deadline, createdBy } = job;
    if (
      !jobName ||
      !projectId ||
      designerId.length < 2 || // Ensure designerId has both the stored and selected IDs
      !deadline ||
      !createdBy
    ) {
      setError("All fields are required.");
      return;
    }

    // Prepare the data for submission
    const formattedJob = {
      jobName: jobName,
      projectId: projectId,
      designerId: [designerId[0], designerId[1]], // Send only the selected designerId
      deadline: new Date(deadline).toLocaleDateString("en-GB"),
      createdBy: createdBy,
    };

    try {
      const productionUrl = 'https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_particular_project_job_creation';
      const directJobnUrl = 'https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_job_creation_for_accounts';

      await axios.post(directJobnUrl,
        //"https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_particular_project_job_creation",
        formattedJob // Send only one job object
      );
      setJob({
        creationDate: "",
        jobName: "",
        projectId: "",
        designerId: [employeeId], // Reset to only the employeeId
        deadline: "",
        createdBy: employeeId, // Reset to employeeId
      });
      setError("");
      setSuccessMessage(`Job "${job.jobName}" successfully created!`);
      setTimeout(() => {
        setSuccessMessage("");

        // if (onSubmit) onSubmit(); // Call the onSubmit callback
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
        <h2 className="text-2xl mb-4">{"Create Direct Job"}</h2>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        {successMessage && (
          <div className="mb-4 text-green-500">{successMessage}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4 border p-4 rounded shadow-sm">
            <div className="mb-4">
              <label className="block text-gray-700">Job Name</label>
              <input
                type="text"
                name="jobName"
                value={job.jobName}
                onChange={handleJobChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            {/* <div className="mb-4">
              <label className="block text-gray-700">Creation Date</label>
              <input
                type="date"
                name="creationDate"
                value={job.creationDate}
                onChange={handleJobChange}
                className="w-full p-2 border rounded"
                required
              />
            </div> */}

            <div className="mb-4">
              <label className="block text-gray-700">Designer</label>
              <select
                name="designerId"
                value={job.designerId[1] || ""} // Handle the selection of the second designer ID
                onChange={handleDesignerChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="" disabled>
                  Select Designer
                </option>
                {designerOptions.length > 0 ? (
                  designerOptions.map((designer) => (
                    <option key={designer.id} value={designer.id}>
                      {designer.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No designers available
                  </option>
                )}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Project</label>
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
              <label className="block text-gray-700">Deadline</label>
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
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateDirectJobForm;
