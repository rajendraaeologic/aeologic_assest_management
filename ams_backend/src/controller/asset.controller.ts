import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import catchAsync from "@/lib/catchAsync";
import pick from "@/lib/pick";
import { applyDateFilter } from "@/utils/filters.utils";
import { PrismaClient } from "@prisma/client";
import {
  AssetKeys,
  AssetAssignmentKeys,
  AssetHistoryKeys,
} from "../utils/selects.utils";
import { assetService } from "@/services";

const prisma = new PrismaClient();

/**
 * @swagger
 * tags:
 *   name: Assets
 *   description: Asset management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Asset:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         assetName:
 *           type: string
 *         uniqueId:
 *           type: string
 *         brand:
 *           type: string
 *         model:
 *           type: string
 *         serialNumber:
 *           type: string
 *         status:
 *           type: string
 *         description:
 *           type: string
 *         branchId:
 *           type: string
 *         departmentId:
 *           type: string
 *         companyId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     AssetResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/Asset'
 *     AssetsListResponse:
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
 *     AssetHistory:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         assetId:
 *           type: string
 *         action:
 *           type: string
 *         userId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /asset/createAsset:
 *   post:
 *     summary: Create a new asset
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assetName
 *               - uniqueId
 *             properties:
 *               assetName:
 *                 type: string
 *                 example: "Laptop"
 *               uniqueId:
 *                 type: string
 *                 example: "LP-001"
 *               brand:
 *                 type: string
 *                 example: "Dell"
 *               model:
 *                 type: string
 *                 example: "XPS 15"
 *               serialNumber:
 *                 type: string
 *                 example: "SN123456789"
 *               status:
 *                 type: string
 *                 example: "AVAILABLE"
 *               description:
 *                 type: string
 *                 example: "High performance laptop"
 *               branchId:
 *                 type: string
 *                 example: "branch123"
 *               departmentId:
 *                 type: string
 *                 example: "dept456"
 *               companyId:
 *                 type: string
 *                 example: "company789"
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssetResponse'
 *       "400":
 *         description: Bad Request
 */
const createAsset = catchAsync(async (req, res) => {
  try {
    const asset = await assetService.createAsset({
      assetName: req.body.assetName,
      uniqueId: req.body.uniqueId,
      brand: req.body.brand,
      model: req.body.model,
      serialNumber: req.body.serialNumber,
      status: req.body.status,
      description: req.body.description,
      branchId: req.body.branchId,
      departmentId: req.body.departmentId,
      companyId: req.body.companyId,
    });

    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Asset Created Successfully",
      data: asset,
    });
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
});

/**
 * @swagger
 * /asset/getAllAssets:
 *   get:
 *     summary: Get all assets with filtering and pagination
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: assetName
 *         schema:
 *           type: string
 *         description: Filter by asset name
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
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
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter assets created after this date
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter assets created before this date
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search term for asset name, serial number, or unique ID
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
 *               $ref: '#/components/schemas/AssetsListResponse'
 *       "404":
 *         description: No assets found
 */
