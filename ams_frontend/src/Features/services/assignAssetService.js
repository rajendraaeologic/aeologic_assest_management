import API from "../../App/api/axiosInstance";

export const createAssignAssetService = async (data) => {
  const response = await API.post("/assignAsset/createAssignAsset", data);
  return response.data;
};

export const getAllAssignAssetsService = async () => {
  const response = await API.get("/assignAsset/getAllAssignAssets");
  return response.data;
};

export const updateAssignAssetService = async (data) => {
  const response = await API.put(
    `/assignAsset/${data.params.assignAssetId}`,
    data.body
  );
  return response.data;
};

export const deleteAssignAssetService = async (ids) => {
  try {
    const idsArray = Array.isArray(ids) ? ids : [ids];

    if (idsArray.length === 1) {
      const response = await API.delete(`/assignAsset/${idsArray[0]}`);
      return {
        deletedAssignAssetIds: [idsArray[0]],
        success: true,
      };
    } else {
      const response = await API.post("/assignAsset/bulk-delete", {
        assignAssetIds: idsArray,
      });
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
