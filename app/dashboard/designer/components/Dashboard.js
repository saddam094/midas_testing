"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = () => {
  const [jobStatusData, setJobStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);
  const [token, setToken] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const id = localStorage.getItem("employeeId");
  const tokenId = localStorage.getItem("token");

  useEffect(() => {
    if (id) {
      setEmployeeId(id);
    } else {
      console.error("Employee ID not found. Please log in.");
    }
    if (tokenId) {
      setToken(tokenId);
    } else {
      console.error("Token not found. Please log in.");
    }
  }, []);

  // Fetch Job Status Data
  const fetchJobStatusData = async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/designer_total_job_status_wise",
        { staffId: employeeId },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data["body-json"].statusCode === 200) {
        const jobData = response.data["body-json"].body;
        setJobStatusData(jobData);
      }
    } catch (error) {
      console.error("Error fetching job status data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobStatusData();
  }, [employeeId]);

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_particular_designer_job_notification",
        {
          designerId: id,
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      const notificationData = response.data["body-json"]["body"];
      console.log("NOTI:: ", notificationData);

      setNotifications(notificationData);
      const unreadNotifications = notificationData.filter(
        (notification) => !notification.isRead
      );
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications(); // Fetch notifications on component mount
  }, [employeeId]);

  // Handle Mark Notification as Read
  const markAsRead = async (jobId) => {
    try {
      await axios.put(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_particular_designer_notification_seen",
        {
          jobId,
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.jobId === jobId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount((prevCount) => prevCount - 1);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="">
          <div className="p-4 bg-white rounded-lg border border-gray-200 h-full">
            {loading ? (
              <p>Loading...</p>
            ) : jobStatusData ? (
              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex gap-5">
                  <p className="font-bold text-gray-700">
                    <span className="text-blue-500">On Hold:</span>{" "}
                    {jobStatusData.on_hold}
                  </p>
                  <p className="font-bold text-gray-700">
                    <span className="text-yellow-500">In Progress:</span>{" "}
                    {jobStatusData.in_process}
                  </p>
                </div>
                <div className="flex  gap-5">
                  <p className="font-bold text-gray-700">
                    <span className="text-red-500">Not Started:</span>{" "}
                    {jobStatusData.not_started}
                  </p>
                  <p className="font-bold text-gray-700">
                    <span className="text-green-500">Completed:</span>{" "}
                    {jobStatusData.complete}
                  </p>
                </div>
              </div>
            ) : (
              <p>No Data Available</p>
            )}
          </div>
        </div>
      </div>

      {/* Notification Icon */}
      <div className="fixed top-4 right-4 z-20">
        <button onClick={() => setIsModalOpen(!isModalOpen)}>
          <img
            src="/bell.png"
            alt="Notifications"
            className="w-6 h-6 text-yellow-500"
          />
          {unreadCount > 0 && (
            <span className="absolute top-[-8px] right-[-8px] transform -translate-x-1/2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-red-100 bg-red-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notification Modal */}
      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 z-30 flex justify-center items-center">
          <div className="bg-white p-4 rounded-lg shadow-md w-80">
            <h2 className="text-lg font-semibold mb-4">Notifications</h2>
            {notifications.length === 0 ? (
              <p>No notifications available.</p>
            ) : (
              <ul className="max-h-60 overflow-y-auto">
                {notifications.map((notification) => (
                  <li
                    key={notification.jobId}
                    className={`p-2 mb-2 rounded ${
                      notification.isRead
                        ? "bg-gray-100"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    <p className="font-semibold">
                      {notification.jobName.toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {notification.projectName} - {notification.date}
                    </p>
                    <p className="text-sm text-gray-500">
                      Deadline: {notification.deadline}
                    </p>
                    {!notification.isRead && (
                      <button
                        className="text-blue-600 underline mt-1"
                        onClick={() => markAsRead(notification.jobId)}
                      >
                        Mark as Read
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <button
              className="mt-4 text-blue-600"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
