import API from "../../App/api/axiosInstance";

export const createAssignAssetService = async (data) => {
  const response = await API.post("/assignAsset/asset-assignments", data);
  return response.data;
};

export const getAllAssignAssetsService = async (params = {}) => {
  const response = await API.get("/assignAsset/asset-assignments", {
    params: {
      status: "IN_USE",
      ...params,
    },
  });
  return response.data;
};

export const getAvailableAssetsService = async (params) => {
  const response = await API.get("/assignAsset/available-assets", { params });
  return response.data;
};

export const getAssignableUsersService = async (params) => {
  const response = await API.get("/assignAsset/assignable-users", { params });
  return response.data;
};

export const getAssetAssignmentByIdService = async (assignmentId) => {
  const response = await API.get(
    `/assignAsset/asset-assignments/${assignmentId}`
  );
  return response.data;
};

export const getAssetAssignmentsByAssetIdService = async (assetId) => {
  const response = await API.get(
    `/assignAsset/asset-assignments/asset/${assetId}`
  );
  return response.data;
};

export const getAssetAssignmentsByUserIdService = async (userId) => {
  const response = await API.get(
    `/assignAsset/asset-assignments/user/${userId}`
  );
  return response.data;
};

export const updateAssignAssetService = async (data) => {
  const response = await API.put(
    `/assignAsset/asset-assignments/${data.params.assignmentId}`,
    data.body
  );
  return response.data;
};

export const deleteAssignAssetService = async (ids) => {
  try {
    const idsArray = Array.isArray(ids) ? ids : [ids];

    if (idsArray.length === 1) {
      const response = await API.delete(
        `/assignAsset/asset-assignments/${idsArray[0]}`
      );
      return {
        deletedAssignAssetIds: [idsArray[0]],
        success: true,
      };
    } else {
      const response = await API.post(
        "/assignAsset/asset-assignments/bulk-delete",
        {
          assignmentIds: idsArray,
        }
      );
      return {
        ...response.data,
        success: true,
      };
    }
  } catch (error) {
    console.error("Delete Error:", error.response?.data);
    const errorMsg =
      error.response?.data?.message || "Error deleting assign asset(s)";
    throw new Error(errorMsg);
  }
};
