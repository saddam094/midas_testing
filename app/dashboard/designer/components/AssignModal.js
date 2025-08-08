import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";

const AssignModal = ({ isOpen, onClose, project, onAssignComplete }) => {
  const [designers, setDesigners] = useState([]);
  const [selectedDesigner, setSelectedDesigner] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDesigners = async () => {
      try {
        const response = await axios.get(
          "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_designer_name"
        );
        if(response.data["body-json"]['statusCode']==200){
        const data = response.data["body-json"]["body"]; // Adjust according to actual API response structure
        if (
          Array.isArray(data) &&
          data.every((designer) => designer.id && designer.name)
        ) {
          setDesigners(data);
        } else {
          console.error("Unexpected response format for designers.");
        }
      }
      } catch (error) {
        console.error("Error fetching designers:", error);
        setError("Failed to fetch designers.");
      }
    };

    if (isOpen) {
      fetchDesigners();
    }
  }, [isOpen]);

  const handleAssign = async () => {
    if (!selectedDesigner) {
      alert("Please select a designer.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_particular_projects_assign_designer",
        {
          projectId: project.projectId,
          designerId: selectedDesigner,
        }
      );
      if(response.data["body-json"]['statusCode']==200){
      alert("Designer assigned successfully!");
      onAssignComplete(); // Call the onAssignComplete function passed as a prop
      onClose(); // Close the modal after assigning
    }else {
        onClose(); // Close the modal after assigning
        setError("Failed to assign designer. Please try again.");
      }
    } catch (error) {
      console.error("Error assigning designer:", error);
      setError("Failed to assign designer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 ${
        isOpen ? "block" : "hidden"
      }`}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Assign Designer</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label
            htmlFor="designer"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select Designer
          </label>
          <select
            id="designer"
            value={selectedDesigner}
            onChange={(e) => setSelectedDesigner(e.target.value)}
            className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select a designer</option>
            {designers.length > 0 ? (
              designers.map((designer) => (
                <option key={designer.id} value={designer.id}>
                  {designer.name}
                </option>
              ))
            ) : (
              <option value="">No designers available</option>
            )}
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={loading}
            className={`bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition ${
              loading ? "bg-blue-300 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Assigning..." : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
};

AssignModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  project: PropTypes.shape({
    projectId: PropTypes.string.isRequired,
  }).isRequired,
  onAssignComplete: PropTypes.func.isRequired,
};

export default AssignModal;
