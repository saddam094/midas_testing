"use client";
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { FaPlusCircle, FaMinusCircle } from "react-icons/fa";

const CreateProjectModal = ({ isOpen, onRequestClose }) => {
  const [creating, setCreating] = useState(false);
  const [poReceivingDate, setPoReceivingDate] = useState(null);
  const [receivingDate, setReceivingDate] = useState(null);
  const [deadlineDate, setDeadlineDate] = useState(null);
  const [salesPersonList, setSalesPersonList] = useState([]);
  const [showAlternatePhone, setShowAlternatePhone] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [token, setToken] = useState(null);
  const [fileName, setFileName] = useState("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");

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
    pdf: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setToken(token);
    if (token) {
      const decodedToken = jwtDecode(token);
      setFormData((prevState) => ({
        ...prevState,
        projectCoordinatorId: decodedToken.employeeId,
      }));
    }

    Modal.setAppElement(document.getElementById("__next"));
    fetchSalesPersonList();
  }, []);

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

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setFileName(file.name);
      await presignedUrlMethod(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const presignedUrlMethod = async (file) => {
    try {
      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_po_upload_presigned",
        { fileName: [file.name] }
      );

      console.log("PresignedURL: ", response.data);

      const presignedUrl = response.data["body-json"]["body"][0];
      console.log("Presigned URL: ", presignedUrl);

      await uploadFile(file, presignedUrl);
    } catch (error) {
      console.error(error);
    }
  };

  const uploadFile = async (file, presignedUrl) => {
    try {
      const response = await axios.put(presignedUrl, file, {
        headers: { "Content-Type": "application/pdf" },
      });

      console.log("PUT REsponse:: ", response);
      setUploadedFileUrl(presignedUrl.split("?")[0]);

      if (response.status === 200) {
        const croppedUrl = presignedUrl.split("?")[0];
        setUploadedFileUrl(croppedUrl);
        console.log("uploaded file url: ", croppedUrl);

        setFormData((prevState) => ({
          ...prevState,
          pdf: croppedUrl,
        }));
      }
    } catch (error) {
      console.error("Error uploading file: ", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validation state for errors
    const updatedErrors = {};

    if (name.startsWith("contactPerson")) {
      const field = name.split(".")[1];
      setFormData((prevState) => ({
        ...prevState,
        contactPerson: { ...prevState.contactPerson, [field]: value },
      }));

      // Validate phone number if the field is "phone"
      if (field === "phone" || field === "alternatePhone") {
        const phoneRegex = /^\d{10}$/;

        if (value === "") {
          // Clear error when the input is empty
          delete updatedErrors.phone;
        } else if (!phoneRegex.test(value)) {
          // Add error if the value doesn't match 10 digits
          updatedErrors.phone = "Phone number must be 10 digits.";
        } else {
          // Clear error if the value is valid
          delete updatedErrors.phone;
        }
      }
    } else if (name.startsWith("referenceNo")) {
      const field = name.split(".")[1];
      setFormData((prevState) => ({
        ...prevState,
        referenceNo: { ...prevState.referenceNo, [field]: value },
      }));
    } else {
      setFormData((prevState) => ({ ...prevState, [name]: value }));
    }

    // Update the errors state
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors, ...updatedErrors };
      if (!updatedErrors.phone) {
        delete newErrors.phone;
      }
      return newErrors;
    });
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
  };

  const handleDeadlineDateChange = (date) => {
    setDeadlineDate(date);
    setFormData((prevState) => ({
      ...prevState,
      deadlineDate: date.toLocaleDateString("en-GB"),
    }));
  };

  const handleSubmit = async (e) => {
    console.log("formData");
    console.log(formData);
    e.preventDefault();
    setCreating(true);
    try {
      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_create_project",
        formData
      );
      setMessage("Project created successfully!");
      setFormData({
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
        pdf: "",
      });
      console.log(response.data);

      setCreating(false);
      setTimeout(() => {
        onRequestClose();
        setMessage("");
      }, 500);
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
            <label className="block text-gray-700">Contact Person Email</label>
            <input
              type="email"
              name="contactPerson.email"
              value={formData.contactPerson.email}
              onChange={(e) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(e.target.value)) {
                  setErrors((prev) => ({
                    ...prev,
                    email: "Invalid email format.",
                  }));
                } else {
                  setErrors((prev) => ({
                    ...prev,
                    email: null,
                  }));
                }
                handleChange(e);
              }}
              className="w-full p-2 border rounded"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          <div className="mb-4 flex items-center">
            <label className="block text-gray-700 w-1/2">Phone</label>
            <input
              type="text"
              name="contactPerson.phone"
              value={formData.contactPerson.phone}
              onChange={(e) => {
                const phoneRegex = /^[0-9]{10}$/;
                if (!phoneRegex.test(e.target.value)) {
                  setErrors((prev) => ({
                    ...prev,
                    phone: "Phone number must be 10 digits.",
                  }));
                } else {
                  setErrors((prev) => ({
                    ...prev,
                    phone: null,
                  }));
                }
                handleChange(e);
              }}
              className="flex-grow p-2 border rounded"
              required
            />
            <button
              type="button"
              onClick={() => setShowAlternatePhone(!showAlternatePhone)}
              className="ml-2 text-blue-500"
            >
              {showAlternatePhone ? <FaMinusCircle /> : <FaPlusCircle />}
            </button>
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone}</p>
            )}
          </div>

          {showAlternatePhone && (
            <div className="mb-4">
              <label className="block text-gray-700">Alternate Phone</label>
              <input
                type="text"
                name="contactPerson.alternatePhone"
                value={formData.contactPerson.alternatePhone}
                onChange={(e) => {
                  const phoneRegex = /^[0-9]{10}$/;
                  if (!phoneRegex.test(e.target.value)) {
                    setErrors((prev) => ({
                      ...prev,
                      alternatePhone:
                        "Alternate phone number must be 10 digits.",
                    }));
                  } else {
                    setErrors((prev) => ({
                      ...prev,
                      alternatePhone: null,
                    }));
                  }
                  handleChange(e);
                }}
                className="w-full p-2 border rounded"
              />
              {errors.alternatePhone && (
                <p className="text-red-500 text-sm">{errors.alternatePhone}</p>
              )}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700">Project Value</label>
            <input
              type="text"
              name="projectValue"
              value={formData.projectValue}
              onChange={(e) => {
                const valueRegex = /^[0-9]+$/;
                if (!valueRegex.test(e.target.value)) {
                  setErrors((prev) => ({
                    ...prev,
                    projectValue: "Project value must be a number.",
                  }));
                } else {
                  setErrors((prev) => ({
                    ...prev,
                    projectValue: null,
                  }));
                }
                handleChange(e);
              }}
              className="w-full p-2 border rounded"
              required
            />
            {errors.projectValue && (
              <p className="text-red-500 text-sm">{errors.projectValue}</p>
            )}
          </div>

          {/* Remaining Fields */}
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

          {/* Confirmation By */}
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
            <label className="block text-gray-700">Ref. Number</label>
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
            <label className="block text-gray-700">PO Doc</label>
            {uploading ? (
              <p>Loading...</p>
            ) : (
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="w-full p-2 border rounded"
              />
            )}
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
