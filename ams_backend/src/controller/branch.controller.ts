import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import catchAsync from "@/lib/catchAsync";
import { Branch } from "@prisma/client";
import branchService from "@/services/branch.service";
import { applyDateFilter } from "@/utils/filters.utils";
import pick from "@/lib/pick";
// createBranch
const createBranch = catchAsync(async (req, res) => {
  try {
    const branch = await branchService.createBranch({
      branchName: req.body.branchName,
      branchLocation: req.body.branchLocation,
      companyId: req.body.companyId,
    } as Branch);

    res.status(httpStatus.CREATED).send({
      branch,
      message: "Branch Created Successfully.",
    });
  } catch (error) {
    throw new ApiError(httpStatus.CONFLICT, error.message);
  }
});

const getAllBranches = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    "branchName",
    "location",
    "companyId",
    "from_date",
    "to_date",
  ]);
  const options = pick(req.query, ["sortBy", "sortType", "limit", "page"]);

  applyDateFilter(filter);

  if (filter.branchName) {
    filter.branchName = {
      contains: filter.branchName,
      mode: "insensitive",
    };
  }

  const result = await branchService.queryBranches(filter, options);

  if (!result || result.length === 0) {
    res.status(200).json({
      status: "404",
      message: "No Branches found",
      data: [],
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Branches fetched successfully",
    data: result,
  });
});

// getBranchById
const getBranchById = catchAsync(async (req, res) => {
  const branch = await branchService.getBranchById(req.params.branchId);

  if (!branch) {
    res.status(200).json({
      status: "404",
      message: "No Branch found",
      data: [],
    });
    return;
  }
  res.status(200).json({
    success: true,
    message: "Branch fetched successfully",
    data: branch,
  });
});
// updateBranch
const updateBranch = catchAsync(async (req, res) => {
  try {
    const branch = await branchService.updateBranchById(
      req.params.branchId,
      req.body
    );
    res.status(200).json({
      success: true,
      message: "Branch update successfully",
      data: branch,
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

export const deleteBranch = catchAsync(async (req, res) => {
  try {
    await branchService.deleteBranchById(req.params.branchId);
    res.status(httpStatus.NO_CONTENT);
    res.send({ message: "Branch deleted successfully" });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

export const deleteBranches = catchAsync(async (req, res) => {
  try {
    await branchService.deleteBranchesByIds(req.body.branchIds);
    res.status(httpStatus.NO_CONTENT);
    res.send({ message: "Branches deleted successfully" });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

export default {
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
  deleteBranches,
};
