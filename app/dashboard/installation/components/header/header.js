import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import logo from "../../assets/images/midas.png";

function Header({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("isAuthenticated");

    setIsAuthenticated(false);
    navigate("/admin_login");
  };

  return (
    <div className="flex h-20 w-full bg-slate-100 border-slate-300 border-b-2 items-center justify-between px-5 md:px-10 fixed">
      {/* Logo */}
      <Link to={"/"}>
        <img src={logo} alt="logo" className="w-32 h-10 rounded-sm bg-black" />
      </Link>

      {/* Search Bar */}
      <div className="flex items-center w-40 md:w-full md:max-w-2xl bg-white shadow-md rounded-full px-4 py-2">
        <SearchIcon className="text-gray-400 mr-2" />
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search here..."
          className="bg-transparent text-gray-600 placeholder-gray-400 focus:outline-none w-full"
        />
      </div>

      {/* Admin Section */}
      <div className="flex items-center space-x-2 md:space-x-6">
        {/* Admin Info */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLogout}
            className="text-red-500 text-sm font-medium hover:underline"
          >
            Logout
          </button>

          {/* Profile Picture */}
          <Link to={"/profile"}>
            <div className="flex justify-center">
              <div className="w-12 h-12 sm:w-12 sm:h-12 rounded-full border-4 border-gray-200 flex items-center justify-center bg-gray-100">
                <svg
                  className="w-8 h-8 sm:w-8 sm:h-8 text-blue-700"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2V19.2c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Header;
