import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import catchAsync from "@/lib/catchAsync";
import pick from "@/lib/pick";
import { applyDateFilter } from "@/utils/filters.utils";
import assignAssetService from "@/services/assignasset.service";
import { AssetStatus, PrismaClient } from "@prisma/client";
import db from "@/lib/db";

const prisma = new PrismaClient();

/**
 * @swagger
 * tags:
 *   name: Asset Assignments
 *   description: Asset assignment management
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
 *         status:
 *           type: string
 *           enum: [ASSIGNED, UNASSIGNED, IN_USE]
 *         assignedAt:
 *           type: string
 *           format: date-time
 *         unassignedAt:
 *           type: string
 *           format: date-time
 *         asset:
 *           $ref: '#/components/schemas/Asset'
 *         user:
 *           $ref: '#/components/schemas/User'
 *     AssetAssignmentResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/AssetAssignment'
 *     AssetAssignmentsListResponse:
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
 *             $ref: '#/components/schemas/AssetAssignment'
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
 *     AvailableAssetsResponse:
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
 *             $ref: '#/components/schemas/Asset'
 *     UsersForAssignmentResponse:
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
 *             $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /assignAsset/asset-assignments:
 *   post:
 *     summary: Assign asset to user
 *     tags: [Asset Assignments]
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
 *                 example: "asset123"
 *               userId:
 *                 type: string
 *                 example: "user456"
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssetAssignmentResponse'
 *       "400":
 *         description: Bad Request
 *       "404":
 *         description: Asset or User not found
 *       "409":
 *         description: Asset is not available for assignment
 */
const assignAsset = catchAsync(async (req, res) => {
  const { assetId, userId } = req.body;

  const result = await assignAssetService.assignAsset(assetId, userId);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Asset assigned successfully",
    data: result,
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
    status: 200,
    success: true,
    message: "Asset unassigned successfully",
    data: result,
  });
});

/**
 * @swagger
 * /assignAsset/asset-assignments:
 *   get:
 *     summary: Get all asset assignments with filtering
 *     tags: [Asset Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: assetId
 *         schema:
 *           type: string
 *         description: Filter by asset ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ASSIGNED, UNASSIGNED, IN_USE]
 *         description: Filter by assignment status
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter assignments after this date
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter assignments before this date
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search term for asset name
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
 *           default: assignedAt
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
 *               $ref: '#/components/schemas/AssetAssignmentsListResponse'
 *       "404":
 *         description: No assignments found
 */
export const getAssetAssignments = catchAsync(async (req, res) => {
  const rawFilters = pick(req.query, [
    "assetId",
    "userId",
    "status",
    "from_date",
    "to_date",
    "searchTerm",
  ]);

  let limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  let sortBy = (req.query.sortBy as string) || "assignedAt";
  let sortType = (req.query.sortType as "asc" | "desc") || "desc";

  applyDateFilter(rawFilters);

  const filters: any = {};

  if (rawFilters.from_date || rawFilters.to_date) {
    filters.assignedAt = {};
    if (rawFilters.from_date) filters.assignedAt.gte = rawFilters.from_date;
    if (rawFilters.to_date) filters.assignedAt.lte = rawFilters.to_date;
  }

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

  const result = await assignAssetService.getAssetAssignments(where, {
    limit,
    page,
    sortBy,
    sortType,
  });

  if (!result || result.data.length === 0) {
    res.status(httpStatus.OK).json({
      success: false,
      status: 404,
      message: "No asset assignments found",
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
    message: "Asset assignments fetched successfully",
    data: result.data,
    totalData: result.total,
    page,
    limit,
    totalPages: Math.ceil(result.total / limit),
    mode: isSearchMode ? "search" : "pagination",
  });
});

/**
 * @swagger
 * /assignAsset/available-assets:
 *   get:
 *     summary: Get available assets for assignment
 *     tags: [Asset Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *         description: Filter by branch ID
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AvailableAssetsResponse'
 *       "404":
 *         description: No available assets found
 */
const getAvailableAssets = catchAsync(async (req, res) => {
  const assets = await assignAssetService.getAvailableAssets(
    req.query.branchId as string,
    req.query.departmentId as string
  );

  if (assets.length === 0) {
    res.status(httpStatus.OK).json({
      status: 404,
      success: false,
      message: "No available assets found",
      data: [],
    });
    return;
  }

  res.status(httpStatus.OK).json({
    status: 200,
    success: true,
    message: "Available assets fetched successfully",
    data: assets,
  });
});

/**
 * @swagger
 * /assignAsset/assignable-users:
 *   get:
 *     summary: Get users available for asset assignment
 *     tags: [Asset Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *         description: Filter by branch ID
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsersForAssignmentResponse'
 */
const getUsersForAssignment = catchAsync(async (req, res) => {
  const users = await assignAssetService.getUsersForAssignment(
    req.query.branchId as string,
    req.query.departmentId as string
  );

  res.status(httpStatus.OK).json({
    status: 200,
    success: true,
    message: users.length ? "Users fetched successfully" : "No users found",
    data: users,
  });
});

/**
 * @swagger
 * /assignAsset/{departmentId}/assets:
 *   get:
 *     summary: Get assets by department ID
 *     tags: [Asset Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
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
 *         description: Search term
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AvailableAssetsResponse'
 *       "404":
 *         description: No assets found for this department
 */
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
    res.status(httpStatus.OK).json({
      status: 404,
      message: "No assets found for this department",
      data: [],
      totalData: result?.total || 0,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil((result?.total || 0) / options.limit),
    });
    return;
  }

  res.status(httpStatus.OK).json({
    status: 200,
    success: true,
    message: "Assets fetched successfully",
    data: result.data,
    totalData: result.total,
    page: options.page,
    limit: options.limit,
    totalPages: Math.ceil(result.total / options.limit),
  });
});

