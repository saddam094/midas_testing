"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import CreateProfileModal from "./CreateProfileModal";
import Link from "next/link";

const Staff = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [staffData, setStaffData] = useState([]);
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
          "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_staff_all_data"
        );
        setStaffData(response.data["body-json"].body);
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
    const filtered = staffData.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery) ||
        item.email.toLowerCase().includes(searchQuery)
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

  return isLoading ? (
    `Loading...`
  ) : (
    <div className="py-2" key={modalKey}>
      {" "}
      {/* Add key here */}
      <div className="flex flex-row">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={handleSearch}
          className="w-full p-2 mb-4 mr-2 border rounded"
        />
        <button
          className="w-1/4 bg-blue-500 hover:bg-blue-700 text-white mb-4 rounded"
          onClick={openModal}
        >
          Create Profile
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-800 text-white">Name</th>
              <th className="border p-2 bg-gray-800 text-white">Email</th>
              <th className="border p-2 bg-gray-800 text-white">Department</th>
              <th className="border p-2 bg-gray-800 text-white">Job Title</th>
              <th className="border bg-gray-800 text-white">Phone</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-200"}
              >
                <td className="border p-2">
                  <Link href="" className="hover:underline text-blue-700">
                    {item.shortName.toUpperCase()}
                  </Link>
                </td>

                <td className="border p-2">{item.email}</td>
                <td className="border p-2">{item.department}</td>
                <td className="border p-2">{item.jobTitle}</td>
                <td className="border p-2">{item.phone}</td>
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
      <CreateProfileModal isOpen={isModalOpen} onRequestClose={closeModal} />
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

export default Staff;
