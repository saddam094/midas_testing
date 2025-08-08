"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchData = async () => {
    setIsDataLoading(true);
    try {
      const response = await axios.get(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_admin_dashboard"
      );
      const data = response.data["body-json"]["body"];
      console.log(data);
      setMetrics(data);
      setIsDataLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const hanldeFilter = async () => {
    setIsChecking(true);
    try {
      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_admin_dashboard_filter",
        {
          fromDate,
          toDate,
        }
      );
      setMetrics(response.data["body-json"]["body"]);
    } catch (error) {
      console.error("Error fetching filtered Data: ", error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleClearFilters = () => {
    setFromDate("");
    setToDate("");
    fetchData();
  };

  // Prepare data for billing pie chart
  const pieChartData1 = metrics?.billing
    ? {
        labels: ["Done", "Partial", "No"],
        datasets: [
          {
            label: "Count",
            data: [
              metrics.billing.billingDone,
              metrics.billing.billingPartial,
              metrics.billing.billingNo,
            ],
            backgroundColor: ["#4285F4", "#FBBC03", "#EA4335"],
            hoverOffset: 4,
          },
        ],
      }
    : {
        labels: [],
        datasets: [],
      };

  // Prepare data for jobs pie chart (fixed data even without filter)
  const pieChartData2 = metrics?.jobCounts
    ? {
        labels: ["Not Started", "In Progress", "Completed", "On Hold"],
        datasets: [
          {
            label: "Count",
            data: [
              metrics.jobCounts.notStartedJobCount,
              metrics.jobCounts.inProgressJobCount,
              metrics.jobCounts.completeJobCount,
              metrics.jobCounts.onHoldJobCount,
            ],
            backgroundColor: ["#808080", "#4285F4", "#FBBC03", "#EA4335"],
            hoverOffset: 4,
          },
        ],
      }
    : {
        labels: [],
        datasets: [],
      };

  return (
    <div className="min-h-screen">
      <div className="flex flex-wrap pb-2 mb-6 sticky top-0 z-10 bg-white shadow-md">
        <div className="flex flex-row">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="p-2 mr-4 border rounded-lg"
          />
          <p className="p-2 mr-4">To</p>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="p-2 mr-4 border rounded-lg"
          />
        </div>
        <div className="flex flex-row">
          <button
            onClick={hanldeFilter}
            className="p-2 mr-4 bg-blue-500 text-white rounded"
          >
            {isChecking ? (
              <svg
                className="animate-spin  h-5 w-5 mx-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            ) : (
              `Check`
            )}
          </button>
          <button
            onClick={handleClearFilters}
            className="p-2 mr-4 rounded-lg underline text"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="grid gap-6 mb-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="min-w-0 p-4 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 mr-4 text-green-500 bg-green-100 rounded-full">
              <i className="fas fa-wallet"></i>
            </div>
            {isDataLoading ? (
              <svg
                className="animate-spin  h-10 w-10"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            ) : (
              <div>
                <p className="mb-2 text-sm font-medium text-gray-600">
                  Projects
                </p>
                <p className="text-lg font-semibold text-gray-700">
                  {metrics?.totalProject}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 mb-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="p-2 bg-white rounded-lg shadow-md border border-gray-200 h-full">
          <div className="mb-4 flex items-center justify-between text-lg">
            <h4 className="mb-2 font-semibold text-gray-600">Sales</h4>
            <p className="text-gray-600">₹ {metrics?.totalSales}</p>
          </div>
          <div className="w-full h-80 flex-grow">
            <div className="h-full border rounded-lg overflow-y-auto">
              <ul className="space-y-2">
                {metrics?.salesPerPerson &&
                  Object.entries(metrics?.salesPerPerson).map(
                    ([person, sales], index) => (
                      <li
                        key={index}
                        className="p-2 bg-white rounded-md shadow-sm hover:shadow-lg transition-shadow duration-300 flex justify-between"
                      >
                        <span>{person?.toUpperCase()}</span>
                        <span className="text-gray-500">₹ {sales}</span>
                      </li>
                    )
                  )}
              </ul>
            </div>
          </div>
        </div>

        <div className="p-2 flex flex-col rounded-lg shadow-md border border-gray-200 h-full">
          <h3 className="font-semibold text-gray-600">Jobs</h3>
          {isDataLoading ? (
            <svg
              className="animate-spin  h-10 w-10"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          ) : (
            <div className="flex-grow flex items-center justify-center">
              <Pie data={pieChartData2} />
            </div>
          )}
        </div>

        <div className="p-2 flex flex-col rounded-lg shadow-md border border-gray-200 h-full">
          <h3 className="font-semibold text-gray-600">Billing</h3>
          {isDataLoading ? (
            <svg
              className="animate-spin  h-10 w-10"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          ) : (
            <div className="flex-grow flex items-center justify-center">
              <Pie data={pieChartData1} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
