"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import CreateProfileModal from "./CreateProfileModal";
import EditProfileModal from "./EditProfileModal";
import Link from "next/link";

const Staff = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [staffData, setStaffData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [currentItems, setCurrentItems] = useState([]);
  const [lastKey, setLastKey] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [loadingButtonId, setLoadingButtonId] = useState(null);

  const fetchData = async (lastKey = "", append = false) => {
    try {
      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_staff_all_data",
        {
          limit: 200,
          lastKey: lastKey,
        }
      );

      const data = response.data["body-json"]["body"];
      console.log("STAFF: ", data);

      if (append) {
        setCurrentItems((prevItems) => [...prevItems, ...data.data]);
      } else {
        setCurrentItems(data.data);
      }

      setLastKey(data.lastKey || "");
      setIsLoading(false);
      setIsDataLoading(false);
    } catch (error) {
      console.error("Error fetching Staff data: ", error);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const searchData = async (search) => {
    setIsDataLoading(true);
    try {
      const response = await axios.get(
        `https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_search_staff?key=${search}`
      );

      const data = response.data["body-json"]["body"];
      const projects = Array.isArray(data) ? data : data?.data || [];

      setCurrentItems(projects);
      setIsLoading(false);
      setIsDataLoading(false);
    } catch (error) {
      console.log("Error fetching search results:", error);
      setCurrentItems([]);
      setIsLoading(false);
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedSearchTerm) {
      searchData(debouncedSearchTerm);
    } else {
      fetchData("", false);
    }
  }, [debouncedSearchTerm, modalKey]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setModalKey((prevKey) => prevKey + 1);
  };

  const openEditModal = () => setIsEditModalOpen(true);
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingItem(null); // Reset editing item
  };

  const handleNext = () => {
    setIsDataLoading(true);
    if (lastKey) {
      fetchData(lastKey, true);
    }
  };

  const handleStatusUpdate = async (employeeId, currentStatus) => {
    // Toggle status: if "Active" -> send "Inactive", if "Inactive" -> send "Active"
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    setLoadingButtonId(employeeId);
    try {
      // await axios.put(
      const response = await axios.put(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_staff_status_update",
        {
          employeeId: employeeId,
          status: newStatus,
        }
      );
      if (response.data["body-json"]["statusCode"] === 200) {
        setSuccessMessage("Employee status updated successfully!");
        fetchData(lastKey); // Refetch data after updating the status
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setSuccessMessage("Failed to update employee status");
    } finally {
      setLoadingButtonId(null);
    }
  };

  const handleEditProfile = (item) => {
    setEditingItem(item);
    openEditModal(); // Open edit modal
  };

  // Inside the Staff component
  const refreshTable = () => {
    fetchData(); // Refetch the staff data
  };

  return isLoading ? (
    <div className="flex justify-center items-center h-screen">
      <svg
        className="animate-spin h-10 w-10"
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
      {successMessage && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3"
          rounded
          mb-4
        >
          {successMessage}
        </div>
      )}
      <div className="flex flex-row gap-2">
        <button
          className="w-1/4 bg-blue-500 hover:bg-blue-700 text-white mb-4 rounded"
          onClick={openModal}
        >
          Create Profile
        </button>
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full p-2 mb-4 mr-2 border rounded"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-800 text-white">Name</th>
              <th className="border p-2 bg-gray-800 text-white">Email</th>
              <th className="border p-2 bg-gray-800 text-white">Role</th>
              <th className="border p-2 bg-gray-800 text-white">Status</th>
              <th className="border p-2 bg-gray-800 text-white">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-200"}
              >
                <td className="border p-2 font-bold">
                  {item.name.toUpperCase()}
                </td>
                <td className="border p-2">{item.email}</td>
                <td className="border p-2">
                  {item.role.join(", ").toUpperCase()}
                </td>
                <td className="border p-2">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      item.status === "active"
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    } capitalize`}
                  >
                    {item.status || "inactive"}
                  </span>
                </td>
                <td className="border p-2">
                  {/* Display Active/Inactive status with button */}
                  <button
                    onClick={() =>
                      handleStatusUpdate(
                        item.employeeId,
                        item.status || "inactive"
                      )
                    }
                    disabled={loadingButtonId === item.employeeId}
                    className={`${
                      item.status === "active" || item.status === undefined
                        ? "bg-red-500 hover:bg-red-700"
                        : "bg-green-500 hover:bg-green-700"
                      // } text-white font-bold py-2 px-4 rounded mr-2 text-sm`}
                    } text-white font-bold py-2 px-2 rounded mr-2 text-sm`}
                  >
                    {loadingButtonId === item.employeeId ? (
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
                    ) : item.status === "active" ? (
                      "Deactivate"
                    ) : (
                      "Activate"
                    )}
                  </button>
                  <button
                    onClick={() => handleEditProfile(item)}
                    // className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded px-2 py-1 text-sm"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded px-2 py-1 text-sm"
                  >
                    Edit
                  </button>
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
      <CreateProfileModal isOpen={isModalOpen} onRequestClose={closeModal} />
      <EditProfileModal
        isOpen={isEditModalOpen}
        onRequestClose={closeEditModal}
        editingItem={editingItem} // Pass the item being edited
        refreshTable={refreshTable}
      />
    </div>
  );
};

export default Staff;

// {(item.status === "active" || item.status === undefined) ? "Inactive" : "Active"}
