import API from "../../App/api/axiosInstance";

export const createAssetService = async (data) => {
  const response = await API.post("/asset/createAsset", data);
  return response.data;
};

export const getAllAssetsService = async ({
  limit = 5,
  page = 1,
  searchTerm = "",
}) => {
  const response = await API.get("/asset/getAllAssets", {
    params: {
      limit,
      page,
      searchTerm: searchTerm.trim(),
    },
  });
  return response;
};

export const updateAssetService = async (data) => {
  const response = await API.put(`/asset/${data.params.assetId}`, data.body);
  return response.data;
};

export const deleteAssetService = async (ids) => {
  try {
    const idsArray = Array.isArray(ids) ? ids : [ids];

    if (idsArray.length === 1) {
      const response = await API.delete(`/asset/${idsArray[0]}`);
      return {
        deletedAssetIds: [idsArray[0]],
        success: true,
      };
    } else {
      const response = await API.post("/asset/bulk-delete", {
        assetIds: idsArray,
      });
      return {
        ...response.data,
        success: true,
      };
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || "Error deleting asset(s)";
    throw new Error(errorMsg);
  }
};
