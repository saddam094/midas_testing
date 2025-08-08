"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import CreateProjectModal from "./CreateProjectModal";

const Projects = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_project_all_data"
        );
        setProjectData(response.data["body-json"].body);
        setFilteredData(response.data["body-json"].body);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [modalKey]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const searchQuery = e.target.value.toLowerCase();
    const filtered = projectData.filter(
      (item) =>
        item.projectName.toLowerCase().includes(searchQuery) ||
        item.salesPerson.toLowerCase().includes(searchQuery)
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setModalKey((prevKey) => prevKey + 1); // Update modalKey to trigger a rerender
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "complete":
        return "bg-green-200 text-green-800";
      case "in_process":
        return "bg-yellow-100 text-yellow-800";
      case "on_hold":
        return "bg-blue-100 text-blue-800";
      case "not_started":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "complete":
        return "Completed";
      case "in_process":
        return "In Progress";
      case "on_hold":
        return "On Hold";
      case "not_started":
        return "Not Started";
      default:
        return "N/A";
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
    <div className="py-2" key={modalKey}>
      {" "}
      {/* Add key here */}
      <div className="flex flex-row">
        <input
          type="text"
          placeholder="Search by Project Name or Salesperson"
          value={searchTerm}
          onChange={handleSearch}
          className="w-full p-2 mb-4 mr-2 border rounded"
        />
        <button
          className="w-1/4 bg-blue-500 hover:bg-blue-700 text-white mb-4 rounded"
          onClick={openModal}
        >
          Create Project
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-800 text-white">Name</th>
              <th className="border p-2 bg-gray-800 text-white">
                Sales Person
              </th>
              <th className="border p-2 bg-gray-800 text-white">
                Confirmation
              </th>
              <th className="border p-2 bg-gray-800 text-white">Date</th>
              <th className="border bg-gray-800 text-white">
                Project Coordinator
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((project, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-200"}
              >
                <td className="border p-2">
                  <Link href="" className="hover:underline text-blue-700">
                    {project.projectName.toUpperCase()}
                  </Link>
                </td>

                <td className="border p-2">{project.salesPerson}</td>
                <td className="border p-2">{project.confirmationBy}</td>
                <td className="border p-2">{project.date}</td>
                <td className="border p-2">{project.projectCoordinator}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        itemsPerPage={itemsPerPage}
        totalItems={filteredData.length}
        paginate={paginate}
        currentPage={currentPage}
      />
      <CreateProjectModal isOpen={isModalOpen} onRequestClose={closeModal} />
    </div>
  );
};

const Pagination = ({ itemsPerPage, totalItems, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="mt-4">
      <ul className="flex justify-center space-x-2">
        {pageNumbers.map((number) => (
          <li
            key={number}
            className={`page-item ${
              number === currentPage ? "text-blue-500" : ""
            }`}
          >
            <button
              onClick={() => paginate(number)}
              className="border py-1 px-3 rounded hover:bg-gray-100"
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Projects;
