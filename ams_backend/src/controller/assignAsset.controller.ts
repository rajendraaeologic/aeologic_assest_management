import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import catchAsync from "@/lib/catchAsync";
import pick from "@/lib/pick";
import { applyDateFilter } from "@/utils/filters.utils";
import assignAssetService from "@/services/assignasset.service";
import { AssetStatus, PrismaClient } from "@prisma/client";
import db from "@/lib/db";

const prisma = new PrismaClient();

const assignAsset = catchAsync(async (req, res) => {
  const { assetId, userId } = req.body;

  const result = await assignAssetService.assignAsset(assetId, userId);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Asset assigned successfully",
    data: result,
  });

  const isAssetAvailable = await db.asset.findFirst({
    where: {
      id: assetId,
      status: AssetStatus.ACTIVE,
      assignedToUserId: null,
      AssetAssignment: {
        none: {
          status: AssetStatus.IN_USE,
        },
      },
    },
  });

  if (!isAssetAvailable) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "Asset is no longer available for assignment"
    );
  }
});

const unassignAsset = catchAsync(async (req, res) => {
  const { assignmentId } = req.params;

  const result = await assignAssetService.unassignAsset(assignmentId);

  res.status(httpStatus.OK).json({
    status: 200,
    success: true,
    message: "Asset unassigned successfully",
    data: result,
  });
});