export const getAllAssets = catchAsync(async (req, res) => {
  const rawFilters = pick(req.query, [
    "assetName",
    "status",
    "branchId",
    "departmentId",
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

  if (rawFilters.assetName) {
    filters.assetName = {
      contains: rawFilters.assetName,
      mode: "insensitive",
    };
    limit = 1;
    sortBy = "createdAt";
    sortType = "desc";
  }

  if (rawFilters.branchId) filters.branchId = rawFilters.branchId;
  if (rawFilters.departmentId) filters.departmentId = rawFilters.departmentId;
  if (rawFilters.status) filters.status = rawFilters.status;

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
            assetName: { contains: searchTerm, mode: "insensitive" },
          },
          {
            serialNumber: { contains: searchTerm, mode: "insensitive" },
          },
          {
            uniqueId: { contains: searchTerm, mode: "insensitive" },
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

  const result = await assetService.queryAssets(where, options);

  if (!result || result.data.length === 0) {
    res.status(httpStatus.OK).json({
      success: false,
      status: 404,
      message: "No assets found",
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
    message: "Assets fetched successfully",
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
 * /asset/{assetId}:
 *   get:
 *     summary: Get asset by ID
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
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
 *                   $ref: '#/components/schemas/Asset'
 *       "404":
 *         description: Asset not found
 */
const getAssetById = catchAsync(async (req, res) => {
  const asset = await prisma.asset.findUnique({
    where: { id: req.params.assetId },
    select: AssetKeys,
  });

  if (!asset) {
    throw new ApiError(httpStatus.NOT_FOUND, "Asset not found");
  }

  res.status(httpStatus.OK).json({
    status: 200,
    success: true,
    message: "Asset fetched successfully",
    data: asset,
  });
});

/**
 * @swagger
 * /asset/{assetId}:
 *   put:
 *     summary: Update asset
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assetName:
 *                 type: string
 *                 example: "Updated Laptop"
 *               uniqueId:
 *                 type: string
 *                 example: "LP-001-UPDATED"
 *               brand:
 *                 type: string
 *                 example: "Dell Updated"
 *               model:
 *                 type: string
 *                 example: "XPS 15 Updated"
 *               serialNumber:
 *                 type: string
 *                 example: "SN123456789-UPDATED"
 *               status:
 *                 type: string
 *                 example: "IN_USE"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               branchId:
 *                 type: string
 *                 example: "branch123-updated"
 *               departmentId:
 *                 type: string
 *                 example: "dept456-updated"
 *               companyId:
 *                 type: string
 *                 example: "company789-updated"
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       "404":
 *         description: Asset not found
 */
const updateAsset = catchAsync(async (req, res) => {
  const assetId = req.params.assetId;
  const updateBody = req.body;

  const updatedAsset = await assetService.updateAssetById(assetId, updateBody);

  res.send(updatedAsset);
});

/**
 * @swagger
 * /asset/{assetId}:
 *   delete:
 *     summary: Delete asset
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
 *     responses:
 *       "204":
 *         description: No Content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       "404":
 *         description: Asset not found
 */
const deleteAsset = catchAsync(async (req, res) => {
  await assetService.deleteAssetById(req.params.assetId);

  res.status(httpStatus.NO_CONTENT).json({
    success: true,
    message: "Asset deleted successfully",
  });
});

/**
 * @swagger
 * /asset/bulk-delete:
 *   post:
 *     summary: Bulk delete assets
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assetIds
 *             properties:
 *               assetIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["asset1", "asset2"]
 *     responses:
 *       "204":
 *         description: No Content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       "404":
 *         description: Assets not found
 */
const bulkDeleteAssets = catchAsync(async (req, res) => {
  await assetService.deleteAssetsByIds(req.body.assetIds);
  res.status(httpStatus.NO_CONTENT).json({
    success: true,
    message: "Assets deleted successfully",
  });
});

/**
 * @swagger
 * /asset/{assetId}/assign:
 *   put:
 *     summary: Assign asset to user
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assignedToUserId
 *             properties:
 *               assignedToUserId:
 *                 type: string
 *                 example: "user123"
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/AssetAssignment'
 *       "404":
 *         description: Asset or user not found
 */
const assignAsset = catchAsync(async (req, res) => {
  // Create assignment record
  const assignment = await prisma.assetAssignment.create({
    data: {
      assetId: req.params.assetId,
      userId: req.body.assignedToUserId,
    },
    select: AssetAssignmentKeys,
  });

  // Update asset's assigned user
  await prisma.asset.update({
    where: { id: req.params.assetId },
    data: { assignedToUserId: req.body.assignedToUserId },
  });

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Asset assigned successfully",
    data: assignment,
  });
});

/**
 * @swagger
 * /asset/{assetId}/assignments:
 *   get:
 *     summary: Get asset assignments
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
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
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AssetAssignment'
 *       "404":
 *         description: No assignments found
 */
const getAssetAssignments = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["from_date", "to_date"]);
  applyDateFilter(filter);

  const assignments = await prisma.assetAssignment.findMany({
    where: { assetId: req.params.assetId, ...filter },
    select: AssetAssignmentKeys,
  });

  res.status(200).json({
    success: true,
    message:
      assignments.length > 0
        ? "Asset assignments fetched successfully"
        : "No assignments found",
    data: assignments,
  });
});

/**
 * @swagger
 * /asset/{assetId}/history:
 *   get:
 *     summary: Get asset history
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action type
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter history after this date
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter history before this date
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AssetHistory'
 *       "404":
 *         description: No history found
 */
const getAssetHistory = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["action", "userId", "from_date", "to_date"]);
  applyDateFilter(filter);

  const history = await prisma.assetHistory.findMany({
    where: { assetId: req.params.assetId, ...filter },
    select: AssetHistoryKeys,
  });

  res.status(200).json({
    success: true,
    message:
      history.length > 0
        ? "Asset history fetched successfully"
        : "No history found",
    data: history,
  });
});

export default {
  createAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  bulkDeleteAssets,
  assignAsset,
  getAssetAssignments,
  getAssetHistory,
};
