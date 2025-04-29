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
      success: true,
      message: "Asset Created Successfully",
      data: asset,
    });
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
});

const getAllAssets = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    "assetName",
    "status",
    "branchId",
    "departmentId",
    "from_date",
    "to_date",
  ]);
  const options = pick(req.query, ["sortBy", "sortType", "limit", "page"]);

  applyDateFilter(filter);
  const result = await prisma.asset.findMany({
    where: filter,
    select: AssetKeys,
  });

  res.status(200).json({
    success: true,
    message:
      result.length > 0 ? "Assets fetched successfully" : "No Assets found",
    data: result,
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

  res.status(200).json({
    success: true,
    message: "Asset fetched successfully",
    data: asset,
  });
});

const updateAsset = catchAsync(async (req, res) => {
  const asset = await prisma.asset.update({
    where: { id: req.params.assetId },
    data: req.body,
    select: AssetKeys,
  });

  res.status(200).json({
    success: true,
    message: "Asset updated successfully",
    data: asset,
  });
});

const deleteAsset = catchAsync(async (req, res) => {
  await prisma.asset.delete({
    where: { id: req.params.assetId },
  });

  res.status(httpStatus.NO_CONTENT).json({
    success: true,
    message: "Asset deleted successfully",
  });
});

const bulkDeleteAssets = catchAsync(async (req, res) => {
  await prisma.asset.deleteMany({
    where: { id: { in: req.body.assetIds } },
  });

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
