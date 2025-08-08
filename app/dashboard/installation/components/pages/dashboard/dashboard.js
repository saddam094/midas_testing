"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import ParticularJob from "../particular_job/particular_job";
import { useRouter } from "next/navigation";

export default function Dashboard() {

  const router = useRouter();

  const [jobId, setJobId] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [statusCount, setStatusCount] = useState({ complete: 0 });
  const [recentJob, setRecentJob] = useState([]);
  const [lastKey, setLastKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoadMore, setIsLoadMore] = useState(true);
  const [loadingLoadMore, setLoadingLoadMore] = useState(false);

  // Fetch status count
  const fetchData = async () => {
    try {
      const response = await axios.get(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_installation_statusWise_count"
      );
      const data = response.data["body-json"]["body"];
      setStatusCount({ complete: data["complete"] });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  // Load more jobs
  const loadMoreRecentJob = useCallback(async (lastKeyParam) => {
    setLoadingLoadMore(true);
    try {
      const data = { limit: 5, lastKey: lastKeyParam };
      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_installation_all_job_all_data",
        data
      );
      const body = response.data["body-json"]["body"];

      if (response.data && response.data["body-json"].statusCode === 200) {
        const fetchedJobs = body["detailedJobs"] || [];
        const fetchedLastKey = body["lastKey"] || null;

        setRecentJob((prev) => [...prev, ...fetchedJobs]);
        setLastKey(fetchedLastKey);

        if (fetchedLastKey === null) setIsLoadMore(false);

        if (fetchedJobs.length === 0 && fetchedLastKey) {
          loadMoreRecentJob(fetchedLastKey);
        }
      } else {
        setIsLoadMore(false);
      }
    } catch (err) {
      console.error("Error loading more jobs:", err);
      setError(err.message);
    } finally {
      setLoadingLoadMore(false);
    }
  }, []);

  // Initial fetch
  const fetchRecentJob = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = { limit: 5, lastKey: "" };
      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_installation_all_job_all_data",
        data
      );
      const body = response.data["body-json"]["body"];

      if (response.data && response.data["body-json"].statusCode === 200) {
        const fetchedJobs = body["detailedJobs"] || [];
        const fetchedLastKey = body["lastKey"] || null;

        setRecentJob(fetchedJobs);
        setLastKey(fetchedLastKey);

        if (fetchedJobs.length === 0 && fetchedLastKey) {
          await loadMoreRecentJob(fetchedLastKey);
        }
      } else {
        throw new Error("Failed to fetch recent jobs");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loadMoreRecentJob]);

  useEffect(() => {
    if (statusCount.complete === 0) fetchData();
    if (recentJob.length === 0) fetchRecentJob();
  }, [statusCount.complete, recentJob.length, fetchRecentJob]);


  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <>
      <div className="px-4 sm:px-10">
        {/* Completed Card */}
        {/* <div className="h-5" /> */}
        {/*<Link href="/particular_category">
        <div className="h-20 sm:h-24 w-full bg-green-500 rounded-lg shadow-lg flex items-center cursor-pointer">
          <div className="flex justify-between items-center w-full bg-white rounded-lg h-20 sm:h-24 ml-2 px-4 sm:px-6 md:px-10 border-2 shadow-sm">
            <DoneAllIcon className="text-green-600 text-xl sm:text-2xl" />
            <p className="text-sm sm:text-base md:text-lg font-serif text-center">
              Task <br className="block sm:hidden" /> Completed
            </p>
            <p className="text-sm sm:text-base md:text-lg font-serif text-blue-700">
              {statusCount.complete}
            </p>
          </div>
        </div>
      </Link>*/}

        {/* Recent Jobs */}
        <div className="h-5" />
        <p className="text-md sm:text-lg font-serif">Recent Job</p>
        <div className="h-5" />

        <div className="space-y-2 pb-6">
          {recentJob.length === 0 ? (
              <center>No Job Available</center>
          ) : (
            recentJob.map((job, index) => (
            
              <div className="rounded-lg border border-cyan-700 p-2 shadow-sm bg-gray-50 mb-2 cursor-pointer" 
              key={job["jobId"]}
              onClick={() => {
                setJobId(job["jobId"]);
                setShowModal(true);
              }}>
                <h3 className="text-sm sm:text-base font-semibold text-gray-700">
                  {job["jobName"]}
                </h3>
                <p className="text-xs sm:text-sm">
                  <span className="font-semibold">Received By:</span>{" "}
                  {job["receiveByName"]}
                </p>
                <p className="text-xs sm:text-sm">
                  <span className="font-semibold">Project:</span>{" "}
                  {job["projectName"]}
                </p>
                <p className="text-xs sm:text-sm">
                  <span className="font-semibold">Status:</span> {job["status"]}
                </p>
                <p className="text-xs sm:text-sm">
                  <span className="font-semibold">Received Date:</span>{" "}
                  {job["receiveDate"]}
                </p>
              </div>
            ))
          )}
        </div>

        {isLoadMore && (
          <center>
            <button
              className="h-10 w-40 bg-blue-700 font-serif py-2 rounded text-white"
              onClick={() => loadMoreRecentJob(lastKey)}
            >
              {loadingLoadMore ? "Loading..." : "Load More"}
            </button>
          </center>
        )}

        <div className="h-5" />

        {showModal && jobId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg relative max-h-[90vh] overflow-y-auto p-6 w-full sm:w-[90%] md:w-3/4">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
              >
                ✕
              </button>

              {/* Modal Content */}
              <ParticularJob jobId={jobId} closeModal={() => setShowModal(false)} />
            </div>
          </div>
        )}



      </div>
    </>
  );
};