export const getAssetAssignments = catchAsync(async (req, res) => {
  const rawFilters = pick(req.query, [
    "assetId",
    "userId",
    "status",
    "from_date",
    "to_date",
    "searchTerm",
  ]);

  let limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  let sortBy = (req.query.sortBy as string) || "assignedAt";
  let sortType = (req.query.sortType as "asc" | "desc") || "desc";

  applyDateFilter(rawFilters);

  const filters: any = {};

  if (rawFilters.from_date || rawFilters.to_date) {
    filters.assignedAt = {};
    if (rawFilters.from_date) filters.assignedAt.gte = rawFilters.from_date;
    if (rawFilters.to_date) filters.assignedAt.lte = rawFilters.to_date;
  }

  if (rawFilters.assetId) filters.assetId = rawFilters.assetId;
  if (rawFilters.userId) filters.userId = rawFilters.userId;
  if (rawFilters.status) filters.status = rawFilters.status;

  const searchTerm = (rawFilters.searchTerm as string)?.trim();
  const isSearchMode = !!searchTerm;

  if (isSearchMode) {
    limit = 5;
    sortBy = "assignedAt";
    sortType = "desc";
  }

  const searchConditions = isSearchMode
    ? {
        asset: {
          assetName: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      }
    : {};

  const where = {
    ...filters,
    ...searchConditions,
  };

  const result = await assignAssetService.getAssetAssignments(where, {
    limit,
    page,
    sortBy,
    sortType,
  });

  if (!result || result.data.length === 0) {
    res.status(httpStatus.OK).json({
      success: false,
      status: 404,
      message: "No asset assignments found",
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
    message: "Asset assignments fetched successfully",
    data: result.data,
    totalData: result.total,
    page,
    limit,
    totalPages: Math.ceil(result.total / limit),
    mode: isSearchMode ? "search" : "pagination",
  });
});

const getAvailableAssets = catchAsync(async (req, res) => {
  const assets = await assignAssetService.getAvailableAssets(
    req.query.branchId as string,
    req.query.departmentId as string
  );

  if (assets.length === 0) {
    res.status(httpStatus.OK).json({
      status: 404,
      success: false,
      message: "No available assets found",
      data: [],
    });
    return;
  }

  res.status(httpStatus.OK).json({
    status: 200,
    success: true,
    message: "Available assets fetched successfully",
    data: assets,
  });
});

const getUsersForAssignment = catchAsync(async (req, res) => {
  const users = await assignAssetService.getUsersForAssignment(
    req.query.branchId as string,
    req.query.departmentId as string
  );

  res.status(httpStatus.OK).json({
    status: 200,
    success: true,
    message: users.length ? "Users fetched successfully" : "No users found",
    data: users,
  });
});

const getAssetAssignmentById = catchAsync(async (req, res) => {
  const assignment = await assignAssetService.getAssetAssignmentById(
    req.params.assignmentId
  );

  if (!assignment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Assignment not found");
  }

  res.status(httpStatus.OK).json({
    status: 200,
    success: true,
    message: "Assignment fetched successfully",
    data: assignment,
  });
});

export const getAssetsByDepartmentId = catchAsync(async (req, res) => {
  const { departmentId } = req.params;

  const rawOptions = pick(req.query, [
    "limit",
    "page",
    "sortBy",
    "sortType",
    "status",
    "createdAtFrom",
    "createdAtTo",
    "searchTerm",
  ]);

  const options = {
    limit: rawOptions.searchTerm
      ? 5
      : rawOptions.limit
      ? parseInt(rawOptions.limit as string, 10)
      : 10,
    page: rawOptions.page ? parseInt(rawOptions.page as string, 10) : 1,
    sortBy: rawOptions.sortBy as string,
    sortType: rawOptions.sortType as "asc" | "desc",
    status: rawOptions.status as string,
    createdAtFrom: rawOptions.createdAtFrom
      ? new Date(rawOptions.createdAtFrom as string)
      : undefined,
    createdAtTo: rawOptions.createdAtTo
      ? new Date(rawOptions.createdAtTo as string)
      : undefined,
    searchTerm: rawOptions.searchTerm as string,
  };

  const result = await assignAssetService.getAssetsByDepartmentId(
    departmentId,
    options
  );

  if (!result || result.data.length === 0) {
    res.status(httpStatus.OK).json({
      status: 404,
      message: "No assets found for this department",
      data: [],
      totalData: result?.total || 0,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil((result?.total || 0) / options.limit),
    });
    return;
  }

  res.status(httpStatus.OK).json({
    status: 200,
    success: true,
    message: "Assets fetched successfully",
    data: result.data,
    totalData: result.total,
    page: options.page,
    limit: options.limit,
    totalPages: Math.ceil(result.total / options.limit),
  });
});

export const getUsersByDepartmentId = catchAsync(async (req, res) => {
  const { departmentId } = req.params;

  const rawOptions = pick(req.query, [
    "limit",
    "page",
    "sortBy",
    "sortType",
    "status",
    "createdAtFrom",
    "createdAtTo",
    "searchTerm",
  ]);

  const options = {
    limit: rawOptions.searchTerm
      ? 5
      : rawOptions.limit
      ? parseInt(rawOptions.limit as string, 10)
      : 10,
    page: rawOptions.page ? parseInt(rawOptions.page as string, 10) : 1,
    sortBy: rawOptions.sortBy as string,
    sortType: rawOptions.sortType as "asc" | "desc",
    status: rawOptions.status as string,
    createdAtFrom: rawOptions.createdAtFrom
      ? new Date(rawOptions.createdAtFrom as string)
      : undefined,
    createdAtTo: rawOptions.createdAtTo
      ? new Date(rawOptions.createdAtTo as string)
      : undefined,
    searchTerm: rawOptions.searchTerm as string,
  };

  const result = await assignAssetService.getUsersByDepartmentId(
    departmentId,
    options
  );

  if (!result || result.data.length === 0) {
    res.status(httpStatus.OK).json({
      status: 404,
      message: "No users found for this department",
      data: [],
      totalData: result?.total || 0,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil((result?.total || 0) / options.limit),
    });
    return;
  }

  res.status(httpStatus.OK).json({
    status: 200,
    success: true,
    message: "Users fetched successfully",
    data: result.data,
    totalData: result.total,
    page: options.page,
    limit: options.limit,
    totalPages: Math.ceil(result.total / options.limit),
  });
});

const updateAssetAssignment = catchAsync(async (req, res) => {
  const { assignmentId } = req.params;
  const { assetId, userId } = req.body;

  const result = await assignAssetService.updateAssetAssignment(assignmentId, {
    assetId,
    userId,
  });

  res.status(httpStatus.OK).json({
    status: 200,
    success: true,
    message: "Asset assignment updated successfully",
    data: result,
  });
});

const deleteAssignment = catchAsync(async (req, res) => {
  const assignmentId = req.params.assignmentId;

  const result = await assignAssetService.deleteAssignmentById(assignmentId);

  res.status(httpStatus.NO_CONTENT).json({
    success: true,
    message: "Assignment deleted successfully",
    data: result,
  });
});

const bulkDeleteAssignments = catchAsync(async (req, res) => {
  const assignmentIds = req.body.assignmentIds;

  const result = await assignAssetService.deleteAssignmentsByIds(assignmentIds);

  res.status(httpStatus.NO_CONTENT).json({
    success: true,
    message: "Assignments deleted successfully",
    data: result,
  });
});

export default {
  assignAsset,
  unassignAsset,
  getAssetAssignments,
  getAvailableAssets,
  getUsersForAssignment,
  getAssetAssignmentById,
  getAssetsByDepartmentId,
  getUsersByDepartmentId,
  updateAssetAssignment,
  bulkDeleteAssignments,
  deleteAssignment,
};
