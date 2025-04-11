import API from "../../App/api/axiosInstance";

export const createAssetService = async (data) => {
  const response = await API.post("/asset/createAsset", data);
  return response.data;
};

export const getAllAssetsService = async () => {
  const response = await API.get("/asset/getAllAssets");
  return response.data;
};

export const updateAssetService = async (data) => {
  const updatePayload = {
    assetName: data.assetName,
    serialNumber: data.serialNumber,
    departmentId: data.departmentId,
    brand: data.brand,
    description: data.description,
    model: data.model,
    uniqueId: data.uniqueId,
    status: data.status,
    assignedToUserId: data.assignedToUserId,
    locationId: data.locationId,
    purchaseDate: data.purchaseDate,
    cost: data.cost,
    warrantyEndDate: data.warrantyEndDate,
    branchId: data.branchId,
  };
  const response = await API.put(`/asset/${data.id}`, updatePayload);
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
    console.error("Delete Error:", error.response?.data);
    const errorMsg = error.response?.data?.message || "Error deleting asset(s)";
    throw new Error(errorMsg);
  }
};
