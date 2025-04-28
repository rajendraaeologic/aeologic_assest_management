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

const deleteBranch = catchAsync(async (req, res) => {
  try {
    await branchService.deleteBranchById(req.params.branchId);
    res.status(httpStatus.NO_CONTENT);
    res.send({ message: "Branch deleted successfully" });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

const deleteBranches = catchAsync(async (req, res) => {
  try {
    await branchService.deleteBranchesByIds(req.body.branchIds);
    res.status(httpStatus.NO_CONTENT);
    res.send({ message: "Branches deleted successfully" });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

export const getBranchesByOrganizationId = catchAsync(async (req, res) => {
  const { organizationId } = req.params;

  // Extracting query parameters from the request
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

  // Setting options for pagination, sorting, and filtering
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

  // Fetching branches from the service
  const result = await branchService.getBranchesByOrganizationId(
    organizationId,
    options
  );
  if (!result || result.data.length === 0) {
    res.status(200).json({
      status: "404",
      message: "No barnch found for this organizations",
      data: [],
      totalData: result.total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(result.total / options.limit),
    });
    return;
  }

  // Sending response back to the client
  res.status(200).json({
    success: true,
    message: "Branches fetched successfully",
    data: result.data,
    totalData: result.total,
    page: options.page,
    limit: options.limit,
    totalPages: Math.ceil(result.total / options.limit),
  });
});

export default {
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
  deleteBranches,
  getBranchesByOrganizationId,
};
