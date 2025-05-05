import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/login");
  };

  return (
    <div className="text-center py-16 px-4 max-w-xl mx-auto">
      <h1 className="text-4xl text-red-600">Unauthorized Access</h1>
      <p className="mt-6 text-lg text-gray-600">
        You do not have permission to view this page.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={handleGoHome}
          className="px-6 py-3 text-lg bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-300"
        >
          Login Page
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
