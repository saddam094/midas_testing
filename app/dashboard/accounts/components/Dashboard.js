"use client";
import React, {useEffect, useState} from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const Dashboard = () => {

  const [isDataLoading, setIsDataLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  const fetchData = async () => {
    setIsDataLoading(true);
    try {
      const response = await axios.get(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_account_dashboard"
      );
      const data = response.data["body-json"]["body"];
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

  const pieChartData1 = metrics?.totalProject
    ? {
        labels: ["Total project", "On hold", "Not started"],
        datasets: [
          {
            label: "Count",
            data: [
              metrics.totalProject,
              metrics.onHoldJobCount,
              metrics.notStartedJobCount,
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
  const pieChartData2 = metrics?.totalProject
    ? {
        labels: ["Not Started", "In Progress", "Completed", "On Hold"],
        datasets: [
          {
            label: "Count",
            data: [
              metrics.notStartedJobCount,
              metrics.inProgressJobCount,
              metrics.completeJobCount,
              metrics.onHoldJobCount,
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
    // <div className=" min-h-screen">
      <div className="p-2 flex flex-col rounded-lg shadow-md border border-gray-200 h-full">
          <h3 className="font-semibold text-gray-600">Accounts Job</h3>
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
            <div className="flex-grow flex flex-row items-center justify-center space-x-8">
  <div className="h-80 w-80 flex flex-col items-center justify-center">
    <Pie data={pieChartData1} />
    <h3 className="font-semibold text-gray-600 mt-4">Overall</h3>
  </div>
  <div className="h-80 w-80 flex flex-col items-center justify-center">
    <Pie data={pieChartData2} />
    <h3 className="font-semibold text-gray-600 mt-4">In-details</h3>
  </div>
</div>
          )}
        </div>
    // </div>
  );
};

export default Dashboard;
