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

    res
      .status(httpStatus.CREATED)
      .send({ organization, message: "Organization Created Successfully." });
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

  // ✅ Apply special logic if searchTerm is present
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
          {
            branches: {
              some: {
                OR: [
                  {
                    branchName: {
                      contains: searchTerm,
                      mode: "insensitive",
                    },
                  },
                  {
                    branchLocation: {
                      contains: searchTerm,
                      mode: "insensitive",
                    },
                  },
                  {
                    departments: {
                      some: {
                        departmentName: {
                          contains: searchTerm,
                          mode: "insensitive",
                        },
                      },
                    },
                  },
                  {
                    users: {
                      some: {
                        OR: [
                          {
                            userName: {
                              contains: searchTerm,
                              mode: "insensitive",
                            },
                          },
                          {
                            email: {
                              contains: searchTerm,
                              mode: "insensitive",
                            },
                          },
                        ],
                      },
                    },
                  },
                  {
                    assets: {
                      some: {
                        assetName: {
                          contains: searchTerm,
                          mode: "insensitive",
                        },
                      },
                    },
                  },
                ],
              },
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
    res.status(200).json({
      success: false,
      status: "404",
      message: "No organizations found",
      data: [],
      totalData: 0,
      page,
      limit,
      totalPages: 0,
      mode: isSearchMode ? "search" : "pagination",
    });
  }

  res.status(200).json({
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
    res.status(200).json({
      status: "404",
      message: "No organization found",
      data: [],
    });
    return;
  }
  res.status(200).json({
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
    res.status(200).json({
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

//searchOrganizations
const searchOrganizations = catchAsync(async (req, res) => {
  const { searchTerm } = req.query;
  const rawOptions = pick(req.query, ["sortBy", "sortType", "limit", "page"]);

  const options: {
    limit: number;
    page: number;
    sortBy?: string;
    sortType?: "asc" | "desc";
  } = {
    limit: 10,
    page: 1,
  };

  if (rawOptions.limit) {
    options.limit = parseInt(rawOptions.limit as string, 10);
  }
  if (rawOptions.page) {
    options.page = parseInt(rawOptions.page as string, 10);
  }

  if (rawOptions.sortBy) options.sortBy = rawOptions.sortBy as string;
  if (rawOptions.sortType)
    options.sortType = rawOptions.sortType as "asc" | "desc";

  if (!searchTerm) {
    res.status(400).json({
      success: false,
      message: "Search term is required",
    });
    return;
  }

  const result = await organizationService.searchOrganizations(
    searchTerm as string,
    options
  );

  res.status(200).json({
    success: true,
    message: "Search results fetched successfully",
    data: result.data,
    totalData: result.total,
    page: options.page,
    limit: options.limit,
    totalPages: Math.ceil(result.total / options.limit),
  });
});

export default {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  bulkDeleteOrganizations,
  searchOrganizations,
};
