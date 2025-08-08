// pages/projects/[projectId].jsx
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const ProjectDetails = () => {
  const router = useRouter();
  const { projectId } = router.query; // Get the projectId from the route
  const [projectDetails, setProjectDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) return;

      try {
        const response = await axios.post(
          "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_project_details", // Replace with the actual API endpoint
          {
            projectId: projectId,
          }
        );

        const project = response.data["body-json"]["body"]["project"];
        console.log("Fetched project details: ", project);
        setProjectDetails(project);
      } catch (error) {
        console.error("Error fetching project details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!projectDetails) {
    return <div>No project details found.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{projectDetails.projectName}</h1>
      <p>
        <strong>Sales Person:</strong> {projectDetails.salesPerson}
      </p>
      <p>
        <strong>Confirmation:</strong> {projectDetails.confirmationBy}
      </p>
      <p>
        <strong>Project Coordinator:</strong>{" "}
        {projectDetails.projectCoordinator}
      </p>
      <p>
        <strong>Status:</strong> {projectDetails.status}
      </p>
      {/* Display more project details as needed */}
    </div>
  );
};

export default ProjectDetails;
