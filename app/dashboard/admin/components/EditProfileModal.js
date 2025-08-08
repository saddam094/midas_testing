import React, { useState, useEffect } from "react";
import axios from "axios";

const EditProfileModal = ({
  isOpen,
  onRequestClose,
  editingItem,
  refreshTable,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    email: "",
    phone: "",
    address: "",
    roles: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const availableRoles = [
    "Sales",
    "project_coordinator",
    "Designer",
    "Production",
    "Accounts",
    "Installation",
  ];

  // When the modal opens or the editing item changes, update the form data
  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name || "",
        shortName: editingItem.shortName || "",
        email: editingItem.email || "",
        phone: editingItem.phone || "",
        address: editingItem.address || "",
        roles: editingItem.role || [],
      });
    }
  }, [editingItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRoleChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prevData) => ({
      ...prevData,
      roles: selectedOptions,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Construct the payload to be sent to the API
    const updatePayload = {
      employeeId: editingItem.employeeId,
      address: formData.address,
      department: "Engineering",
      email: formData.email,
      jobTitle: "Senior Developer",
      name: formData.name,
      phone: formData.phone,
      shortName: formData.shortName,
      role: formData.roles,
    };

    try {
      const response = await axios.put(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_staff_profile_update",
        updatePayload
      );

      // Handle successful response
      if (response.status === 200) {
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => {
          setSuccessMessage("");
          onRequestClose();
          refreshTable();
        }, 100);
      }
    } catch (error) {
      // Handle error response
      console.error("Error updating profile:", error);
      setErrorMessage("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50"
      onClick={onRequestClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-96"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
        {successMessage && (
          <div className="mb-4 p-2 text-green-700 bg-green-100 border border-green-400 rounded">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 p-2 text-red-700 bg-red-100 border border-red-400 rounded">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 mt-1 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="shortName"
              className="block text-sm font-medium text-gray-700"
            >
              Short Name
            </label>
            <input
              type="text"
              id="shortName"
              name="shortName"
              value={formData.shortName}
              onChange={handleChange}
              className="w-full p-2 mt-1 border rounded"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 mt-1 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 mt-1 border rounded"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 mt-1 border rounded"
              rows="3"
            ></textarea>
          </div>

          <div className="mb-4">
            <label
              htmlFor="roles"
              className="block text-sm font-medium text-gray-700"
            >
              Roles
            </label>
            <select
              id="roles"
              name="roles"
              multiple
              value={formData.roles}
              onChange={handleRoleChange}
              className="w-full p-2 mt-1 border rounded"
            >
              {availableRoles.map((role, index) => (
                <option key={index} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <small className="text-gray-500">
              Select multiple roles by holding Ctrl or Command
            </small>
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onRequestClose}
              className="mr-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
