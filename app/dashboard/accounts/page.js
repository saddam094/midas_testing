"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaArrowCircleRight, FaArrowCircleLeft } from "react-icons/fa";
import ProtectedRoute from "../../components/ProtectedRoute";
import Projects from "./components/Projects";
import InstallationProjects from "./components/installation_projects";
import ProductionProjects from "./components/production_projects";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("from_production_job");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "accounts") {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/");
  };

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "from_production_job":
        return <ProductionProjects />;
      case "from_installation":
        return <InstallationProjects />;
      case "direct_job":
        return <Projects />;
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden ">
        <div className="fixed top-0 left-0 flex items-center p-4 bg-white w-full md:hidden">
          <button className="mr-4" onClick={toggleDrawer}>
            ☰
          </button>
          <div>
            <span className="text-xl font-bold">Midas Touch Creations</span>
            <p className="text-gray-500 text-sm">Accounts</p>
          </div>
        </div>
        <div
          className={`fixed inset-y-0 left-0 transform z-[1000] ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } md:relative md:translate-x-0 transition-transform duration-200 ease-in-out bg-white text-gray-700 w-64 h-full`}
        >
          <nav className="flex flex-col p-4 h-full border-r border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-md font-bold">Midas Touch Creations</span>
                <p className="text-gray-500 text-sm">Accounts</p>
              </div>
              <button className="md:hidden" onClick={toggleDrawer}>
                ✕
              </button>
            </div>
            <div className="flex-grow ">
              <button
                className={`block w-full text-left p-2 ${
                  activeTab === "from_production_job"
                    ? "bg-gray-700 rounded text-white"
                    : ""
                }`}
                onClick={() => setActiveTab("from_production_job")}
              >
                <div className="flex items-center">
                  Production&nbsp;
                  <FaArrowCircleRight /> &nbsp;Installation
                </div>
              </button>
              <button
                className={`block w-full text-left p-2 ${
                  activeTab === "from_installation"
                    ? "bg-gray-700 rounded text-white"
                    : ""
                }`}
                onClick={() => setActiveTab("from_installation")}
              >
                <div className="flex items-center">
                  Installation &nbsp; <FaArrowCircleLeft />
                </div>
              </button>
              <button
                className={`block w-full text-left p-2 ${
                  activeTab === "direct_job"
                    ? "bg-gray-700 rounded text-white"
                    : ""
                }`}
                onClick={() => setActiveTab("direct_job")}
              >
                Direct Jobs
              </button>
            </div>
            <div className="mt-auto">
              <button
                className="block w-full text-left text-white p-2 bg-red-600 hover:bg-red-700 rounded"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
        <div className="flex-1 p-4 overflow-auto mt-12 md:mt-0">
          {renderContent()}
        </div>
      </div>
    </ProtectedRoute>
  );
}