/**
 * @swagger
 * /assignAsset/{departmentId}/users:
 *   get:
 *     summary: Get users by department ID
 *     tags: [Asset Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
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
 *         description: Search term
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsersForAssignmentResponse'
 *       "404":
 *         description: No users found for this department
 */
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
    res.status(httpStatus.OK).json({
      status: 404,
      message: "No users found for this department",
      data: [],
      totalData: result?.total || 0,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil((result?.total || 0) / options.limit),
    });
    return;
  }

  res.status(httpStatus.OK).json({
    status: 200,
    success: true,
    message: "Users fetched successfully",
    data: result.data,
    totalData: result.total,
    page: options.page,
    limit: options.limit,
    totalPages: Math.ceil(result.total / options.limit),
  });
});

/**
 * @swagger
 * /assignAsset/{assignmentId}:
 *   get:
 *     summary: Get asset assignment by ID
 *     tags: [Asset Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Assignment ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssetAssignmentResponse'
 *       "404":
 *         description: Assignment not found
 */
const getAssetAssignmentById = catchAsync(async (req, res) => {
  const assignment = await assignAssetService.getAssetAssignmentById(
      req.params.assignmentId
  );

  if (!assignment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Assignment not found");
  }

  res.status(httpStatus.OK).json({
    status: 200,
    success: true,
    message: "Assignment fetched successfully",
    data: assignment,
  });
});

/**
 * @swagger
 * /assignAsset/{assignmentId}:
 *   put:
 *     summary: Update asset assignment
 *     tags: [Asset Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Assignment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assetId:
 *                 type: string
 *                 example: "newAsset123"
 *               userId:
 *                 type: string
 *                 example: "newUser456"
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssetAssignmentResponse'
 *       "404":
 *         description: Assignment not found
 */
const updateAssetAssignment = catchAsync(async (req, res) => {
  const { assignmentId } = req.params;
  const { assetId, userId } = req.body;

  const result = await assignAssetService.updateAssetAssignment(assignmentId, {
    assetId,
    userId,
  });

  res.status(httpStatus.OK).json({
    status: 200,
    success: true,
    message: "Asset assignment updated successfully",
    data: result,
  });
});

/**
 * @swagger
 * /assignAsset/{assignmentId}:
 *   delete:
 *     summary: Delete asset assignment
 *     tags: [Asset Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Assignment ID
 *     responses:
 *       "204":
 *         description: No Content *         :
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       "404":
 *         description: Assignment not found
 */
const deleteAssignment = catchAsync(async (req, res) => {
  const assignmentId = req.params.assignmentId;

  const result = await assignAssetService.deleteAssignmentById(assignmentId);

  res.status(httpStatus.NO_CONTENT).json({
    success: true,
    message: "Assignment deleted successfully",
    data: result,
  });
});

/**
 * @swagger
 * /assignAsset/bulk-delete:
 *   post:
 *     summary: Bulk delete asset assignments
 *     tags: [Asset Assignments]
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
 *                 example: ["assign1", "assign2"]
 *     responses:
 *       "204":
 *         description: No Content *         :
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
const bulkDeleteAssignments = catchAsync(async (req, res) => {
  const assignmentIds = req.body.assignmentIds;

  const result = await assignAssetService.deleteAssignmentsByIds(assignmentIds);

  res.status(httpStatus.NO_CONTENT).json({
    success: true,
    message: "Assignments deleted successfully",
    data: result,
  });
});

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
