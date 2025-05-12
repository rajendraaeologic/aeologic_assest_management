import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import catchAsync from "@/lib/catchAsync";
import pick from "@/lib/pick";
import { applyDateFilter } from "@/utils/filters.utils";
import { PrismaClient } from "@prisma/client";
import {
  AssetKeys,
  AssetAssignmentKeys,
  AssetHistoryKeys,
} from "../utils/selects.utils";
import { assetService } from "@/services";

const prisma = new PrismaClient();

const createAsset = catchAsync(async (req, res) => {
  try {
    const asset = await assetService.createAsset({
      assetName: req.body.assetName,
      uniqueId: req.body.uniqueId,
      brand: req.body.brand,
      model: req.body.model,
      serialNumber: req.body.serialNumber,
      status: req.body.status,
      description: req.body.description,
      branchId: req.body.branchId,
      departmentId: req.body.departmentId,
      companyId: req.body.companyId,
    });

    res.status(httpStatus.CREATED).json({
      status: 201,
      success: true,
      message: "Asset Created Successfully",
      data: asset,
    });
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
});

export const getAllAssets = catchAsync(async (req, res) => {
  const rawFilters = pick(req.query, [
    "assetName",
    "status",
    "branchId",
    "departmentId",
    "from_date",
    "to_date",
    "searchTerm",
  ]);

  let limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  let sortBy = (req.query.sortBy as string) || "createdAt";
  let sortType = (req.query.sortType as "asc" | "desc") || "desc";

  applyDateFilter(rawFilters);

  const filters: any = {};

  if (rawFilters.from_date || rawFilters.to_date) {
    filters.createdAt = {};
    if (rawFilters.from_date) filters.createdAt.gte = rawFilters.from_date;
    if (rawFilters.to_date) filters.createdAt.lte = rawFilters.to_date;
  }

  if (rawFilters.assetName) {
    filters.assetName = {
      contains: rawFilters.assetName,
      mode: "insensitive",
    };
    limit = 1;
    sortBy = "createdAt";
    sortType = "desc";
  }

  if (rawFilters.branchId) filters.branchId = rawFilters.branchId;
  if (rawFilters.departmentId) filters.departmentId = rawFilters.departmentId;
  if (rawFilters.status) filters.status = rawFilters.status;

  const searchTerm = (rawFilters.searchTerm as string)?.trim();
  const isSearchMode = !!searchTerm;

  if (isSearchMode) {
    limit = 5;
    sortBy = "createdAt";
    sortType = "desc";
  }

  const searchConditions = searchTerm
    ? {
        OR: [
          {
            assetName: { contains: searchTerm, mode: "insensitive" },
          },
          {
            serialNumber: { contains: searchTerm, mode: "insensitive" },
          },
          {
            uniqueId: { contains: searchTerm, mode: "insensitive" },
          },
        ],
      }
    : {};

  const where = {
    ...filters,
    ...searchConditions,
  };

  const options = {
    limit,
    page,
    sortBy,
    sortType,
  };

  const result = await assetService.queryAssets(where, options);

  if (!result || result.data.length === 0) {
    res.status(httpStatus.OK).json({
      success: false,
      status: 404,
      message: "No assets found",
      data: [],
      totalData: 0,
      page,
      limit,
      totalPages: 0,
      mode: isSearchMode ? "search" : "pagination",
    });
    return;
  }

  res.status(httpStatus.OK).json({
    status: 200,
    success: true,
    message: "Assets fetched successfully",
    data: result.data,
    totalData: result.total,
    page,
    limit,
    totalPages: Math.ceil(result.total / limit),
    mode: isSearchMode ? "search" : "pagination",
  });
});

const getAssetById = catchAsync(async (req, res) => {
  const asset = await prisma.asset.findUnique({
    where: { id: req.params.assetId },
    select: AssetKeys,
  });

  if (!asset) {
    throw new ApiError(httpStatus.NOT_FOUND, "Asset not found");
  }

  res.status(httpStatus.OK).json({
    status: 200,
    success: true,
    message: "Asset fetched successfully",
    data: asset,
  });
});

const updateAsset = catchAsync(async (req, res) => {
  const assetId = req.params.assetId;
  const updateBody = req.body;

  const updatedAsset = await assetService.updateAssetById(assetId, updateBody);

  res.send(updatedAsset);
});

const deleteAsset = catchAsync(async (req, res) => {
  await assetService.deleteAssetById(req.params.assetId);

  res.status(httpStatus.NO_CONTENT).json({
    success: true,
    message: "Asset deleted successfully",
  });
});

const bulkDeleteAssets = catchAsync(async (req, res) => {
  await assetService.deleteAssetsByIds(req.body.assetIds);
  res.status(httpStatus.NO_CONTENT).json({
    success: true,
    message: "Assets deleted successfully",
  });
});

const assignAsset = catchAsync(async (req, res) => {
  // Create assignment record
  const assignment = await prisma.assetAssignment.create({
    data: {
      assetId: req.params.assetId,
      userId: req.body.assignedToUserId,
    },
    select: AssetAssignmentKeys,
  });

  // Update asset's assigned user
  await prisma.asset.update({
    where: { id: req.params.assetId },
    data: { assignedToUserId: req.body.assignedToUserId },
  });

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Asset assigned successfully",
    data: assignment,
  });
});

const getAssetAssignments = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["from_date", "to_date"]);
  applyDateFilter(filter);

  const assignments = await prisma.assetAssignment.findMany({
    where: { assetId: req.params.assetId, ...filter },
    select: AssetAssignmentKeys,
  });

  res.status(200).json({
    success: true,
    message:
      assignments.length > 0
        ? "Asset assignments fetched successfully"
        : "No assignments found",
    data: assignments,
  });
});

const getAssetHistory = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["action", "userId", "from_date", "to_date"]);
  applyDateFilter(filter);

  const history = await prisma.assetHistory.findMany({
    where: { assetId: req.params.assetId, ...filter },
    select: AssetHistoryKeys,
  });

  res.status(200).json({
    success: true,
    message:
      history.length > 0
        ? "Asset history fetched successfully"
        : "No history found",
    data: history,
  });
});

export default {
  createAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  bulkDeleteAssets,
  assignAsset,
  getAssetAssignments,
  getAssetHistory,
};
