import React, { useState, useEffect } from "react";
import API from "../../App/api/axiosInstance";
import userDashboardStrings from "../../locales/userDashboardStrings";

// Reusable detail component
const DetailItem = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-600">{label}:</span>
    <span className="text-gray-800">{value}</span>
  </div>
);

const UserDashboard = () => {
  const [expandedIds, setExpandedIds] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.get("/userDashboard/");
        console.log(response);

        if (response.data?.success) {
          setData(response.data.assignments);
        } else {
          throw new Error(response.data?.message || "Failed to fetch data");
        }
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleDetails = (assetId) => {
    if (expandedIds.includes(assetId)) {
      setExpandedIds(expandedIds.filter((id) => id !== assetId));
    } else {
      setExpandedIds([...expandedIds, assetId]);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-100 min-h-screen px-6 pt-24">
        {userDashboardStrings.loading}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-100 min-h-screen pt-24 px-6 text-red-500">
        {error}
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className="bg-slate-100 min-h-screen pt-24 px-6">
        {userDashboardStrings.noAssets}
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen pb-4 pt-24 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.data.map((asset) => (
          <div
            key={asset.id}
            className="bg-white rounded-lg shadow-md p-6 self-start"
          >
            {/* Basic Info */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {userDashboardStrings.assetName}: {asset.asset.assetName}
              </h2>
              <p className="text-gray-600">
                {userDashboardStrings.assetId}: {asset.asset.uniqueId}
              </p>
              <p className="text-sm text-gray-500">
                {userDashboardStrings.assignedDate}:{" "}
                {new Date(asset.assignedAt).toLocaleDateString()}
              </p>
            </div>

            {/* Expand Button */}
            <button
              onClick={() => toggleDetails(asset.id)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {expandedIds.includes(asset.id)
                ? userDashboardStrings.hideDetails
                : userDashboardStrings.showDetails}
            </button>

            {/* Expanded Details */}
            {expandedIds.includes(asset.id) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="space-y-4">
                  {/* Asset Details */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {userDashboardStrings.assetDetails}
                    </h3>
                    <DetailItem
                      label={userDashboardStrings.company}
                      value={asset.asset.company.organizationName}
                    />
                    <DetailItem
                      label={userDashboardStrings.branch}
                      value={asset.asset.branch.branchName}
                    />
                    <DetailItem
                      label={userDashboardStrings.location}
                      value={asset.asset.branch.branchLocation}
                    />
                    <DetailItem
                      label={userDashboardStrings.department}
                      value={asset.asset.department.departmentName}
                    />
                  </div>

                  {/* User Details */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {userDashboardStrings.assignedTo}
                    </h3>
                    <DetailItem
                      label={userDashboardStrings.name}
                      value={asset.user.userName}
                    />
                    <DetailItem
                      label={userDashboardStrings.email}
                      value={asset.user.email}
                    />
                    <DetailItem
                      label={userDashboardStrings.userDepartment}
                      value={asset.user.department.departmentName}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
