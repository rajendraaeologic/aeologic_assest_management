import React from "react";
import API from "../../App/api/axiosInstance";

const DownloadTemplateButton = () => {
  const handleDownload = async () => {
    try {
      const response = await API.get("/users/download-excel-template", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "UserTemplate.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
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
