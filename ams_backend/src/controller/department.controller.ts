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

    res
      .status(httpStatus.CREATED)
      .send({ department, message: "Department Created Successfully." });
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
});

// getAllDepartments

const getAllDepartments = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    "departmentName",
    "location",
    "branchId",
    "from_date",
    "to_date",
  ]);
  const options = pick(req.query, ["sortBy", "sortType", "limit", "page"]);

  applyDateFilter(filter);

  if (filter.departmentName) {
    filter.departmentName = {
      contains: filter.departmentName,
      mode: "insensitive",
    };
  }

  const result = await departmentService.queryDepartments(filter, options);

  if (!result || result.length === 0) {
    res.status(200).json({
      status: "404",
      message: "No Departments found",
      data: [],
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Departments fetched successfully",
    data: result,
  });
});

// getDepartmentById

const getDepartmentById = catchAsync(async (req, res) => {
  const department = await departmentService.getDepartmentById(req.params.id);

  if (!department) {
    res.status(200).json({
      status: "404",
      message: "No Department found",
      data: [],
    });
    return;
  }
  res.status(200).json({
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
    res.status(200).json({
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

const getDepartmentsByBranchId = catchAsync(async (req, res) => {
  const { branchId } = req.params;

  const departments = await departmentService.getDepartmentsByBranchId(
    branchId
  );

  if (!departments || departments.length === 0) {
    res.status(200).json({
      status: "404",
      message: "No departments found for this branch",
      data: [],
    });
    return;
  }

  res.status(200).json({
    status: "200",
    message: "Branches fetched successfully",
    data: departments,
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
