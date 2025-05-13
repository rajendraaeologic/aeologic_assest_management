import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import catchAsync from "@/lib/catchAsync";
import pick from "@/lib/pick";
import { applyDateFilter } from "@/utils/filters.utils";
import assetHistoryService from "@/services/assetHistory.service";
import { AssetHistoryKeys } from "@/utils/selects.utils";

const getAssetHistories = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["assetId", "userId", "action"]);
  const options = pick(req.query, ["sortBy", "sortType", "limit", "page"]);

  applyDateFilter(filter);

  const result = await assetHistoryService.queryAssetHistories(filter, options);

  res.status(httpStatus.OK).json({
    success: true,
    message: result.data.length
      ? "Asset histories fetched successfully"
      : "No asset histories found",
    data: result.data,
    total: result.total,
    page: options.page || 1,
    limit: options.limit || 10,
  });
});

const getAssetHistoryById = catchAsync(async (req, res) => {
  const history = await assetHistoryService.getAssetHistoryById(
    req.params.historyId
  );

  if (!history) {
    throw new ApiError(httpStatus.NOT_FOUND, "Asset history not found");
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: "Asset history fetched successfully",
    data: history,
  });
});

const getAssetHistoryByAssetId = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["action", "userId"]);
  const options = pick(req.query, ["sortBy", "sortType", "limit", "page"]);

  applyDateFilter(filter);

  const result = await assetHistoryService.getAssetHistoriesByAssetId(
    req.params.assetId,
    filter,
    options
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: result.data.length
      ? "Asset histories fetched successfully"
      : "No histories found for this asset",
    data: result.data,
    total: result.total,
  });
});

export default {
  getAssetHistories,
  getAssetHistoryById,
  getAssetHistoryByAssetId,
};
