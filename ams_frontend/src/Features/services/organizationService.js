import API from "../../App/api/axiosInstance";

export const createOrganizationService = async (data) => {
  const response = await API.post("/organization/createOrganization", data);
  return response.data;
};

export const getAllOrganizationsService = async ({
  limit = 5,
  page = 1,
  searchTerm = "",
}) => {
  const response = await API.get("/organization/getAllOrganizations", {
    params: {
      limit,
      page,
      searchTerm: searchTerm.trim(),
    },
  });
  return response;
};

export const updateOrganizationService = async (data) => {
  const response = await API.put(
    `/organization/${data.params.organizationId}`,
    data.body
  );
  return response.data;
};

export const deleteOrganizationService = async (ids) => {
  try {
    const idsArray = Array.isArray(ids) ? ids : [ids];

    if (idsArray.length === 1) {
      const response = await API.delete(`/organization/${idsArray[0]}`);
      return {
        deletedOrganizationIds: [idsArray[0]],
        success: true,
      };
    } else {
      const response = await API.post("/organization/bulk-delete", {
        organizationIds: idsArray,
      });
      return {
        ...response.data,
        success: true,
      };
    }
  } catch (error) {
    const errorMsg =
      error.response?.data?.message || "Error deleting organization(s)";
    throw new Error(errorMsg);
  }
};
