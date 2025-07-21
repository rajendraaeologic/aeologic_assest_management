import API from "../../App/api/axiosInstance";

export const createDepartmentService = async (data) => {
  const response = await API.post("/department/createDepartment", {
    departmentName: data.departmentName,
    branchId: data.branchId,
  });
  return response.data;
};

export const getAllDepartmentsService = async ({
  limit = 5,
  page = 1,
  searchTerm = "",
}) => {
  const response = await API.get("/department/getAllDepartments", {
    params: {
      limit,
      page,
      searchTerm: searchTerm.trim(),
    },
  });
  return response;
};

export const updateDepartmentService = async (data) => {
  const response = await API.put(
    `/department/${data.params.departmentId}`,
    data.body
  );
  return response.data;
};

export const deleteDepartmentService = async (ids) => {
  try {
    const idsArray = Array.isArray(ids) ? ids : [ids];

    if (idsArray.length === 1) {
      const response = await API.delete(`/department/${idsArray[0]}`);
      return {
        deletedDepartmentIds: [idsArray[0]],
        success: true,
      };
    } else {
      const response = await API.post("/department/bulk-delete", {
        departmentIds: idsArray,
      });
      return {
        ...response.data,
        success: true,
      };
    }
  } catch (error) {
    const errorMsg =
      error.response?.data?.message || "Error deleting department(s)";
    throw new Error(errorMsg);
  }
};
