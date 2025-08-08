import React from 'react';

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="bg-white shadow-md rounded-lg overflow-hidden w-full max-w-md">
        <div className="bg-blue-600 h-32 flex items-center justify-center">
          <img
            className="h-24 w-24 rounded-full border-4 border-white"
            src="https://via.placeholder.com/150"
            alt="Profile"
          />
        </div>
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-gray-800 text-center">John Doe</h1>
          <p className="text-gray-600 text-center mt-2">Accounts Departement</p>
          <div className="mt-4">
            <p className="text-gray-800 font-medium">Email:</p>
            <p className="text-gray-600">accounts@midas.com</p>
          </div>
          <div className="mt-4">
            <p className="text-gray-800 font-medium">Location:</p>
            <p className="text-gray-600">Midas Touch, office</p>
          </div>
          <div className="mt-4">
            <p className="text-gray-800 font-medium">About:</p>
            <p className="text-gray-600">
              Passionate developer with a love for creating intuitive and efficient user experiences. Always learning new technologies and staying up-to-date with industry trends.
            </p>
          </div>
          <div className="mt-6 flex justify-center">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500">Edit Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;