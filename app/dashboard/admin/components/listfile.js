"use client";
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

const CreateProjectModal = ({ isOpen, onRequestClose }) => {
  const [creating, setCreating] = useState(false);
  const [poReceivingDate, setPoReceivingDate] = useState(null);
  const [receivingDate, setReceivingDate] = useState(null);
  const [deadlineDate, setDeadlineDate] = useState(null);
  const [coordinators, setCoordinators] = useState([]);
  const [salesPersonList, setSalesPersonList] = useState([]);
  const [showAlternatePhone, setShowAlternatePhone] = useState(false); // State for toggling alternate phone
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    projectName: "",
    salesPerson: "",
    contactPerson: {
      name: "",
      phone: "",
      alternatePhone: "",
      email: "",
    },
    receivingDate: "",
    deadlineDate: "",
    confirmationBy: "",
    projectCoordinatorId: "",
    creatorRole: "admin",
    creatorEmail: "creationsmidastouch@gmail.com",
    projectValue: "",
    referenceNo: {
      poNumber: "",
      poReceivingDate: "",
    },
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    Modal.setAppElement(document.getElementById("__next"));
    fetchCoordinators();
    fetchSalesPersonList();
  }, []);

  const fetchCoordinators = async () => {
    try {
      const response = await axios.get(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_project_coordinators_name"
      );
      setCoordinators(response.data["body-json"]["body"]);
    } catch (error) {
      console.error("Error fetching coordinators: ", error);
    }
  };

  const fetchSalesPersonList = async () => {
    try {
      const response = await axios.get(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_sales_person_names"
      );
      setSalesPersonList(response.data["body-json"]["body"]);
    } catch (error) {
      console.error("Error fetching salesperson list: ", error);
    }
  };

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

  const handleCoordinatorChange = (e) => {
    const selectedCoordinator = coordinators.find(
      (coordinator) => coordinator.name === e.target.value
    );
    setFormData((prevState) => ({
      ...prevState,
      projectCoordinatorId: selectedCoordinator?.id || "",
    }));
  };

  const handleSalesPerson = (e) => {
    const selectSalesPerson = salesPersonList.find(
      (salesPerson) => salesPerson.name === e.target.value
    );
    setFormData((prevState) => ({
      ...prevState,
      salesPerson: selectSalesPerson?.id || "",
    }));
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

  const handleReceivingDateChange = (date) => {
    setReceivingDate(date);
    setFormData((prevState) => ({
      ...prevState,
      receivingDate: date.toLocaleDateString("en-GB"),
    }));

    //PO Receiving Date code here for now, until SCHEMA changes
    setPoReceivingDate(date);
    setFormData((prevState) => ({
      ...prevState,
      referenceNo: {
        ...prevState.referenceNo,
        poReceivingDate: date.toLocaleDateString("en-GB"),
      },
    }));
  };
  const handleDeadlineDateChange = (date) => {
    setDeadlineDate(date);
    setFormData((prevState) => ({
      ...prevState,
      deadlineDate: date.toLocaleDateString("en-GB"),
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
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      ariaHideApp={false}
      style={{
        overlay: {
          zIndex: 1000,
          backgroundColor: "rgba(0, 0, 0, 0.75)",
        },
        content: {
          position: "absolute",
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1001,
          maxHeight: "90vh",
          overflowY: "auto",
          maxWidth: "500px",
          width: "100%",
          padding: "20px",
          borderRadius: "8px",
        },
      }}
    >
      <div className="p-4">
        <h2 className="text-xl mb-4">Add Project</h2>
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
            <select
              name="salesPerson"
              onChange={handleSalesPerson}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Sales Person</option>
              {salesPersonList.map((salesPerson) => (
                <option key={salesPerson.id} value={salesPerson.name}>
                  {salesPerson.name.toUpperCase()}
                </option>
              ))}
            </select>
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
            <label className="block text-gray-700">Valuation</label>
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
            <label className="block text-gray-700">Receiving Date</label>
            <DatePicker
              selected={receivingDate}
              onChange={handleReceivingDateChange}
              dateFormat="dd/MM/yyyy"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Deadline</label>
            <DatePicker
              selected={deadlineDate}
              onChange={handleDeadlineDateChange}
              dateFormat="dd/MM/yyyy"
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
            <label className="block text-gray-700">Project Coordinator</label>
            <select
              name="projectCoordinatorId"
              onChange={handleCoordinatorChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Coordinator</option>
              {coordinators.map((coordinator) => (
                <option key={coordinator.id} value={coordinator.name}>
                  {coordinator.name.toUpperCase()}
                </option>
              ))}
            </select>
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
          {/* <div className="mb-4">
            <label className="block text-gray-700">PO Receiving Date</label>
            <DatePicker
              selected={poReceivingDate}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              className="w-full p-2 border rounded"
              required
            />
          </div> */}
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
