import API from "../../App/api/axiosInstance";

export const createBranchService = async (data) => {
  const response = await API.post("/branch/createBranch", data);
  return response.data;
};

export const getAllBranchesService = async ({
  limit = 5,
  page = 1,
  searchTerm = "",
}) => {
  const response = await API.get("/branch/getAllBranches", {
    params: {
      limit,
      page,
      searchTerm: searchTerm.trim(),
    },
  });
  return response;
};

export const updateBranchService = async (data) => {
  const response = await API.put(`/branch/${data.params.branchId}`, data.body);
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
    const errorMsg =
      error.response?.data?.message || "Error deleting branch(s)";
    throw new Error(errorMsg);
  }
};
