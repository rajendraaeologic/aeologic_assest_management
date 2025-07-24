import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import catchAsync from "@/lib/catchAsync";
import pick from "@/lib/pick";
import { applyDateFilter } from "@/utils/filters.utils";
import assignAssetService from "@/services/assignAsset.service";
import {AssetStatus, PrismaClient, User, UserRole} from "@prisma/client";
import db from "@/lib/db";

const prisma = new PrismaClient();

const assignAsset = catchAsync(async (req, res) => {
  const { assetId, userId } = req.body;

  const result = await assignAssetService.assignAsset(assetId, userId);

  res.status(httpStatus.CREATED).json({
    statusCode: httpStatus.CREATED,
    message: "Asset assigned successfully",
    data: {
      assignment: result,
    },
  });

  const isAssetAvailable = await db.asset.findFirst({
    where: {
      id: assetId,
      status: AssetStatus.UNASSIGNED,
      assignedToUserId: null,
      AssetAssignment: {
        none: {
          status: AssetStatus.IN_USE,
        },
      },
    },
  });

  if (!isAssetAvailable) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "Asset is no longer available for assignment"
    );
  }
});

const unassignAsset = catchAsync(async (req, res) => {
  const { assignmentId } = req.params;

  const result = await assignAssetService.unassignAsset(assignmentId);

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: "Asset unassigned successfully",
    data: {
      assignment: result,
    },
  });
});

