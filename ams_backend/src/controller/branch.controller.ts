import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import catchAsync from "@/lib/catchAsync";
import {Branch, User, UserRole} from "@prisma/client";
import branchService from "@/services/branch.service";
import { applyDateFilter } from "@/utils/filters.utils";
import pick from "@/lib/pick";
import db from "@/lib/db";

/**
 * @swagger
 * tags:
 *   name: Branches
 *   description: Branch management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Branch:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         branchName:
 *           type: string
 *         branchLocation:
 *           type: string
 *         companyId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         deleted:
 *           type: boolean
 *     BranchResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         branch:
 *           $ref: '#/components/schemas/Branch'
 *     BranchesListResponse:
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
 *             $ref: '#/components/schemas/Branch'
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
 * /branch/createBranch:
 *   post:
 *     summary: Create a new branch
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - branchName
 *               - state
 *               - city
 *               - companyId
 *             properties:
 *               branchName:
 *                 type: string
 *                 example: "Downtown Office"
 *               state:
 *                 type: string
 *                 example: "Delhi"
 *                 city:
 *                 type: string
 *                 example: "noida"
 *               companyId:
 *                 type: string
 *                 example: "comp123"
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 branch:
 *                   $ref: '#/components/schemas/Branch'
 *                 message:
 *                   type: string
 *                   example: "Branch Created Successfully."
 *       "400":
 *         description: Bad Request
 *       "409":
 *         description: Conflict (branch already exists)
 */
const createBranch = catchAsync(async (req, res) => {
  const user = req.user as User;

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  let companyId = user.companyId;
  if (user.userRole === UserRole.SUPERADMIN && req.body.companyId) {
    companyId = req.body.companyId;
  } else if (user.userRole !== UserRole.SUPERADMIN) {
    if (!user.companyId) {
      throw new ApiError(httpStatus.FORBIDDEN, "User is not associated with any company");
    }
    companyId = user.companyId;
  }

  if (!req.body.branchName || !req.body.state || !req.body.city) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing required fields");
  }

  try {
    const branch = await branchService.createBranch({
      branchName: req.body.branchName,
      state: req.body.state,
      city: req.body.city,
      companyId: companyId,
    } as Branch);

    res.status(httpStatus.CREATED).send({
      status: httpStatus.CREATED,
      success: true,
      message: "Branch Created Successfully",
      data: branch,
    });
  } catch (error) {
    throw new ApiError(httpStatus.CONFLICT, error.message);
  }
});

/**
 * @swagger
 * /branch/getAllBranches:
 *   get:
 *     summary: Get all branches
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branchName
 *         schema:
 *           type: string
 *         description: Filter by branch name
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *         description: Filter by company ID
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
 *         description: Search term for branch name
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
 *               $ref: '#/components/schemas/BranchesListResponse'
 *       "404":
 *         description: No branches found
 */
