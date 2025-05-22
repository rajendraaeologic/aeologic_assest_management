import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import catchAsync from "@/lib/catchAsync";
import departmentService from "@/services/department.service";
import { Department } from "@prisma/client";
import pick from "@/lib/pick";
import { applyDateFilter } from "@/utils/filters.utils";

/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Department management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         departmentName:
 *           type: string
 *         branchId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     DepartmentResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         department:
 *           $ref: '#/components/schemas/Department'
 *     DepartmentsListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: number
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Department'
 *         totalData:
 *           type: number
 *         page:
 *           type: number
 *         limit:
 *           type: number
 *         totalPages:
 *           type: number
 *         mode:
 *           type: string
 */

/**
 * @swagger
 * /department/createDepartment:
 *   post:
 *     summary: Create a new department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - departmentName
 *               - branchId
 *             properties:
 *               departmentName:
 *                 type: string
 *                 example: "Human Resources"
 *               branchId:
 *                 type: string
 *                 example: "branch123"
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepartmentResponse'
 *       "400":
 *         description: Bad Request
 */

const createDepartment = catchAsync(async (req, res) => {
  try {
    const department = await departmentService.createDepartment({
      departmentName: req.body.departmentName,
      branchId: req.body.branchId,
    } as Department);

    res.status(httpStatus.CREATED).send({
      status: httpStatus.CREATED,
      success: true,
      message: "Department Created Successfully",
      data: {
        department,
      },
    });
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
});

/**
 * @swagger
 * /department/getAllDepartments:
 *   get:
 *     summary: Get all departments with filtering and pagination
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: departmentName
 *         schema:
 *           type: string
 *         description: Filter by department name
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *         description: Filter by branch ID
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter departments created after this date
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter departments created before this date
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search term for department name
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limit number of results
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortType
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepartmentsListResponse'
 *       "404":
 *         description: No departments found
 */

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
      status: httpStatus.OK,
      success: false,
      message: "No departments found",
      data: {
        departments: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
          mode: isSearchMode ? "search" : "pagination",
        },
      },
    });
    return;
  }

  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    success: true,
    message: "Departments fetched successfully",
    data: {
      departments: result.data,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
        mode: isSearchMode ? "search" : "pagination",
      },
    },
  });
});

/**
 * @swagger
 * /department/{id}:
 *   get:
 *     summary: Get department by ID
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Department'
 *       "404":
 *         description: Department not found
 */

const getDepartmentById = catchAsync(async (req, res) => {
  const department = await departmentService.getDepartmentById(req.params.id);

  if (!department) {
    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      success: false,
      message: "No Department found",
      data: {
        department: null,
      },
    });
    return;
  }
  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    success: true,
    message: "Department fetched successfully",
    data: {
      department,
    },
  });
});

/**
 * @swagger
 * /department/{departmentId}:
 *   put:
 *     summary: Update department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departmentName:
 *                 type: string
 *                 example: "Updated Department Name"
 *               branchId:
 *                 type: string
 *                 example: "updatedBranch123"
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Department'
 *       "404":
 *         description: Department not found
 */

const updateDepartment = catchAsync(async (req, res) => {
  try {
    const department = await departmentService.updateDepartmentById(
      req.params.departmentId,
      req.body
    );
    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      success: true,
      message: "Department updated successfully",
      data: {
        department,
      },
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

/**
 * @swagger
 * /department/{departmentId}:
 *   delete:
 *     summary: Delete department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     responses:
 *       "204":
 *         description: No Content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Department deleted successfully"
 *       "404":
 *         description: Department not found
 */

const deleteDepartment = catchAsync(async (req, res) => {
  try {
    await departmentService.deleteDepartmentById(req.params.departmentId);
    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      success: true,
      message: "Department deleted successfully",
      data: null,
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});


/**
 * @swagger
 * /department/bulk-delete:
 *   post:
 *     summary: Bulk delete departments
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - departmentIds
 *             properties:
 *               departmentIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["dept1", "dept2"]
 *     responses:
 *       "204":
 *         description: No Content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Departments deleted successfully"
 *       "404":
 *         description: Departments not found
 */

const deleteDepartments = catchAsync(async (req, res) => {
  try {
    await departmentService.deleteDepartmentsByIds(req.body.departmentIds);
    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      success: true,
      message: "Departments deleted successfully",
      data: null,
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

/**
 * @swagger
 * /department/branch/{branchId}:
 *   get:
 *     summary: Get departments by branch ID
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limit number of results
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortType
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: createdAtFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by creation date from
 *       - in: query
 *         name: createdAtTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by creation date to
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search term for department name
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Department'
 *                 totalData:
 *                   type: number
 *                 page:
 *                   type: number
 *                 limit:
 *                   type: number
 *                 totalPages:
 *                   type: number
 *       "404":
 *         description: No departments found for this branch
 */

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
      status: httpStatus.OK,
      success: false,
      message: "No departments found for this branch",
      data: {
        departments: [],
        pagination: {
          total: result?.total || 0,
          page: options.page,
          limit: options.limit,
          totalPages: Math.ceil((result?.total || 0) / options.limit),
        },
      },
    });
    return;
  }

  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    success: true,
    message: "Departments fetched successfully",
    data: {
      departments: result.data,
      pagination: {
        total: result.total,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(result.total / options.limit),
      },
    },
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
