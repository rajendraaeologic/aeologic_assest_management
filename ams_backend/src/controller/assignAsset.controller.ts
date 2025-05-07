import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import catchAsync from "@/lib/catchAsync";
import pick from "@/lib/pick";
import { applyDateFilter } from "@/utils/filters.utils";
import assignAssetService from "@/services/assignAsset.service";
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
    success: true,
    message: "Asset unassigned successfully",
    data: result,
  });
});

const getAssetAssignments = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["assetId", "userId", "status"]);
  const options = pick(req.query, ["from_date", "to_date"]);

  applyDateFilter(filter);

  const assignments = await assignAssetService.getAssetAssignments(filter, {
    limit: parseInt(req.query.limit as string) || 10,
    page: parseInt(req.query.page as string) || 1,
    sortBy: req.query.sortBy as string,
    sortType: req.query.sortType as "asc" | "desc",
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: assignments.length
      ? "Assignments fetched successfully"
      : "No assignments found",
    data: assignments,
  });
});

const getAvailableAssets = catchAsync(async (req, res) => {
  const assets = await assignAssetService.getAvailableAssets(
    req.query.branchId as string,
    req.query.departmentId as string
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: assets.length
      ? "Available assets fetched successfully"
      : "No available assets found",
    data: assets,
  });
});

const getUsersForAssignment = catchAsync(async (req, res) => {
  const users = await assignAssetService.getUsersForAssignment(
    req.query.branchId as string,
    req.query.departmentId as string
  );

  res.status(httpStatus.OK).json({
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
    res.status(200).json({
      status: "404",
      message: "No assets found for this department",
      data: [],
      totalData: result?.total || 0,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil((result?.total || 0) / options.limit),
    });
    return;
  }

  res.status(200).json({
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
    res.status(200).json({
      status: "404",
      message: "No users found for this department",
      data: [],
      totalData: result?.total || 0,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil((result?.total || 0) / options.limit),
    });
    return;
  }

  res.status(200).json({
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