export const getAllBranches = catchAsync(async (req, res) => {
  const user = req.user as User;

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const rawFilters = pick(req.query, [
    "branchName",
    "state",
    "city",
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

  if (user.userRole === UserRole.SUPERADMIN) {
    if (rawFilters.companyId) {
      filters.companyId = rawFilters.companyId;
    }
  } else {
    if (!user.companyId) {
      throw new ApiError(httpStatus.FORBIDDEN, "User is not associated with any company");
    }
    filters.companyId = user.companyId;

    if (rawFilters.companyId && rawFilters.companyId !== user.companyId) {
      throw new ApiError(httpStatus.FORBIDDEN, "Access to this company's data is forbidden");
    }
  }

  if (rawFilters.state) {
    filters.state = {
      contains: rawFilters.state,
      mode: "insensitive",
    };
  }

  if (rawFilters.city) {
    filters.city = {
      contains: rawFilters.city,
      mode: "insensitive",
    };
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
          {
            state: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            city: {
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
    deleted: false,
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
      status: httpStatus.OK,
      success: false,
      message: "No branches found",
      data: {
        branches: [],
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
    message: "Branches fetched successfully",
    data: {
      branches: result.data,
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
 * /branch/{branchId}:
 *   get:
 *     summary: Get branch by ID
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
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
 *                   $ref: '#/components/schemas/Branch'
 *       "404":
 *         description: Branch not found
 */
const getBranchById = catchAsync(async (req, res) => {
  const user = req.user as User;
  const branch = await branchService.getBranchById(req.params.branchId);

  if (!branch) {
    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      success: false,
      message: "No Branch found",
      data: {
        branch: null,
      },
    });
    return;
  }

  if (user.userRole !== UserRole.SUPERADMIN && branch.companyId !== user.companyId) {
    throw new ApiError(httpStatus.FORBIDDEN, "Access to this branch is forbidden");
  }

  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    success: true,
    message: "Branch fetched successfully",
    data: {
      branch,
    },
  });
});

/**
 * @swagger
 * /branch/{branchId}:
 *   put:
 *     summary: Update branch
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               branchName:
 *                 type: string
 *                 example: "Updated Branch Name"
 *               branchLocation:
 *                 type: string
 *                 example: "Updated Location"
 *               companyId:
 *                 type: string
 *                 example: "comp123"
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
 *                   $ref: '#/components/schemas/Branch'
 *       "404":
 *         description: Branch not found
 */
const updateBranch = catchAsync(async (req, res) => {
  try {
    const branch = await branchService.updateBranchById(
      req.params.branchId,
      req.body
    );
    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      success: true,
      message: "Branch updated successfully",
      data: {
        branch,
      },
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

/**
 * @swagger
 * /branch/{branchId}:
 *   delete:
 *     summary: Delete branch (soft delete)
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
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
 *                   example: "Branch soft-deleted successfully"
 *       "404":
 *         description: Branch not found
 */
const deleteBranch = catchAsync(async (req, res) => {
  try {
    await branchService.deleteBranchById(req.params.branchId);
    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      success: true,
      message: "Branch soft-deleted successfully",
      data: null,
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

/**
 * @swagger
 * /branch/bulk-delete:
 *   post:
 *     summary: Bulk delete branches (soft delete)
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - branchIds
 *             properties:
 *               branchIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["branch1", "branch2"]
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
 *                   example: "Branches deleted successfully"
 *       "404":
 *         description: Branches not found
 */
const deleteBranches = catchAsync(async (req, res) => {
  try {
    await branchService.deleteBranchesByIds(req.body.branchIds);
    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      success: true,
      message: "Branches deleted successfully",
      data: null,
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

/**
 * @swagger
 * /branch/organization/{organizationId}:
 *   get:
 *     summary: Get branches by organization ID
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
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
 *         description: Field to sort by
 *       - in: query
 *         name: sortType
 *         schema:
 *           type: string
 *           enum: [asc, desc]
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
 *         description: Search term for branch name
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
 *                     $ref: '#/components/schemas/Branch'
 *                 totalData:
 *                   type: number
 *                 page:
 *                   type: number
 *                 limit:
 *                   type: number
 *                 totalPages:
 *                   type: number
 *       "404":
 *         description: No branches found for this organization
 */
export const getBranchesByOrganizationId = catchAsync(async (req, res) => {
  const user = req.user as User;
  const { organizationId } = req.params;

  if (user.userRole !== UserRole.SUPERADMIN && organizationId !== user.companyId) {
    throw new ApiError(httpStatus.FORBIDDEN, "Access to this organization's data is forbidden");
  }

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

  const result = await branchService.getBranchesByOrganizationId(
      organizationId,
      options
  );

  if (!result || result.data.length === 0) {
    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      success: false,
      message: "No branch found for this organization",
      data: {
        branches: [],
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
    message: "Branches fetched successfully",
    data: {
      branches: result.data,
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
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
  deleteBranches,
  getBranchesByOrganizationId,
};