import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import catchAsync from "@/lib/catchAsync";
import departmentService from "@/services/department.service";
import { Department } from "@prisma/client";
import pick from "@/lib/pick";
import { applyDateFilter } from "@/utils/filters.utils";

const createDepartment = catchAsync(async (req, res) => {
  try {
    const department = await departmentService.createDepartment({
      departmentName: req.body.departmentName,
      branchId: req.body.branchId,
    } as Department);

    res.status(httpStatus.CREATED).send({
      department,

      message: "Department Created Successfully.",
    });
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
});

// getAllDepartments

export const getAllDepartments = catchAsync(async (req, res) => {
  const rawFilters = pick(req.query, [
    "departmentName",
    "location",
    "branchId",
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

  if (rawFilters.departmentName) {
    filters.departmentName = {
      contains: rawFilters.departmentName,
      mode: "insensitive",
    };
    limit = 1;
    sortBy = "createdAt";
    sortType = "desc";
  }

  if (rawFilters.branchId) {
    filters.branchId = rawFilters.branchId;
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
            departmentName: {
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

  const result = await departmentService.queryDepartments(where, options);

  if (!result || result.data.length === 0) {
    res.status(httpStatus.OK).json({
      success: false,
      status: 404,
      message: "No departments found",
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
    message: "Departments fetched successfully",
    data: result.data,
    totalData: result.total,
    page,
    limit,
    totalPages: Math.ceil(result.total / limit),
    mode: isSearchMode ? "search" : "pagination",
  });
});

// getDepartmentById

const getDepartmentById = catchAsync(async (req, res) => {
  const department = await departmentService.getDepartmentById(req.params.id);

  if (!department) {
    res.status(httpStatus.OK).json({
      status: 404,
      message: "No Department found",
      data: [],
    });
    return;
  }
  res.status(httpStatus.OK).json({
    status: 200,
    success: true,
    message: "Department fetched successfully",
    data: department,
  });
});

// updateDepartment
const updateDepartment = catchAsync(async (req, res) => {
  try {
    const department = await departmentService.updateDepartmentById(
      req.params.departmentId,
      req.body
    );
    res.status(httpStatus.OK).json({
      status: 200,
      success: true,
      message: "Department update successfully",
      data: department,
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

// deleteDepartment
const deleteDepartment = catchAsync(async (req, res) => {
  try {
    await departmentService.deleteDepartmentById(req.params.departmentId);
    res.status(httpStatus.NO_CONTENT);
    res.send({ message: "Department deleted successfully" });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

//deleteDepartments

const deleteDepartments = catchAsync(async (req, res) => {
  try {
    await departmentService.deleteDepartmentsByIds(req.body.departmentIds);
    res.status(httpStatus.NO_CONTENT);
    res.send({ message: "Departments deleted successfully" });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

export const getDepartmentsByBranchId = catchAsync(async (req, res) => {
  const { branchId } = req.params;

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

  const result = await departmentService.getDepartmentsByBranchId(
    branchId,
    options
  );

  if (!result || result.data.length === 0) {
    res.status(httpStatus.OK).json({
      status: 404,
      message: "No departments found for this branch",
      data: [],
      totalData: result.total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(result.total / options.limit),
    });
    return;
  }

  res.status(httpStatus.OK).json({
    status: 200,
    success: true,
    message: "Departments fetched successfully",
    data: result.data,
    totalData: result.total,
    page: options.page,
    limit: options.limit,
    totalPages: Math.ceil(result.total / options.limit),
  });
});

export default {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  deleteDepartments,
  getDepartmentsByBranchId,
};