export const getAssetAssignments = catchAsync(async (req, res) => {
  const user = req.user as User;
  const rawFilters = pick(req.query, [
    "assetId",
    "userId",
    "status",
    "from_date",
    "to_date",
    "selectedDate",
    "searchTerm",
  ]);

  let limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  let sortBy = (req.query.sortBy as string) || "assignedAt";
  let sortType = (req.query.sortType as "asc" | "desc") || "desc";

  let dateFilter = {};
  if (rawFilters.selectedDate) {
    const selectedDate = new Date(rawFilters.selectedDate as string);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    dateFilter = {
      assignedAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    };
  } else if (rawFilters.from_date && rawFilters.to_date) {
    const fromDate = new Date(rawFilters.from_date as string);
    const toDate = new Date(rawFilters.to_date as string);

    toDate.setHours(23, 59, 59, 999);

    dateFilter = {
      assignedAt: {
        gte: fromDate,
        lte: toDate
      }
    };
  }

  let assetIds: string[] = [];
  let userIds: string[] = [];

  if (user.userRole !== UserRole.SUPERADMIN) {
    const companyBranches = await db.branch.findMany({
      where: { companyId: user.companyId },
      select: { id: true }
    });
    const branchIds = companyBranches.map(branch => branch.id);

  const companyDepartments = await db.department.findMany({
    where: { branchId: { in: branchIds } },
    select: { id: true }
  });
  const departmentIds = companyDepartments.map(dept => dept.id);

    const companyAssets = await db.asset.findMany({
      where: {
        OR: [
          { branchId: { in: branchIds } },
          { departmentId: { in: departmentIds } }
        ]
      },
      select: { id: true }
    });
    assetIds = companyAssets.map(asset => asset.id);

    const companyUsers = await db.user.findMany({
      where: { companyId: user.companyId },
      select: { id: true }
    });
    userIds = companyUsers.map(user => user.id);
  }

  const filters: any = {
    ...dateFilter,
    ...(user.userRole !== UserRole.SUPERADMIN ? {
      OR: [
        { assetId: { in: assetIds } },
        { userId: { in: userIds } }
      ]
    } : {})
  };

  if (rawFilters.assetId) filters.assetId = rawFilters.assetId;
  if (rawFilters.userId) filters.userId = rawFilters.userId;
  if (rawFilters.status) filters.status = rawFilters.status;

  const searchTerm = (rawFilters.searchTerm as string)?.trim();
  const isSearchMode = !!searchTerm;

  if (isSearchMode) {
    limit = 5;
    sortBy = "assignedAt";
    sortType = "desc";
  }

  const searchConditions = isSearchMode
    ? {
        asset: {
          assetName: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
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

  const result = await assignAssetService.getAssetAssignments(where, options);

  if (!result || result.data.length === 0) {
    const message = (rawFilters.selectedDate || (rawFilters.from_date && rawFilters.to_date))
        ? "No asset assignments found for the selected date range"
        : "No asset assignments found";

    res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      message,
      data: {
        assignments: [],
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
    statusCode: httpStatus.OK,
    message: "Asset assignments fetched successfully",
    data: {
      assignments: result.data,
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

const getAvailableAssets = catchAsync(async (req, res) => {
  const assets = await assignAssetService.getAvailableAssets(
    req.query.branchId as string,
    req.query.departmentId as string
  );

  if (assets.length === 0) {
    res.status(httpStatus.NOT_FOUND).json({
      statusCode: httpStatus.NOT_FOUND,
      message: "No available assets found",
      data: [],
    });
    return;
  }

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: "Available assets fetched successfully",
    data: assets,
  });
});

const getUsersForAssignment = catchAsync(async (req, res) => {
  const users = await assignAssetService.getUsersForAssignment(
    req.query.branchId as string,
    req.query.departmentId as string
  );

  res.status(httpStatus.OK).json({
    statusCode:httpStatus.OK,
    message: users.length ? "Users fetched successfully" : "No users found",
    data: users,
  });
});

export const getAssetsByDepartmentId = catchAsync(async (req, res) => {
  const { departmentId } = req.params;

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

  const result = await assignAssetService.getAssetsByDepartmentId(
    departmentId,
    options
  );

  if (!result || result.data.length === 0) {
    res.status(httpStatus.NOT_FOUND).json({
      statusCode: httpStatus.NOT_FOUND,
      message: "No assets found for this department",
      data: {
        assets: [],
        pagination: {
          totalData: result?.total || 0,
          page: options.page,
          limit: options.limit,
          totalPages: Math.ceil((result?.total || 0) / options.limit),
        },
      },
    });
    return;
  }

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: "Assets fetched successfully",
    data: {
      assets: result.data,
      pagination: {
        totalData: result.total,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(result.total / options.limit),
      },
    },
  });
});

export const getUsersByDepartmentId = catchAsync(async (req, res) => {
  const { departmentId } = req.params;

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

  const result = await assignAssetService.getUsersByDepartmentId(
    departmentId,
    options
  );

  if (!result || result.data.length === 0) {
    res.status(httpStatus.NOT_FOUND).json({
      statusCode: httpStatus.NOT_FOUND,
      message: "No users found for this department",
      data: {
        users: [],
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
    statusCode: httpStatus.OK,
    message: "Users fetched successfully",
    data: {
      users: result.data,
      pagination: {
        total: result.total,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(result.total / options.limit),
      },
    },
  });
});

const getAssetAssignmentById = catchAsync(async (req, res) => {
  const assignment = await assignAssetService.getAssetAssignmentById(
      req.params.assignmentId
  );

  if (!assignment) {
    res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      message: "Assignment not found",
      data: {
        assignment: null,
      },
    });
    return;
  }

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: "Assignment fetched successfully",
    data: {
      assignment,
    },
  });
});

const updateAssetAssignment = catchAsync(async (req, res) => {
  const { assignmentId } = req.params;
  const { assetId, userId } = req.body;

  const result = await assignAssetService.updateAssetAssignment(assignmentId, {
    assetId,
    userId,
  });

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: "Asset assignment updated successfully",
    data: {
      assignment: result,
    },
  });
});

const deleteAssignment = catchAsync(async (req, res) => {
  const assignmentId = req.params.assignmentId;

  const result = await assignAssetService.deleteAssignmentById(assignmentId);

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: "Assignment deleted successfully",
    data: {
      assignment: result,
    },
  });
});

const bulkDeleteAssignments = catchAsync(async (req, res) => {
  const assignmentIds = req.body.assignmentIds;

  const result = await assignAssetService.deleteAssignmentsByIds(assignmentIds);

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: "Assignments deleted successfully",
    data: {
      assignments: result,
    },
  });
});

/**
 * @swagger
 * tags:
 *   name: Asset Assignment
 *   description: Asset assignment management
 */

