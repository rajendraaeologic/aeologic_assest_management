import API from "../../App/api/axiosInstance";

export const createBranchService = async (data) => {
  const response = await API.post("/branch/createBranch", data);
  return response.data;
};

export const getAllBranchesService = async () => {
  const response = await API.get("/branch/getAllBranches");
  return response.data;
};

export const updateBranchService = async (data) => {
  const updatePayload = {
    branchName: data.branchName,
    branchLocation: data.branchLocation,
  };
  const response = await API.put(`/branch/${data.id}`, updatePayload);
  return response.data;
};

export const deleteBranchService = async (ids) => {
  try {
    const idsArray = Array.isArray(ids) ? ids : [ids];

    if (idsArray.length === 1) {
      const response = await API.delete(`/branch/${idsArray[0]}`);
      return {
        deletedBranchIds: [idsArray[0]],
        success: true,
      };
    } else {
      const response = await API.post("/branch/bulk-delete", {
        branchIds: idsArray,
      });
      return {
        ...response.data,
        success: true,
      };
    }
  } catch (error) {
    console.error("Delete Error:", error.response?.data);
    const errorMsg =
      error.response?.data?.message || "Error deleting branch(s)";
    throw new Error(errorMsg);
  }
};

