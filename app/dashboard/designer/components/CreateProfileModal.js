"use client";
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";

const CreateProfileModal = ({ isOpen, onRequestClose }) => {
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    phone: "",
    email: "",
    creatorEmail: "admin@example.com",
    creatorRole: "admin",
    jobTitle: "Software Engineer",
    department: "Engineering",
    address: "",
    role: "designer",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    Modal.setAppElement(document.getElementById("__next"));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_staff_registration",
        formData
      );
      if(response.data['body-json']['StatusCode']==200){
         setMessage("Profile created successfully!");
        setCreating(false);
        setTimeout(() => {
          onRequestClose();
          setMessage("");
        }, 2000);
      }
    } catch (error) {
      setMessage("Error creating profile.");
      setCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} ariaHideApp={false}>
      <div className="p-4">
        <h2 className="text-xl mb-4">Create Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Short Name</label>
            <input
              type="text"
              name="shortName"
              value={formData.shortName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Job Title</label>
            <select
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="Software Engineer">Software Engineer</option>
              <option value="Designer">Designer</option>
              <option value="Accountant">Accountant</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="Engineering">Engineering</option>
              <option value="HR">HR</option>
              <option value="MBA">MBA</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="designer">Designer</option>
              <option value="engineer">Engineer</option>
            </select>
          </div>
          {message && (
            <div className="mb-4 text-center text-green-500">{message}</div>
          )}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onRequestClose}
              className="bg-gray-500 text-white py-2 px-4 rounded mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded"
            >
              {creating ? `Creating...` : `Create`}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateProfileModal;
