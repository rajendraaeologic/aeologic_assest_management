import API from "../../App/api/axiosInstance";

export const createAssetService = async (data) => {
  try {
    const response = await API.post("/asset/createAsset", data);
    return response.data;
  } catch (error) {
    console.error("Create Asset Error:", error.response?.data || error.message);
    throw error.response?.data || "Something went wrong while creating asset";
  }
};

export const getAllAssetsService = async () => {
  try {
    const response = await API.get("/asset/getAllAssets");
    return response.data;
  } catch (error) {
    console.error("Get Assets Error:", error.response?.data || error.message);
    throw error.response?.data?.message || "Failed to fetch assets";
  }
};

export const updateAssetService = async (data) => {
  try {
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
      branchId: data.branchId
    };

    const response = await API.put(`/asset/${data.id}`, updatePayload);
    return response.data;
  } catch (error) {
    console.error("Update Asset Error:", error.response?.data || error.message);
    throw error.response?.data || "Error updating asset";
  }
};

export const deleteAssetService = async (ids) => {
  try {
    const idsArray = Array.isArray(ids) ? ids : [ids];

    if (idsArray.length === 1) {
      const response = await API.delete(`/asset/${idsArray[0]}`);
      return {
        deletedAssetIds: [idsArray[0]],
        success: true,
        message: response.data?.message || "Asset deleted successfully",
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
    console.error("Delete Asset Error:", error.response?.data);
    const errorMsg =
      error.response?.data?.message || "Error deleting asset(s)";
    throw new Error(errorMsg);
  }
};