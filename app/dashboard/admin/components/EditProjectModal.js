"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const EditProjectModal = ({ projectId, onClose, handleDataRefresh }) => {
  const [projectData, setProjectData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProjectData, setUpdatedProjectData] = useState({});
  const [employeeId, setEmployeeId] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [salespersons, setSalespersons] = useState([]); // State to hold the list of salespersons
  const [selectedSalesPersonId, setSelectedSalesPersonId] = useState(""); // State for the selected salesperson's ID

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      setEmployeeId(decodedToken.employeeId);
    }
  }, []);

  // Fetch project data
  useEffect(() => {
    const fetchProjectData = async () => {
      setIsLoading(true);
      setIsDataLoading(true);
      try {
        const response = await axios.post(
          "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_particular_project_all_data",
          { projectId }
        );
        setProjectData(response.data["body-json"]["body"]);
        setIsLoading(false);
        setIsDataLoading(false);
      } catch (error) {
        console.error("Error fetching project data", error);
        setIsLoading(false);
        setIsDataLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  // Fetch salespersons list
  useEffect(() => {
    const fetchSalespersons = async () => {
      try {
        const response = await axios.get(
          "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_sales_person_names"
        );
        setSalespersons(response.data["body-json"]["body"]); // Assume this returns an array of salesperson objects
      } catch (error) {
        console.error("Error fetching salespersons", error);
      }
    };

    fetchSalespersons();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
    setUpdatedProjectData({
      ...projectData,
      contactPerson: {
        name: projectData.contactPerson.name || "",
        phone: projectData.contactPerson.phone || "",
        alternatePhone: projectData.contactPerson.alternatePhone || "",
        email: projectData.contactPerson.email || "",
      },
      referenceNo: {
        poNumber: projectData.referenceNo?.poNumber || "",
        poReceivingDate: projectData.referenceNo?.poReceivingDate || "",
      },
      salesPerson: projectData.salesPerson?.id || "",
      projectValue: projectData.projectValue || "",
    });
    setSelectedSalesPersonId(projectData.salesPerson?.id || ""); // Initialize the selected salesperson ID
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const keys = name.split(".");
      setUpdatedProjectData((prevData) => ({
        ...prevData,
        [keys[0]]: {
          ...prevData[keys[0]],
          [keys[1]]: value,
        },
      }));
    } else {
      setUpdatedProjectData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSalespersonChange = (e) => {
    setSelectedSalesPersonId(e.target.value);
  };

  const handleUpdateProject = async () => {
    try {
      const finalSalesPersonId =
        selectedSalesPersonId ||
        updatedProjectData.salesPerson ||
        projectData.salesPerson?.salesPersonId;

      // If salesPersonId is still missing, return early and show an error
      if (!finalSalesPersonId) {
        console.error("Salesperson is required.");
        alert("Salesperson is required. Please select a salesperson.");
        return; // Don't continue if salesperson is missing
      }
      const updatedData = {
        projectId: projectId,
        projectName: updatedProjectData.projectName || projectData.projectName,
        salesPerson: finalSalesPersonId, // Ensure salesperson is always included
        contactPerson: {
          name:
            updatedProjectData.contactPerson?.name ||
            projectData.contactPerson.name,
          phone:
            updatedProjectData.contactPerson?.phone ||
            projectData.contactPerson.phone,
          alternatePhone:
            updatedProjectData.contactPerson?.alternatePhone ||
            projectData.contactPerson.alternatePhone,
          email:
            updatedProjectData.contactPerson?.email ||
            projectData.contactPerson.email,
        },
        receivingDate:
          updatedProjectData.receivingDate || projectData.receivingDate,
        deadlineDate:
          updatedProjectData.deadlineDate || projectData.deadlineDate,
        confirmationBy:
          updatedProjectData.confirmationBy || projectData.confirmationBy,
        projectCoordinatorId:
          updatedProjectData.projectCoordinator ||
          projectData.projectCoordinator, // Ensure the project coordinator is included in the update
        creatorRole: "admin",
        creatorEmail: employeeId,
        referenceNo: {
          poNumber:
            updatedProjectData.referenceNo?.poNumber ||
            projectData.referenceNo.poNumber,
          poReceivingDate:
            updatedProjectData.referenceNo?.poReceivingDate ||
            projectData.referenceNo.poReceivingDate,
        },
        updatedBy: employeeId,
        role: "admin",
        projectValue:
          updatedProjectData.projectValue || projectData.projectValue,
      };

      await axios.put(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_edit_project",
        updatedData
      );
      handleDataRefresh();
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error("Error updating project", error);
    }
  };

  return !isLoading && projectData ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 sm:px-0">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative overflow-y-auto max-h-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-12 h-12 flex items-center justify-center text-gray-800 hover:bg-gray-300 rounded-full"
          style={{ fontSize: "40px" }}
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4">Edit Project</h2>

        {/* Project Name */}
        <div className="mb-4">
          <label className="block font-semibold">Project Name:</label>
          {isEditing ? (
            <input
              type="text"
              name="projectName"
              value={updatedProjectData.projectName.toUpperCase() || ""}
              onChange={handleInputChange}
              className="border rounded p-2 w-full"
            />
          ) : (
            <p>{projectData.projectName?.toUpperCase()}</p>
          )}
        </div>

        {/* Salesperson */}
        <div className="mb-4">
          <label className="block font-semibold">Salesperson:</label>
          {isEditing ? (
            <select
              name="salesPerson"
              value={selectedSalesPersonId || ""}
              onChange={handleSalespersonChange}
              className="border rounded p-2 w-full"
            >
              <option value={updatedProjectData?.salesPerson?.id}>
                {projectData.salesPerson?.name}
              </option>
              {salespersons?.map((salesperson) => (
                <option key={salesperson.id} value={salesperson.id}>
                  {salesperson.name}
                </option>
              ))}
            </select>
          ) : (
            <p>{projectData.salesPerson?.name}</p>
          )}
        </div>

        {/* Contact Person */}
        <div className="mb-4">
          <label className="block font-semibold">Contact Person:</label>
          {isEditing ? (
            <>
              <input
                type="text"
                name="contactPerson.name"
                value={updatedProjectData.contactPerson?.name || ""}
                onChange={handleInputChange}
                className="border rounded p-2 w-full"
              />
              <input
                type="text"
                name="contactPerson.phone"
                value={updatedProjectData.contactPerson?.phone || ""}
                onChange={handleInputChange}
                className="border rounded p-2 w-full mt-2"
              />
              <input
                type="text"
                name="contactPerson.alternatePhone"
                value={updatedProjectData.contactPerson?.alternatePhone || ""}
                onChange={handleInputChange}
                className="border rounded p-2 w-full mt-2"
              />
              <input
                type="email"
                name="contactPerson.email"
                value={updatedProjectData.contactPerson?.email || ""}
                onChange={handleInputChange}
                className="border rounded p-2 w-full mt-2"
              />
            </>
          ) : (
            <p>
              {projectData.contactPerson?.name} (
              {projectData.contactPerson?.phone}) -{" "}
              {projectData.contactPerson?.email}
            </p>
          )}
        </div>

        {/* Project Value */}
        <div className="mb-4">
          <label className="block font-semibold">Project Value:</label>
          {isEditing ? (
            <input
              type="text"
              name="projectValue"
              value={updatedProjectData.projectValue || ""}
              onChange={handleInputChange}
              className="border rounded p-2 w-full"
            />
          ) : (
            <p>{projectData.projectValue}</p>
          )}
        </div>

        {/* Receiving Date */}
        <div className="mb-4">
          <label className="block font-semibold">Receiving Date:</label>
          {isEditing ? (
            <input
              type="date"
              name="receivingDate"
              value={updatedProjectData.receivingDate || ""}
              onChange={handleInputChange}
              className="border rounded p-2 w-full"
            />
          ) : (
            <p>{projectData.receivingDate}</p>
          )}
        </div>

        {/* Deadline Date */}
        <div className="mb-4">
          <label className="block font-semibold">Deadline Date:</label>
          {isEditing ? (
            <input
              type="date"
              name="deadlineDate"
              value={updatedProjectData.deadlineDate || ""}
              onChange={handleInputChange}
              className="border rounded p-2 w-full"
            />
          ) : (
            <p>{projectData.deadlineDate}</p>
          )}
        </div>

        {/* Confirmation By */}
        <div className="mb-4">
          <label className="block font-semibold">Confirmation By:</label>
          {isEditing ? (
            <input
              type="text"
              name="confirmationBy"
              value={updatedProjectData.confirmationBy || ""}
              onChange={handleInputChange}
              className="border rounded p-2 w-full"
            />
          ) : (
            <p>{projectData.confirmationBy}</p>
          )}
        </div>

        {/* Project Coordinator Id */}
        <div className="mb-4">
          <label className="block font-semibold">Project Coordinator Id:</label>
          {isEditing ? (
            <input
              type="text"
              name="projectCoordinatorId"
              value={updatedProjectData.projectCoordinator || ""}
              onChange={handleInputChange}
              className="border rounded p-2 w-full"
            />
          ) : (
            <p>{projectData.projectCoordinator}</p>
          )}
        </div>

        {/* Reference No */}
        <div className="mb-4">
          <label className="block font-semibold">
            Reference Number (PO Number):
          </label>
          {isEditing ? (
            <input
              type="text"
              name="referenceNo.poNumber"
              value={updatedProjectData.referenceNo?.poNumber || ""}
              onChange={handleInputChange}
              className="border rounded p-2 w-full"
            />
          ) : (
            <p>{projectData.referenceNo?.poNumber}</p>
          )}
        </div>

        {/* PO Receiving Date */}
        {isEditing ? (
          <button
            onClick={handleUpdateProject}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Update
          </button>
        ) : (
          <button
            onClick={handleEditClick}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Edit
          </button>
        )}

        <button
          onClick={onClose}
          className="ml-4 bg-gray-400 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  ) : (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 sm:px-0">
      <svg
        className="animate-spin h-8 w-8 text-white"
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
};

export default EditProjectModal;
