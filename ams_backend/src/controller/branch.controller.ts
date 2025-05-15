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

export const getAllBranches = catchAsync(async (req, res) => {
  const rawFilters = pick(req.query, [
    "branchName",
    "createdAtFrom",
    "createdAtTo",
    "searchTerm",
    "companyId",
  ]);

  let limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  let sortBy = (req.query.sortBy as string) || "createdAt";
  let sortType = (req.query.sortType as "asc" | "desc") || "desc";

  applyDateFilter(rawFilters);

  const filters: any = {};

  if (rawFilters.createdAtFrom || rawFilters.createdAtTo) {
    filters.createdAt = {};
    if (rawFilters.createdAtFrom)
      filters.createdAt.gte = rawFilters.createdAtFrom;
    if (rawFilters.createdAtTo) filters.createdAt.lte = rawFilters.createdAtTo;
  }

  if (rawFilters.branchName) {
    filters.branchName = {
      contains: rawFilters.branchName,
      mode: "insensitive",
    };
    limit = 1;
    sortBy = "createdAt";
    sortType = "desc";
  }

  if (rawFilters.companyId) {
    filters.companyId = rawFilters.companyId;
  }

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
            branchName: {
              contains: searchTerm,
              mode: "insensitive",
            },
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

  const result = await branchService.queryBranches(where, options);

  if (!result || result.data.length === 0) {
    res.status(httpStatus.OK).json({
      success: false,
      status: 404,
      message: "No branches found",
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
    message: "Branches fetched successfully",
    data: result.data,
    totalData: result.total,
    page,
    limit,
    totalPages: Math.ceil(result.total / limit),
    mode: isSearchMode ? "search" : "pagination",
  });
});

// getBranchById
const getBranchById = catchAsync(async (req, res) => {
  const branch = await branchService.getBranchById(req.params.branchId);

  if (!branch) {
    res.status(httpStatus.OK).json({
      status: 404,
      message: "No Branch found",
      data: [],
    });
    return;
  }
  res.status(httpStatus.OK).json({
    status: 200,
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
    res.status(httpStatus.OK).json({
      status: 200,
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
    res.send({ message: "Branch soft-deleted successfully" });
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
    res.status(httpStatus.OK).json({
      status: 404,
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
  res.status(httpStatus.OK).json({
    status: 200,
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
