import API from "../../App/api/axiosInstance";

export const createUserService = async (data) => {
  const response = await API.post("/users/", data);
  return response.data;
};

export const getAllUsersService = async () => {
  const response = await API.get("/users/");
  return response.data;
};

export const updateUserService = async (data) => {
  const response = await API.put(`/users/${data.params.userId}`, data.body);
  return response.data;
};

export const deleteUserService = async (ids) => {
  try {
    const idsArray = Array.isArray(ids) ? ids : [ids];

    if (idsArray.length === 1) {
      const response = await API.delete(`/users/${idsArray[0]}`);
      return {
        deletedUserIds: [idsArray[0]],
        success: true,
      };
    } else {
      const response = await API.post("/users/bulk-delete", {
        userIds: idsArray,
      });
      return {
        ...response.data,
        success: true,
      };
    }
  } catch (error) {
    console.error("Delete Error:", error.response?.data);
    const errorMsg = error.response?.data?.message || "Error deleting user(s)";
    throw new Error(errorMsg);
  }
};
