"use client";
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

const CreateProjectModal = ({ isOpen, onRequestClose }) => {
  const [creating, setCreating] = useState(false);
  const [poReceivingDate, setPoReceivingDate] = useState(null);

  const [formData, setFormData] = useState({
    projectName: "",
    salesPerson: "",
    contactPerson: {
      name: "",
      phone: "",
      value: "",
    },
    confirmationBy: "",
    projectCoordinatorId: "",
    creatorRole: "admin",
    creatorEmail: "creationsmidastouch@gmail.com",
    referenceNo: {
      poNumber: "",
      poReceivingDate: "",
    },
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    Modal.setAppElement(document.getElementById("__next"));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("contactPerson")) {
      const field = name.split(".")[1];
      setFormData((prevState) => ({
        ...prevState,
        contactPerson: { ...prevState.contactPerson, [field]: value },
      }));
    } else if (name.startsWith("referenceNo")) {
      const field = name.split(".")[1];
      setFormData((prevState) => ({
        ...prevState,
        referenceNo: { ...prevState.referenceNo, [field]: value },
      }));
    } else {
      setFormData((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  const handleDateChange = (date) => {
    setPoReceivingDate(date);
    setFormData((prevState) => ({
      ...prevState,
      referenceNo: {
        ...prevState.referenceNo,
        poReceivingDate: date.toLocaleDateString("en-GB"),
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_create_project",
        formData
      );
      setMessage("Project created successfully!");
      setCreating(false);
      setTimeout(() => {
        onRequestClose();
        setMessage("");
      }, 2000);
    } catch (error) {
      setMessage("Error creating project.");
      setCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} ariaHideApp={false}>
      <div className="p-4">
        <h2 className="text-xl mb-4">Create Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Project Name</label>
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Sales Person</label>
            <input
              type="text"
              name="salesPerson"
              value={formData.salesPerson}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Contact Person Name</label>
            <input
              type="text"
              name="contactPerson.name"
              value={formData.contactPerson.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Contact Person Phone</label>
            <input
              type="text"
              name="contactPerson.phone"
              value={formData.contactPerson.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Contact Person Value</label>
            <input
              type="text"
              name="contactPerson.value"
              value={formData.contactPerson.value}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Confirmation By</label>
            <select
              name="confirmationBy"
              value={formData.confirmationBy}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select An Option</option>
              <option value="email">Email</option>
              <option value="verbal">Verbal</option>
              <option value="po">PO</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">
              Project Coordinator ID
            </label>
            <input
              type="text"
              name="projectCoordinatorId"
              value={formData.projectCoordinatorId}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">PO Number</label>
            <input
              type="text"
              name="referenceNo.poNumber"
              value={formData.referenceNo.poNumber}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">PO Receiving Date</label>
            <DatePicker
              selected={poReceivingDate}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              className="w-full p-2 border rounded"
              required
            />
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

export default CreateProjectModal;
