import React, { useState, useEffect } from "react";

const EditModal = ({ isOpen, onRequestClose, onSubmit, project }) => {
  const [editData, setEditData] = useState({
    projectName: "",
    projectCoordinator: "",
    receivingDate: "",
    deadline: "",
    status: "",
  });

  useEffect(() => {
    if (project) {
      setEditData({
        projectName: project.projectName,
        projectCoordinator: project.projectCoordinator,
        receivingDate: project.receivingDate,
        deadline: project.deadline,
        status: project.status,
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(editData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Edit Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Project Name</label>
            <input
              type="text"
              name="projectName"
              value={editData.projectName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Project Coordinator</label>
            <input
              type="text"
              name="projectCoordinator"
              value={editData.projectCoordinator}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Receiving Date</label>
            <input
              type="date"
              name="receivingDate"
              value={editData.receivingDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Deadline</label>
            <input
              type="date"
              name="deadline"
              value={editData.deadline}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Status</label>
            <select
              name="status"
              value={editData.status}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="started">Started</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onRequestClose}
              className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