/**
 * @swagger
 * /assignments/assign:
 *   post:
 *     summary: Assign an asset to a user
 *     tags: [Asset Assignment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assetId
 *               - userId
 *             properties:
 *               assetId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Asset assigned successfully
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
 *                   example: "Asset assigned successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     assignment:
 *                       $ref: '#/components/schemas/AssetAssignment'
 *       409:
 *         description: Asset is not available for assignment
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /assignments/unassign/{assignmentId}:
 *   patch:
 *     summary: Unassign an asset
 *     tags: [Asset Assignment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Asset unassigned successfully
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
 *                   example: "Asset unassigned successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     assignment:
 *                       $ref: '#/components/schemas/AssetAssignment'
 *       404:
 *         description: Assignment not found
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /assignments:
 *   get:
 *     summary: Get all asset assignments
 *     tags: [Asset Assignment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: assetId
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: searchTerm
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
 *         description: Asset assignments fetched successfully
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
 *                   example: "Asset assignments fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     assignments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AssetAssignment'
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
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /assignments/available-assets:
 *   get:
 *     summary: Get available assets for assignment
 *     tags: [Asset Assignment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Available assets fetched successfully
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
 *                   example: "Available assets fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Asset'
 *       404:
 *         description: No available assets found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /assignments/available-users:
 *   get:
 *     summary: Get users available for asset assignment
 *     tags: [Asset Assignment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users fetched successfully
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
 *                   example: "Users fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /assignments/department-assets/{departmentId}:
 *   get:
 *     summary: Get assets by department ID
 *     tags: [Asset Assignment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
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
 *         description: Assets fetched successfully
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
 *                   example: "Assets fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     assets:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Asset'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalData:
 *                           type: number
 *                         page:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *       404:
 *         description: No assets found for this department
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /assignments/department-users/{departmentId}:
 *   get:
 *     summary: Get users by department ID
 *     tags: [Asset Assignment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
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
 *         description: Users fetched successfully
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
 *                   example: "Users fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
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
 *       404:
 *         description: No users found for this department
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /assignments/{assignmentId}:
 *   get:
 *     summary: Get asset assignment by ID
 *     tags: [Asset Assignment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignment fetched successfully
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
 *                   example: "Assignment fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     assignment:
 *                       $ref: '#/components/schemas/AssetAssignment'
 *       404:
 *         description: Assignment not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   patch:
 *     summary: Update asset assignment
 *     tags: [Asset Assignment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
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
 *               assetId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Asset assignment updated successfully
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
 *                   example: "Asset assignment updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     assignment:
 *                       $ref: '#/components/schemas/AssetAssignment'
 *       404:
 *         description: Assignment not found
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete an assignment
 *     tags: [Asset Assignment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignment deleted successfully
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
 *                   example: "Assignment deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     assignment:
 *                       $ref: '#/components/schemas/AssetAssignment'
 *       404:
 *         description: Assignment not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /assignments/bulk-delete:
 *   post:
 *     summary: Bulk delete assignments
 *     tags: [Asset Assignment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assignmentIds
 *             properties:
 *               assignmentIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Assignments deleted successfully
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
 *                   example: "Assignments deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     assignments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AssetAssignment'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AssetAssignment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         assetId:
 *           type: string
 *         userId:
 *           type: string
 *         assignedAt:
 *           type: string
 *           format: date-time
 *         returnedAt:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [IN_USE, RETURNED]
 *         asset:
 *           $ref: '#/components/schemas/Asset'
 *         user:
 *           $ref: '#/components/schemas/User'
 *     Asset:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         assetName:
 *           type: string
 *         assetTag:
 *           type: string
 *         serialNumber:
 *           type: string
 *         status:
 *           type: string
 *           enum: [UNASSIGNED, IN_USE, MAINTENANCE, RETIRED, LOST, STOLEN]
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         userRole:
 *           type: string
 *           enum: [SUPERADMIN, ADMIN, USER]
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

export default {
  assignAsset,
  unassignAsset,
  getAssetAssignments,
  getAvailableAssets,
  getUsersForAssignment,
  getAssetAssignmentById,
  getAssetsByDepartmentId,
  getUsersByDepartmentId,
  updateAssetAssignment,
  bulkDeleteAssignments,
  deleteAssignment,
};
