"use client";
import React, { useState, useEffect } from "react";
import "./progressstatus.css";
import axios from "axios";
import Image from "next/image";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import CreateProjectModal from "./CreateProjectModal";

import NotStartedIcon from "../../../assets/images/not_started.png";
import OngoingIcon from "../../../assets/images/in_progress.png";
import OnHoldIcon from "../../../assets/images/on_hold.png";
import CompletedIcon from "../../../assets/images/done.png";
import EditIcon from "../../../assets/images/edit-icon.png";
import ProjectDetailModal from "./ProjectDetailModal";
import EditProjectModal from "./EditProjectModal";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const Projects = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [lastKey, setLastKey] = useState("");
  const [currentData, setCurrentData] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const dummyData = [
    { id: 1, numerator: 7, denominator: 10 }, // 30% filled
    // { id: 2, numerator: 7, denominator: 10 }, // 70% filled
    // { id: 3, numerator: 1, denominator: 4 },  // 25% filled
    // { id: 4, numerator: 5, denominator: 5 },  // 100% filled
  ];

  const handleOpenDialog = (project) => {
    setSelectedProject(project);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProject(null);
  };

  const handleOpenEditModal = (project) => {
    setSelectedProjectId(project.projectId);
    setIsEditModalOpen(true);
  };

  // Debouncing logic: Set a delay for updating the debounced search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay before updating

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Function to handle search via GET request
  const searchData = async (search) => {
    setIsDataLoading(true); // Show loading state while fetching data
    try {
      const response = await axios.get(
        `https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_search_projects?key=${search}`
      );

      // Check if data is an array and if projectsWithDesigners exists
      const data = response.data["body-json"]["body"];
      const projects = Array.isArray(data)
        ? data
        : data?.projectsWithDesigners || [];

      setCurrentData(projects); // Set the projects data or an empty array
      setIsLoading(false);
      setIsDataLoading(false);
    } catch (error) {
      console.log("Error fetching search results:", error);
      setCurrentData([]); // Set to an empty array if there's an error
      setIsLoading(false);
      setIsDataLoading(false);
    }
  };

  // Trigger data or search API call based on the debounced search term
  useEffect(() => {
    if (debouncedSearchTerm) {
      searchData(debouncedSearchTerm); // Call search API if search term is provided
    } else {
      fetchData("", false); // Fetch default data if no search term
    }
  }, [debouncedSearchTerm, modalKey]);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setModalKey((prevKey) => prevKey + 1);
  };

  const handleNext = () => {
    setIsDataLoading(true);
    if (lastKey) {
      fetchData(lastKey, true);
    }
  };

  // Fetch data function for regular data loading (non-search)
  const fetchData = async (lastKey = "", append = false) => {
    setIsDataLoading(true); // Show loading state while fetching data
    try {
      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_project_all_data",
        {
          limit: 200,
          lastKey: lastKey,
        }
      );

      const data = response.data["body-json"]["body"];
      console.log("This is data", data);

      // Update the data list, reset or append based on the parameters
      if (append) {
        setCurrentData((prevData) => [
          ...prevData,
          ...data.projectsWithDesigners,
        ]);
      } else {
        setCurrentData(data.projectsWithDesigners); // Reset data on initial load
      }

      setLastKey(data.lastKey || "");
      setIsLoading(false);
      setIsDataLoading(false);
    } catch (error) {
      console.log("Error fetching project list:", error);
      setIsLoading(false);
      setIsDataLoading(false);
    }
  };

  // Separate function for search API call

  // console.log("Project codinator message", currentData);
  const handleDataRefresh = () => {
    // This will fetch the latest data after the project is updated
    fetchData(); // fetchData can be called with `append = false` to reset the data
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
    <>
      <div className="py-2" key={modalKey}>
        <div className="flex flex-row">
          <button
            className="w-1/4 bg-blue-500 hover:bg-blue-700 text-white mb-4 rounded mr-6"
            onClick={openModal}
          >
            Add Project
          </button>
          <input
            type="text"
            placeholder="Search by Project Name "
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-2 mb-4 mr-2 border rounded"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th
                  className="border p-2 bg-gray-700 text-white sticky left-0 block"
                  style={{ minWidth: "300px", width: "300px" }}
                >
                  Name
                </th>
                <th
                  className="border p-2 bg-gray-600 text-white "
                  style={{ minWidth: "120px", width: "120px" }}
                >
                  Date
                </th>
                <th
                  className="border p-2 bg-gray-600 text-white "
                  style={{ minWidth: "120px" }}
                >
                  PO Number
                </th>

                <th
                  className="border p-2 bg-gray-600 text-white "
                  style={{ minWidth: "200px", width: "200px" }}
                >
                  Est.Value
                </th>
                <th
                  className="border p-2 bg-gray-600 text-white "
                  style={{ minWidth: "150px", width: "150px" }}
                >
                  Confirmation By
                </th>
                <th
                  className="border p-2 bg-gray-600 text-white "
                  style={{ minWidth: "200px" }}
                >
                  Sales
                </th>
                <th
                  className="border p-2 bg-gray-600 text-white "
                  style={{ minWidth: "200px", width: "200px" }}
                >
                  Coordinator
                </th>
                <th
                  className="border p-2 bg-gray-600 text-white "
                  style={{ minWidth: "180px", width: "180px" }}
                >
                  Sent To A/c for Billing
                </th>
                <th
                  className="border p-2 bg-amber-300"
                  style={{ minWidth: "100px", width: "100px" }}
                >
                  Billing Status
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <div>
                  <h1>No data found</h1>
                </div>
              ) : (
                currentData.map((project, index) => (
                  <tr key={index} className="items-stretch">
                    <td
                      className={`border p-2 text-blue-700 flex items-center sticky left-0 z-10 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-200"
                      }`}
                      style={{ minWidth: "300px", width: "300px" }}
                    >
                      <div className="flex items-center justify-start">
                        {project.status === "not_started" && (
                          <Image
                            src={NotStartedIcon}
                            alt="status_image"
                            height={25}
                            width={25}
                            style={{ height: "25px", width: "25px" }}
                          />
                        )}
                        {project.status === "in_process" && (
                          <Image
                            src={OngoingIcon}
                            alt="status_image"
                            height={25}
                            width={25}
                            style={{ height: "25px", width: "25px" }}
                          />
                        )}
                        {project.status === "complete" && (
                          <Image
                            src={CompletedIcon}
                            alt="status_image"
                            height={25}
                            width={25}
                            style={{ height: "25px", width: "25px" }}
                          />
                        )}
                        {project.status === "on_hold" && (
                          <Image
                            src={OnHoldIcon}
                            alt="status_image"
                            height={25}
                            width={25}
                            style={{ height: "25px", width: "25px" }}
                          />
                        )}
                        &nbsp;
                        <div className="flex justify-between items-center">
                          <div className="hover:cursor-pointer">
                            <Image
                              src={EditIcon}
                              height={20}
                              width={20}
                              alt="edit_icon"
                              onClick={() => handleOpenEditModal(project)}
                              style={{ width: "25px", height: "25px" }}
                            />
                          </div>
                          &nbsp;
                          <button
                            className="text-blue-700 hover:underline text-left"
                            onClick={() => handleOpenDialog(project)}
                          >
                            {project.projectName.toUpperCase()}
                          </button>
                        </div>
                      </div>
                    </td>

                    <td
                      className={`border p-2 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-200"
                      } text-center`}
                      style={{ minWidth: "120px", width: "120px" }}
                    >
                      {project.date}
                    </td>
                    <td
                      className={`border p-2 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-200"
                      } text-center`}
                      style={{ minWidth: "120px" }}
                    >
                      {project.referenceNo.poNumber}
                    </td>

                    <td
                      className={`border p-2 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-200"
                      } text-end`}
                      style={{ minWidth: "200px", width: "200px" }}
                    >
                      ₹ {Number(project.projectValue).toLocaleString("en-US")}
                    </td>
                    <td
                      className={`border p-2 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-200"
                      } text-center`}
                      style={{ minWidth: "150px", width: "150px" }}
                    >
                      {project.confirmationBy
                        ? project.confirmationBy.toUpperCase()
                        : "N/A"}
                    </td>
                    <td
                      className={`border p-2 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-200"
                      } text-center`}
                      style={{ minWidth: "200px" }}
                    >
                      {project.salesPersonName
                        ? project.salesPersonName.toUpperCase()
                        : "N/A"}
                    </td>
                    <td
                      className={`border p-2 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-200"
                      } text-center`}
                      style={{ minWidth: "200px", width: "200px" }}
                    >
                      {project.projectCoordinatorName
                        ? project.projectCoordinatorName.toUpperCase()
                        : "N/A"}
                    </td>
                    <td
                      className={`border p-2 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-200"
                      } text-center`}
                      style={{ minWidth: "180px", width: "180px" }}
                    >
                      {project.sentToBilling === "no" && (
                        <div className="flex justify-center">
                          <Image
                            src={NotStartedIcon}
                            alt="status_image"
                            height={25}
                            width={25}
                            style={{ height: "25px", width: "25px" }}
                          />
                        </div>
                      )}
                      {project.sentToBilling === "done" && (
                        <div className="flex justify-center">
                          <Image
                            src={CompletedIcon}
                            alt="status_image"
                            height={25}
                            width={25}
                            style={{ height: "25px", width: "25px" }}
                          />
                        </div>
                      )}
                      {project.sentToBilling === "partial" && (
                        <div className="flex justify-center">
                          <Image
                            src={OnHoldIcon}
                            alt="status_image"
                            height={25}
                            width={25}
                            style={{ height: "25px", width: "25px" }}
                          />
                        </div>
                      )}
                    </td>
                    <td
                      className={`border p-2 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-200"
                      } text-center`}
                      style={{ minWidth: "100px", width: "100px" }}
                    >
                      <div className="billing-status">
                        {dummyData.map((item) => {
                          const percentage = project.totalJobs
                            ? (project.completedJobs / project.totalJobs) * 100
                            : 0;

                          return (
                            <div key={item.id}>
                              <div className="progress-bar-container">
                                <div className="progress-bar">
                                  <div
                                    className="progress-fill"
                                    style={{
                                      width: `${percentage}%`,
                                    }}
                                  />
                                  <div className="fraction-hover">{`${project.completedJobs}/${project.totalJobs}`}</div>
                                </div>
                              </div>
                              {project?.actualValue !== 0 &&
                              project?.actualValue !== undefined &&
                              project?.actualValue !== "" ? (
                                <p className="text-xs">
                                  ₹ {project?.actualValue}
                                </p>
                              ) : (
                                <p></p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
        <CreateProjectModal isOpen={isModalOpen} onRequestClose={closeModal} />
        {openDialog && selectedProject && (
          <ProjectDetailModal
            projectName={selectedProject.projectName.toUpperCase()}
            projectId={selectedProject.projectId}
            onClose={handleCloseDialog}
          />
        )}
        {isEditModalOpen && selectedProjectId && (
          <EditProjectModal
            projectId={selectedProjectId}
            handleDataRefresh={handleDataRefresh}
            onClose={() => setIsEditModalOpen(false)}
          />
        )}
      </div>
    </>
  );
};

export default Projects;
