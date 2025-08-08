"use client";
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import SuccessModal from "./SuccessModal";
import CopyIcon from "../../../assets/images/icons8-copy-90.png";
import Image from "next/image";

const CreateProfileModal = ({ isOpen, onRequestClose }) => {
  const [creating, setCreating] = useState(false);
  const [responseEmail, setResponseEmail] = useState("");
  const [responsePassword, setResponsePassword] = useState("");
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // For error messages

  const initialFormData = {
    name: "",
    shortName: "",
    phone: "",
    email: "",
    creatorEmail: "admin@example.com",
    creatorRole: "admin",
    address: "",
    role: [],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [message, setMessage] = useState(""); // For success message
  const rolesOptions = [
    "sales",
    "project_coordinator",
    "designer",
    "production",
    "accounts",
    "installation",
  ];

  useEffect(() => {
    Modal.setAppElement(document.getElementById("__next"));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      const autoShortName = generateShortName(value);
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
        shortName: autoShortName,
      }));
    } else {
      setFormData((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    if (selectedRole && !formData.role.includes(selectedRole)) {
      setFormData((prevState) => ({
        ...prevState,
        role: [...prevState.role, selectedRole],
      }));
    }
    e.target.value = "";
  };

  const handleRemoveRole = (roleToRemove) => {
    setFormData((prevState) => ({
      ...prevState,
      role: prevState.role.filter((role) => role !== roleToRemove),
    }));
  };

  const generateShortName = (fullName) => {
    const words = fullName.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].slice(0, 3).toUpperCase();
    }

    const first = words[0][0] || "";
    const last = words[words.length - 1].slice(0, 2) || "";

    return (first + last).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setErrorMessage("");

    try {
      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_staff_registration",
        formData
      );

      if (response.data["body-json"].statusCode === 400) {
        setErrorMessage("Error: User with the given Email already exists.");
        setCreating(false);
        return;
      }

      const { email, password } = response.data["body-json"]["body"];
      const combinedMessage = `Email: ${email}\nPassword: ${password}`;

      setMessage(combinedMessage);
      setResponseEmail(email);
      setResponsePassword(password);
      setIsSuccessOpen(true);

      setFormData(initialFormData);
      setCreating(false);
    } catch (error) {
      setErrorMessage("Error creating profile.");
      setCreating(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = `Email: ${responseEmail}\nPassword: ${responsePassword}`;
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        alert("Email and password copied to clipboard!");
      },
      (err) => {
        alert("Failed to copy text: ", err);
      }
    );
  };

  return (
    <>
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
              <div className="flex items-center space-x-2 mb-2">
                <select
                  onChange={handleRoleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Role</option>
                  {rolesOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap space-x-2 space-y-2">
                {formData.role.map((role) => (
                  <div
                    key={role}
                    className="flex items-center bg-gray-200 rounded px-2 py-1"
                  >
                    <span>{role}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(role)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Show error message if there's any */}
            {errorMessage && (
              <div className="mb-4 text-center text-red-600 font-bold">
                {errorMessage}
              </div>
            )}

            {message && (
              <div className="mb-4 text-center whitespace-pre-line flex flex-col justify-center">
                <p className="text-lg text-green-600 font-bold">
                  Profile Created Successfully
                </p>
                <div className="flex flex-row justify-center">
                  {message}
                  <button
                    onClick={handleCopy}
                    className="text-white py-1 px-2 ml-2 rounded"
                  >
                    <Image src={CopyIcon} height={40} width={40} />
                  </button>
                </div>
              </div>
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
      <SuccessModal
        isOpen={isSuccessOpen}
        onRequestClose={() => setIsSuccessOpen(false)}
        email={responseEmail}
        password={responsePassword}
      />
    </>
  );
};

export default CreateProfileModal;
