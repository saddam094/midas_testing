"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic"; // Import dynamic from next

// Dynamically import Designer component to disable SSR
const Designer = dynamic(() => import("./components/Designer"), { ssr: false });
const Dashboard = dynamic(() => import("./components/Dashboard"), {
  ssr: false,
});

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isOpen, setIsOpen] = useState(false);
  const [isClientSide, setIsClientSide] = useState(false); // Track client-side rendering

  // Ensure this code runs only on the client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsClientSide(true); // Set to true once on the client side
    }
  }, []);

  useEffect(() => {
    if (isClientSide) {
      // Only access localStorage after confirming it's client-side
      const role = localStorage.getItem("role");
      if (role !== "designer") {
        router.push("/login");
      }
    }
  }, [isClientSide, router]);

  const handleLogout = () => {
    if (isClientSide) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      router.push("/");
    }
  };

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const renderContent = () => {
    switch (activeTab) {
      // case "dashboard":
      //   return <Dashboard />;
      case "dashboard":
        return <Designer />;
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
        <span className="text-xl font-bold">Midas Designer</span>
      </div>
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition-transform duration-200 ease-in-out bg-white text-gray-700 w-64 h-full`}
      >
        <nav className="flex flex-col p-4 h-full border-r border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-bold">Midas Touch</span>
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
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
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
