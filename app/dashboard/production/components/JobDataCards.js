import React from "react";

const JobDataCards = () => {
  const jobData = [
    {
      status: "In production",
      jobCount: 10,
    },

    {
      status: "Not started",
      jobCount: 5,
    },
  ];

  return (
    <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
      {jobData.map((job, index) => (
        <div
          key={index}
          className="min-w-0 p-3 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div
              className={`px-2 py-1 mr-4 text-${
                index % 2 === 0 ? "green" : "red"
              }-500 bg-${index % 2 === 0 ? "green" : "red"}-100 rounded-xl`}
            >
              <i className="fas fa-project-diagram">{job.jobCount}</i>
            </div>
            <div>
              <p className=" text-md font-medium text-gray-600">{job.status}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobDataCards;
