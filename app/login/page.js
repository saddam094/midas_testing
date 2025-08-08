"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [isLoginClicked, setIsLoginClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    console.log("Token: ", token);
    console.log("Role: ", role);

    if (token && role) {
      if (role === "admin") {
        router.push("/dashboard/admin");
      } else if (role === "designer") {
        router.push("/dashboard/designer");
      } else if (role === "production") {
        router.push("/dashboard/production");
      } else if (role === "accounts") {
        router.push("/dashboard/accounts");
      } else if (role === "installation") {
        router.push("/dashboard/installation");
      } else if (role === "project_coordinator") {
        router.push("/dashboard/projectcoordinator");
      }
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoginClicked(true);

    try {
      const response = await axios.post(
        "https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_login",
        // { email, password, role },
        { email: email.trim(), password: password.trim(), role: role },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;
      console.log(data);

      if (response.data["body-json"]["statusCode"] === 200) {
        const token = data["body-json"]["body"]["token"];

        // Decode token to check role
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        console.log(decodedToken);
        const role = decodedToken.role;
        const designerId = decodedToken.designerId; // Assuming designerId is part of the token
        const employeeId = decodedToken.employeeId; // Assuming employeeId is part of the token
        console.log(role);
        // console.log("This is the  employe id of the login page", employeeId);

        // Save token, role, designerId, and employeeId to localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        if (role === "designer") {
          localStorage.setItem("designerId", designerId);
        }
        localStorage.setItem("employeeId", employeeId);
        setIsLoginClicked(false);

        // Redirect based on role
        if (role === "admin") {
          router.push("/dashboard/admin");
        } else if (role === "designer") {
          router.push("/dashboard/designer");
        } else if (role === "production") {
          router.push("/dashboard/production");
        } else if (role === "accounts") {
          router.push("/dashboard/accounts");
        } else if (role === "installation") {
          router.push("/dashboard/installation");
        } else if (role === "project_coordinator") {
          router.push("/dashboard/projectcoordinator");
        }
      } else if (response.data["body-json"]["statusCode"] === 403) {
        setError("Login failed: " + data["body-json"]["body"]);
        setIsLoginClicked(false);
      } else {
        setIsLoginClicked(false);
        setError("Login failed: " + data.body.message);
      }
    } catch (err) {
      setError("Enter correct login credentials and try again!");
      setIsLoginClicked(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex justify-center items-center h-screen">
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
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md m-8">
          <h1 className="text-xl font-bold mb-6 text-center text-gray-800">
            Sign in to Midas Touch
          </h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Login as
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="project_coordinator">Project Coordinator</option>
                <option value="designer">Designer</option>
                <option value="accounts">Accounts</option>
                <option value="production">Production</option>
                <option value="installation">Installation</option>
                {/* <option value="installation">Installation</option> */}
              </select>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              {isLoginClicked ? (
                <svg
                  className="animate-spin  h-5 w-5"
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
                `Login`
              )}
            </button>
          </form>
          {error && (
            <p className="mt-4 text-center text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
