// "use client";
// import ProtectedRoute from "../../components/ProtectedRoute";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

// export default function InstallationDashboard() {
//   const router = useRouter();

// useEffect(() => {
//   const role = localStorage.getItem("role");
//   if (role !== "installation") {
//     router.push("/login");
//   }
// }, [router]);

//   return (
//     <ProtectedRoute>
//       <div>Installation Dashboard</div>
//     </ProtectedRoute>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// import Header from "./components/header";
// import Dasboard from "./components/Projects";
import Dashboard from "./components/pages/dashboard/dashboard";
import Jobs from "./components/pages/particular_category/particular_category";
import Profile from "./components/pages/profile/profile";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "installation") {
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
      // case "projects":
      //   return <Projects />;
      case "profile":
        return <Profile />;
      case "jobs":
        return <Jobs />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} />

      <div className="fixed top-0 left-0 flex items-center p-4 bg-white w-full md:hidden">
        <button className="mr-4" onClick={toggleDrawer}>
          ☰
        </button>
        <div>
          <span className="text-xl font-bold">Midas Touch Creations</span>
          <p className="text-gray-500 text-sm">Admin</p>
        </div>
      </div>
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition-transform duration-200 ease-in-out bg-white text-gray-700 w-64 h-full z-50`}
      >
        <nav className="flex flex-col p-4 h-full border-r border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-md font-bold">Midas Touch Creations</span>
              <p className="text-gray-500 text-sm">Installation</p>
            </div>
            <button className="md:hidden" onClick={toggleDrawer}>
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
              onClick={() => handleTabClick("dashboard")}
            >
              Dashboard
            </button>

            <button
              className={`block w-full text-left p-2 ${
                activeTab === "jobs" ? "bg-gray-700 rounded text-white" : ""
              }`}
              onClick={() => handleTabClick("jobs")}
            >
              Completed Jobs
            </button>

            <button
              className={`block w-full text-left p-2 ${
                activeTab === "profile" ? "bg-gray-700 rounded text-white" : ""
              }`}
              onClick={() => handleTabClick("profile")}
            >
              Profile
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
