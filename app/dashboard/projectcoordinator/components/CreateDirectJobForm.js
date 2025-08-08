"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "./Modal";

const CreateDirectJobForm = ({ isOpen, onClose }) => {
  const [job, setJob] = useState({
    creationDate: "",
    jobName: "",
    projectId: "",
    designerId: [], // Updated to store multiple designer IDs
    deadline: "",
    createdBy: "", // Automatically set from employeeId
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
        if (response.data["body-json"]['statusCode'] === 200) {
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
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setJob((prevJob) => ({
      ...prevJob,
      designerId: selectedOptions,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    const { jobName, projectId, designerId, deadline, createdBy } = job;
    if (
      !jobName ||
      !projectId ||
      designerId.length === 0 || // Ensure at least one designer is selected
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
      designerId: designerId, // Send the array of designer IDs
      deadline: new Date(deadline).toLocaleDateString("en-GB"),
      createdBy: createdBy,
    };

    try {
      const directJobUrl =
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_job_creation_for_accounts";

      await axios.post(directJobUrl, formattedJob);
      setJob({
        creationDate: "",
        jobName: "",
        projectId: "",
        designerId: [], // Reset to empty array
        deadline: "",
        createdBy: employeeId, // Reset to employeeId
      });
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

  const getSelectedDesignerNames = () => {
    return designerOptions
      .filter((designer) => job.designerId.includes(designer.id))
      .map((designer) => designer.name);
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

            <div className="mb-4">
              <label className="block text-gray-700">Designer</label>
              <select
                name="designerId"
                multiple // Allow multiple selections
                value={job.designerId} // Bind to the designerId array
                onChange={handleDesignerChange}
                className="w-full p-2 border rounded"
                required
              >
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

            {job.designerId.length > 0 && (
              <div className="mb-4">
                <label className="block text-gray-700">Selected Designers:</label>
                <ul className="list-disc pl-5 text-gray-600">
                  {getSelectedDesignerNames().map((name, index) => (
                    <li key={index}>{name}</li>
                  ))}
                </ul>
              </div>
            )}

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
