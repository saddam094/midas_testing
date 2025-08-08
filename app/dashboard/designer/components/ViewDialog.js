import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import PropTypes from "prop-types";
import axios from "axios";

const ViewDialog = ({ isOpen, onClose, project }) => {
  const [jobList, setJobList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && project?.projectId) {
      fetchJobList();
    }
  }, [isOpen, project]);
  // console.log("This is the demo data", project);

  const fetchJobList = async () => {
    try {
      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_particular_project_all_jobs",
        {
          projectId: project.projectId,
        }
      );
      const data = response.data["body"];
      if (Array.isArray(data)) {
        setJobList(data);
      } else {
        setJobList([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching job list:", error);
      setJobList([]);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      contentLabel="Project Details"
    >
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-4xl mx-auto flex flex-col h-full max-h-full relative">
        <div className="flex flex-col md:flex-row flex-grow">
          {/* Project Details */}
          <div className="flex-grow md:w-1/2 flex flex-col relative mb-4 md:mb-0">
            <div className="flex-grow">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Project Details
              </h2>
              <div className="mb-4">
                <strong className="text-gray-700">Project Name:</strong>{" "}
                <span className="text-gray-600">{project.projectName}</span>
              </div>
              <div className="mb-4">
                <strong className="text-gray-700">Sales Person:</strong>{" "}
                <span className="text-gray-600">{project.salesPerson}</span>
              </div>
              <div className="mb-4">
                <strong className="text-gray-700">Confirmation By:</strong>{" "}
                <span className="text-gray-600">{project.confirmationBy}</span>
              </div>
              <div className="mb-4">
                <strong className="text-gray-700">Date:</strong>{" "}
                <span className="text-gray-600">{project.date}</span>
              </div>
              <div className="mb-4">
                <strong className="text-gray-700">Status:</strong>{" "}
                <span className="text-gray-600">{project.status}</span>
              </div>
              <div className="mb-4">
                <strong className="text-gray-700">Project Coordinator:</strong>{" "}
                <span className="text-gray-600">
                  {project.projectCoordinator}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Job List */}
        <div className="mt-2 flex flex-col flex-grow overflow-auto">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Job List</h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="max-h-60 overflow-y-auto">
                <table className="min-w-full bg-white border border-gray-300">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Project Name</th>
                      <th className="py-2 px-4 border-b">Designer Names</th>
                      <th className="py-2 px-4 border-b">Deadline</th>
                      <th className="py-2 px-4 border-b">Designer Id</th>
                      <th className="py-2 px-4 border-b">Created By</th>
                      <th className="py-2 px-4 border-b">
                        Project Creation Date
                      </th>
                      <th className="py-2 px-4 border-b">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobList.length > 0 ? (
                      jobList.map((job) => (
                        <tr key={job.projectId}>
                          <td className="py-2 px-4 border-b">
                            {job.projectName}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {job.designerNames}
                          </td>
                          <td className="py-2 px-4 border-b">{job.deadline}</td>
                          <td className="py-2 px-4 border-b">
                            {job.designerId}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {job.createdBy}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {job.projectCreationDate}
                          </td>
                          <td className="py-2 px-4 border-b">{job.status}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="py-2 px-4 border-b text-center"
                        >
                          No jobs available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-300 ease-in-out"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

ViewDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  project: PropTypes.shape({
    projectId: PropTypes.string.isRequired,
    projectName: PropTypes.string.isRequired,
    salesPerson: PropTypes.string.isRequired,
    confirmationBy: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    projectCoordinator: PropTypes.string.isRequired,
  }).isRequired,
};

export default ViewDialog;
