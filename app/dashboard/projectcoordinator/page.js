"use client";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Projects from "./components/Projects";
import Dashboard from "./components/Dashboard";
import DirectJobDesigner from "./components/direct_designer_job";

export default function ProjectControllerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("projects");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "project_coordinator") {
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

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "projects":
        return <Projects />;
      case "direct_designer":
        return <DirectJobDesigner />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="fixed top-0 left-0 flex items-center p-4 bg-white w-full md:hidden">
        <button className="mr-4" onClick={toggleDrawer}>
          ☰
        </button>
        <span>Midas Touch Creations</span>
      </div>
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition-transform duration-200 ease-in-out bg-white text-gray-700 w-64 h-full z-50`}
      >
        <nav className="flex flex-col p-4 h-full border-r border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col">
              <span className="text-xl font-bold">Midas Touch</span>
              <p className="text-gray-400">Project Coordinator</p>
            </div>

            <button className="md:hidden" onClick={toggleDrawer}>
              ✕
            </button>
          </div>
          <div className="flex-grow">
            <button
              className={`block w-full text-left p-2 ${
                activeTab === "projects" ? "bg-gray-700 rounded text-white" : ""
              }`}
              onClick={() => handleTabClick("projects")}
            >
              Dashboard
            </button>
            <button
              className={`block w-full text-left p-2 ${
                activeTab === "direct_designer"
                  ? "bg-gray-700 rounded text-white"
                  : ""
              }`}
              onClick={() => setActiveTab("direct_designer")}
            >
              Jobs
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
  );
}
