"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Jobs from "./components/Jobs";
import CompletedJobs from "./components/completedjobs";
// import Projects from "./components/Projects";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "production") {
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
      case "dashboard":
        return <Jobs />;
      case "completed":
        return <CompletedJobs />;

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="fixed top-0 left-0 flex items-center p-4 bg-white w-full md:hidden">
        <button className="mr-4 text-2xl" onClick={toggleDrawer}>
          ☰
        </button>
        <div>
          <span className="text-xl font-bold">Midas Touch Creations</span>
          <p className="text-gray-500 text-sm">Production</p>
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
              <p className="text-gray-500 text-sm">Production</p>
            </div>
            <button className="md:hidden text-2xl" onClick={toggleDrawer}>
              ✕
            </button>
          </div>
          <div className="flex-grow">
            <button
              className={`block w-full text-left p-2 ${
                activeTab === "dashboard"
                  ? "bg-gray-700 rounded text-white"
                  : ""
              }`}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </button>
            <button
              className={`block w-full text-left p-2 ${
                activeTab === "completed"
                  ? "bg-gray-700 rounded text-white"
                  : ""
              }`}
              onClick={() => setActiveTab("completed")}
            >
              Completed
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
