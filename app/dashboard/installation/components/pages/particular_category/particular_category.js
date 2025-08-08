"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ParticularJob from "../particular_job/particular_job";

const ParticularCategory = () => {
  const [completedJob, setCompletedJob] = useState([]);
  const [lastKey, setLastKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoadMore, setIsLoadMore] = useState(true);
  const [loadingLoadMore, setLoadingLoadMore] = useState(false);

  const [jobId, setJobId] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Load More Jobs
  const loadMoreCompletedJob = useCallback(async (lastKeyParam) => {
    setLoadingLoadMore(true);
    try {
      const data = {
        status: "complete",
        limit: 5,
        lastKey: lastKeyParam,
      };
      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_installation_job_filter",
        data
      );
      const body = response.data["body-json"]["body"];

      if (response.data && response.data["body-json"].statusCode === 200) {
        const fetchedJobs = body["detailedJobs"] || [];
        const fetchedLastKey = body["lastKey"] || null;

        setCompletedJob((prev) => [...prev, ...fetchedJobs]);
        setLastKey(fetchedLastKey);

        if (fetchedLastKey === null) {
          setIsLoadMore(false);
        }

        if (fetchedJobs.length === 0 && fetchedLastKey) {
          loadMoreCompletedJob(fetchedLastKey);
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

  // Initial Fetch
  const fetchCompletedJob = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = { status: "complete", limit: 5, lastKey: "" };
      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_installation_job_filter",
        data
      );
      const body = response.data["body-json"]["body"];

      if (response.data && response.data["body-json"].statusCode === 200) {
        const fetchedJobs = body["detailedJobs"] || [];
        const fetchedLastKey = body["lastKey"] || null;

        setCompletedJob(fetchedJobs);
        setLastKey(fetchedLastKey);

        if (fetchedJobs.length === 0 && fetchedLastKey) {
          await loadMoreCompletedJob(fetchedLastKey);
        }
      } else {
        throw new Error("Failed to fetch recent jobs");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loadMoreCompletedJob]);

  useEffect(() => {
    if (completedJob.length === 0) {
      fetchCompletedJob();
    }
  }, [completedJob.length, fetchCompletedJob]);

  if (loading)
    return (
      <div className="pt-24">
        <p className="text-center">Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="pt-24">
        <p className="text-center text-red-500">Error: {error}</p>
      </div>
    );

  return (
    <div className="px-4 pt-10 sm:px-10">
      
      {/* Job List */}
      <div className="space-y-2 pb-6">
        {completedJob.length === 0 ? (
          <center>No Completed Job Available</center>
        ) : (
          completedJob.map((job) => (
          
              <div className="rounded-lg border border-cyan-700 p-2 shadow-sm bg-gray-50 mb-2 cursor-pointer"
              key={job["jobId"]}
              onClick={() => {
                setJobId(job["jobId"]);
                setShowModal(true);
              }}
              >
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

      {/* Load More */}
      {isLoadMore && (
        <center>
          <button
            className="h-10 w-40 bg-blue-700 font-serif py-2 rounded text-white"
            onClick={() => loadMoreCompletedJob(lastKey)}
          >
            {loadingLoadMore ? "loading..." : "Load More"}
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
  );
};

export default ParticularCategory;