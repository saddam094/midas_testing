import { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export default function HoldDialog({ isOpen, onClose, jobData }) {
  const [quotation, setQuotation] = useState(jobData?.quotation || "");

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    console.log(token);

    if (!token) {
      console.error("No token found!");
      return;
    }
    let decodedToken;
    try {
      decodedToken = jwtDecode(token);
      console.log(decodedToken);
    } catch (error) {
      console.error(error);
      return;
    }

    const payload = {
      ...jobData,
      quotation,
      id: decodedToken?.employeeId,
    };

    try {
      await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_project_coordinator_status_update",
        payload
      );
      onClose();
      //   refreshTable();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Put On Hold</h2>

        <p>
          <strong>Project ID:</strong> {jobData.id}
        </p>
        {/* <p>
          <strong>Status:</strong> {jobData.status}
        </p> */}
        <p>
          <strong>Job ID:</strong> {jobData.jobID}
        </p>

        <div className="mt-4">
          <label className="block font-medium mb-1">Quotation</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={quotation}
            onChange={(e) => setQuotation(e.target.value)}
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Put On Hold
          </button>
        </div>
      </div>
    </div>
  );
}
