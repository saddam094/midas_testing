"use client";
import React, { useState, useEffect } from "react";
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
import { jwtDecode } from "jwt-decode";
import EditProjectModal from "./EditProjectModal";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [lastKey, setLastKey] = useState("");
  const [currentData, setCurrentData] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectClicked, setProjectClicked] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      setEmployeeId(decodedToken.employeeId);
    }
  }, []);

  const handleOpenDialog = (project) => {
    setProjectClicked(true);
    setSelectedProject(project.projectId);
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

  const fetchData = async (lastKey = "", append = false) => {
    try {
      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_particular_coordinator_all_project",
        {
          limit: 200,
          projectCoordinator: employeeId,
          lastKey: lastKey,
        }
      );
      console.log(response.data);
      const data = response.data["body-json"]["body"];

      if (append) {
        setCurrentData((prevData) => [...prevData, ...data.projects]);
      } else {
        setCurrentData(data.projects); //data reset on initial load
      }

      setLastKey(data.lastKey || "");
      setIsLoading(false);
      setIsDataLoading(false);
    } catch (error) {
      console.log("Error fetching projects list");
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchData("", false);
    }
  }, [modalKey, employeeId]);

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
        <button
          className="w-1/4 bg-blue-500 hover:bg-blue-700 text-white mb-4 rounded"
          onClick={openModal}
        >
          Add Project
        </button>

        <div className="overflow-x-auto ">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-700 text-white sticky left-0 block">
                  Name
                </th>
                <th className="border p-2 bg-gray-600 text-white ">
                  Receiving Date
                </th>

                <th className="border p-2 bg-gray-600 text-white ">Deadline</th>
                <th className="border p-2 bg-amber-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((project, index) => (
                <tr key={index} className="items-stretch">
                  <td
                    className={`border p-2 text-blue-700 flex items-center sticky left-0 z-10 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-200"
                    }`}
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
                      <button
                        className="text-blue-700 hover:underline text-left"
                        onClick={() => handleOpenDialog(project)}
                      >
                        {project.projectName.toUpperCase()}
                      </button>
                      &nbsp;&nbsp;
                      <div className="hover:cursor-pointer">
                        <Image
                          src={EditIcon}
                          height={20}
                          width={20}
                          alt="edit_icon"
                          onClick={() => handleOpenEditModal(project)}
                        />
                      </div>
                    </div>
                  </td>

                  <td
                    className={`border p-2 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-200"
                    } text-center`}
                  >
                    {project.receivingDate}
                  </td>
                  <td
                    className={`border p-2 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-200"
                    } text-center`}
                    style={{ minWidth: "120px" }}
                  >
                    {project.deadlineDate}
                  </td>

                  <td
                    className={`border p-2 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-200"
                    } text-end`}
                    style={{ minWidth: "200px", width: "200px" }}
                  >
                    ₹{" "}
                    {Number(project.contactPerson.value).toLocaleString(
                      "en-US"
                    )}
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
        <CreateProjectModal isOpen={isModalOpen} onRequestClose={closeModal} />
        {openDialog && selectedProject && (
          <ProjectDetailModal
            projectId={selectedProject}
            onClose={handleCloseDialog}
          />
        )}
        {isEditModalOpen && selectedProjectId && (
          <EditProjectModal
            projectId={selectedProjectId}
            onClose={() => setIsEditModalOpen(false)}
          />
        )}
      </div>
    </>
  );
};

export default Dashboard;
