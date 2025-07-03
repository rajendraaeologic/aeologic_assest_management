import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import catchAsync from "@/lib/catchAsync";
import {Branch, User, UserRole} from "@prisma/client";
import branchService from "@/services/branch.service";
import { applyDateFilter } from "@/utils/filters.utils";
import pick from "@/lib/pick";
import db from "@/lib/db";

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

export const getAllBranches = catchAsync(async (req, res) => {
  const user = req.user as User;

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const rawFilters = pick(req.query, [
    "branchName",
    "state",
    "city",
    "from_date",
    "to_date",
    "selectedDate",
    "searchTerm",
    "companyId",
  ]);

  let limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  let sortBy = (req.query.sortBy as string) || "createdAt";
  let sortType = (req.query.sortType as "asc" | "desc") || "desc";

  let dateFilter = {};
  if (rawFilters.selectedDate) {
    const selectedDate = new Date(rawFilters.selectedDate as string);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    dateFilter = {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    };
  } else if (rawFilters.from_date && rawFilters.to_date) {
    const fromDate = new Date(rawFilters.from_date as string);
    const toDate = new Date(rawFilters.to_date as string);

    toDate.setHours(23, 59, 59, 999);

    dateFilter = {
      createdAt: {
        gte: fromDate,
        lte: toDate
      }
    };
  }

  const filters: any = {
    ...dateFilter,
    deleted: false
  };

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
          { branchName: { contains: searchTerm, mode: "insensitive" } },
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
    const message = (rawFilters.selectedDate || (rawFilters.from_date && rawFilters.to_date))
        ? "No branches found for the selected date range"
        : "No branches found";

    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      success: false,
      message,
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

const exportBranchesToExcel = catchAsync(async (req, res) => {
  const user = req.user as User;
  const filters = {
    branchName: req.query.branchName as string,
    state: req.query.state as string,
    city: req.query.city as string,
    companyId: req.query.companyId as string,
    searchTerm: req.query.searchTerm as string,
    from_date: req.query.from_date as string,
    to_date: req.query.to_date as string,
    selectedDate: req.query.selectedDate as string,
  };

  // Validate companyId for non-superadmins
  if (user.userRole !== UserRole.SUPERADMIN) {
    if (filters.companyId && filters.companyId !== user.companyId) {
      throw new ApiError(httpStatus.FORBIDDEN, "Access to this company's data is forbidden");
    }
    filters.companyId = user.companyId;
  }

  const buffer = await branchService.exportBranchesToExcelService(user, filters);

  const fileName = `branches_export_${new Date().toISOString().split('T')[0]}.xlsx`;
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.status(httpStatus.OK).send(buffer);
});

/**
 * @swagger
 * tags:
 *   name: Branches
 *   description: Branch management
 */

/**
 * @swagger
 * /branches:
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
 *             properties:
 *               branchName:
 *                 type: string
 *               state:
 *                 type: string
 *               city:
 *                 type: string
 *               companyId:
 *                 type: string
 *                 description: Required only for SUPERADMIN
 *     responses:
 *       201:
 *         description: Branch created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 201
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Branch Created Successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Branch'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (user not associated with company)
 *       409:
 *         description: Conflict (branch already exists)
 *       500:
 *         description: Internal server error
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
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: createdAtFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: createdAtTo
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortType
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Branches fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Branches fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     branches:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Branch'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         page:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                         mode:
 *                           type: string
 *                           enum: [search, pagination]
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (access to company data not allowed)
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /branches/{branchId}:
 *   get:
 *     summary: Get a branch by ID
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Branch fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Branch fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     branch:
 *                       $ref: '#/components/schemas/Branch'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (access to branch not allowed)
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Internal server error
 *   patch:
 *     summary: Update a branch
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               branchName:
 *                 type: string
 *               state:
 *                 type: string
 *               city:
 *                 type: string
 *     responses:
 *       200:
 *         description: Branch updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Branch updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     branch:
 *                       $ref: '#/components/schemas/Branch'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (access to branch not allowed)
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a branch (soft delete)
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Branch soft-deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Branch soft-deleted successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (access to branch not allowed)
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /branches/bulk-delete:
 *   post:
 *     summary: Bulk delete branches
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
 *     responses:
 *       200:
 *         description: Branches deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Branches deleted successfully"
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (access to branches not allowed)
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /branches/organization/{organizationId}:
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortType
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: createdAtFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: createdAtTo
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Branches fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Branches fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     branches:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Branch'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         page:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (access to organization data not allowed)
 *       404:
 *         description: No branches found for this organization
 *       500:
 *         description: Internal server error
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
 *         state:
 *           type: string
 *         city:
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
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

export default {
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
  deleteBranches,
  getBranchesByOrganizationId,
  exportBranchesToExcel,
};