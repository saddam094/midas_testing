import React from "react";
import PropTypes from "prop-types";

const ThreeDotMenu = ({
  isOpen,
  toggleMenu,
  onView,
  onCreateJob,
  onAssign,
}) => {
  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="p-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        &#x22EE; {/* Unicode character for vertical ellipsis */}
      </button>
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10"
          role="menu"
        >
          {/* <button
            onClick={onView}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            role="menuitem"
          >
            View
          </button> */}
          {/* <button
            onClick={onCreateJob}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            role="menuitem"
          >
            Create Job
          </button> */}
          <button
            onClick={onAssign}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            role="menuitem"
          >
            Assign
          </button>
        </div>
      )}
    </div>
  );
};

ThreeDotMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleMenu: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onCreateJob: PropTypes.func.isRequired,
  onAssign: PropTypes.func.isRequired,
};

export default ThreeDotMenu;
