import API from "../../App/api/axiosInstance";

export const getAllAssetHistoriesService = async ({
  limit = 10,
  page = 1,
  searchTerm = "",
}) => {
const response = await API.get("/assetHistory", {
    params: {
        limit,
        page,
        searchTerm: searchTerm.trim(),
    },
});
    return response.data;
};

export const getAssetHistoryByIdService = async (historyId) => {
    const response = await API.get(`/assetHistory/${historyId}`);
    return response.data;
};

export const getAssetHistoriesByAssetIdService = async ({
    assetId,
    limit = 10,
    page = 1,
    searchTerm = "",
    userId = "",
    action = "",
    timestampFrom = "",
    timestampTo = "",
    sortBy = "timestamp",
    sortType = "desc",
    }) => {
const response = await API.get(`/assetHistory/asset/${assetId}`, {
    params: {
        limit,
        page,
        searchTerm: searchTerm.trim(),
        userId,
        action,
        timestampFrom,
        timestampTo,
        sortBy,
        sortType,
    },
});
    return response.data;
};