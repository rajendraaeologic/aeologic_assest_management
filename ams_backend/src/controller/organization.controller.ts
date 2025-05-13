import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import catchAsync from "@/lib/catchAsync";
import { Organization } from "@prisma/client";
import pick from "@/lib/pick";
import organizationService from "@/services/organization.service";
import { applyDateFilter } from "@/utils/filters.utils";

// createOrganization
const createOrganization = catchAsync(async (req, res) => {
  try {
    const organization = await organizationService.createOrganization({
      organizationName: req.body.organizationName,
    } as Organization);

    res.status(httpStatus.CREATED).send({
      message: "Organization Created Successfully.",
      organization,
    });
  } catch (error) {
    throw new ApiError(httpStatus.CONFLICT, error.message);
  }
});

export const getAllOrganizations = catchAsync(async (req, res) => {
  const rawFilters = pick(req.query, [
    "organizationName",
    "createdAtFrom",
    "createdAtTo",
    "searchTerm",
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

  if (rawFilters.organizationName) {
    filters.organizationName = {
      contains: rawFilters.organizationName,
      mode: "insensitive",
    };
    limit = 1;
    sortBy = "createdAt";
    sortType = "desc";
  }

  const searchTerm = (rawFilters.searchTerm as string)?.trim();

  // Apply special logic if searchTerm is present
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
            organizationName: {
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

  const result = await organizationService.queryOrganizations(where, options);

  if (!result || result.data.length === 0) {
    res.status(httpStatus.OK).json({
      success: false,
      status: 404,
      message: "No organizations found",
      data: [],
      totalData: 0,
      page,
      limit,
      totalPages: 0,
      mode: isSearchMode ? "search" : "pagination",
    });
  }

  res.status(httpStatus.OK).json({
    status: 200,
    success: true,
    message: "Organizations fetched successfully",
    data: result.data,
    totalData: result.total,
    page,
    limit,
    totalPages: Math.ceil(result.total / limit),
    mode: isSearchMode ? "search" : "pagination",
  });
});

//getOrganizationById
const getOrganizationById = catchAsync(async (req, res) => {
  const result = await organizationService.getOrganizationById(
    req.params.organizationId
  );

  if (!result) {
    res.status(httpStatus.OK).json({
      status: 404,
      message: "No organization found",
      data: [],
    });
    return;
  }
  res.status(httpStatus.OK).json({
    status: 200,
    success: true,
    message: "Organization fetched successfully",
    data: result,
  });
});

const updateOrganization = catchAsync(async (req, res) => {
  try {
    const result = await organizationService.updateOrganizationById(
      req.params.organizationId,
      req.body
    );
    res.status(httpStatus.OK).json({
      status: 200,
      success: true,
      message: "Organization update successfully",
      data: result,
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

// deleteDepartment
const deleteOrganization = catchAsync(async (req, res) => {
  try {
    await organizationService.deleteOrganizationById(req.params.organizationId);
    res.status(httpStatus.NO_CONTENT);
    res.send({ message: "Organization deleted successfully" });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

//bulkDeleteOrganizations

const bulkDeleteOrganizations = catchAsync(async (req, res) => {
  try {
    await organizationService.deleteOrganizationsByIds(
      req.body.organizationIds
    );
    res.status(httpStatus.NO_CONTENT);
    res.send({ message: "Organizations deleted successfully" });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

export default {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  bulkDeleteOrganizations,
};
