import React from "react";
import {API_URL} from "../../App/api/config.js";

const DownloadTemplateButton = () => {
  const handleDownload = async () => {
    const response = await fetch(
      `${API_URL}/users/download-excel-template`
    );
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "UserTemplate.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <button
      className="px-4 py-2 bg-[#3BC0C3] flex justify-between gap-1 text-white rounded-lg"
      onClick={handleDownload}
    >
      Download Template
    </button>
  );
};

export default DownloadTemplateButton;
