import httpStatus from "http-status";
import catchAsync from "@/lib/catchAsync";
import pick from "@/lib/pick";
import assetHistoryService from "@/services/assetHistory.service";
import {Prisma, User, UserRole} from "@prisma/client";
import db from "@/lib/db";


const getAssetHistories = catchAsync(async (req, res) => {
  const user = req.user as User;
  const rawFilters = pick(req.query, [
    "assetId",
    "userId",
    "action",
    "timestampFrom",
    "timestampTo",
    "searchTerm",
  ]) as {
    assetId?: string;
    userId?: string;
    action?: string;
    timestampFrom?: string;
    timestampTo?: string;
    searchTerm?: string;
  };

  let limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  let sortBy = (req.query.sortBy as string) || "timestamp";
  let sortType = (req.query.sortType as "asc" | "desc") || "desc";

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
    ...(user.userRole !== UserRole.SUPERADMIN ? {
      OR: [
        { assetId: { in: assetIds } },
        { userId: { in: userIds } }
      ]
    } : {})
  };

  if (rawFilters.timestampFrom || rawFilters.timestampTo) {
    filters.timestamp = {};
    if (rawFilters.timestampFrom) filters.timestamp.gte = new Date(rawFilters.timestampFrom);
    if (rawFilters.timestampTo) filters.timestamp.lte = new Date(rawFilters.timestampTo);
  }

  if (rawFilters.assetId) {
    filters.assetId = {
      contains: rawFilters.assetId,
      mode: "insensitive",
    };
    limit = 5;
    sortBy = "timestamp";
    sortType = "desc";
  }

  const searchTerm = (rawFilters.searchTerm as string)?.trim();

  const isSearchMode = !!searchTerm;
  if (isSearchMode) {
    limit = 5;
    sortBy = "timestamp";
    sortType = "desc";
  }

  const searchConditions = searchTerm
      ? {
        asset: {
          assetName: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      }
      : {};

  const where = {
    deleted: false,
    ...filters,
    ...searchConditions,
  };

  const options = {
    limit,
    page,
    sortBy,
    sortType,
  };

  const result = await assetHistoryService.queryAssetHistories(where, options);

  if (!result || result.data.length === 0) {
    res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      message: "No asset histories found",
      data: {
        histories: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
          mode: isSearchMode ? "search" : "pagination",
        }
      }
    });
    return;
  }
  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: "Asset histories fetched successfully",
    data: {
      histories: result.data,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
        mode: isSearchMode ? "search" : "pagination",
      }
    }
  });
});


const getAssetHistoryById = catchAsync(async (req, res) => {
  const history = await assetHistoryService.getAssetHistoryById(
      req.params.historyId
  );

  if (!history) {
    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      success: false,
      message: "Asset history not found",
      data: {
        history: null,
      },
    });
    return;
  }

  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    success: true,
    message: "Asset history fetched successfully",
    data: {
      history,
    },
  });
});

const getAssetHistoryByAssetId = catchAsync(async (req, res) => {
  const user = req.user as User;
  const rawFilters = pick(req.query, [
    "action",
    "userId",
    "timestampFrom",
    "timestampTo",
    "searchTerm",
  ]) as {
    action?: string;
    userId?: string;
    timestampFrom?: string;
    timestampTo?: string;
    searchTerm?: string;
  };

  const asset = await db.asset.findFirst({
    where: {
      id: req.params.assetId,
      OR: [
        { branch: { companyId: user.companyId } },
        { department: { branch: { companyId: user.companyId } } }
      ]
    }
  });

  let limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  let sortBy = (req.query.sortBy as string) || "timestamp";
  let sortType = (req.query.sortType as "asc" | "desc") || "desc";

  const companyUsers = await db.user.findMany({
    where: { companyId: user.companyId },
    select: { id: true }
  });
  const userIds = companyUsers.map(user => user.id);

  const filters: Prisma.AssetHistoryWhereInput = {
    assetId: req.params.assetId,
  };

  if (rawFilters.timestampFrom || rawFilters.timestampTo) {
    filters.timestamp = {};
    if (rawFilters.timestampFrom) filters.timestamp.gte = new Date(rawFilters.timestampFrom);
    if (rawFilters.timestampTo) filters.timestamp.lte = new Date(rawFilters.timestampTo);
  }

  if (rawFilters.userId && userIds.includes(rawFilters.userId)) {
    filters.userId = rawFilters.userId;
  }

  if (rawFilters.action) {
    filters.action = rawFilters.action;
  }

  const searchTerm = rawFilters.searchTerm?.trim();

  const isSearchMode = !!searchTerm;
  if (isSearchMode) {
    limit = 5;
    sortBy = "timestamp";
    sortType = "desc";
  }

  const searchConditions: Prisma.AssetHistoryWhereInput = searchTerm
      ? {
        OR: [
          {
            user: {
              name: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          },
          {
            action: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ].filter(Boolean) as Prisma.AssetHistoryWhereInput[],
      }
      : {};

  const where: Prisma.AssetHistoryWhereInput = {
    deleted: false,
    ...filters,
    ...searchConditions,
  };

  const options = {
    limit,
    page,
    sortBy,
    sortType,
  };

  const result = await assetHistoryService.getAssetHistoriesByAssetId(
      req.params.assetId,
      where,
      options
  );

  if (!result || result.data.length === 0) {
    res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      message: "No asset histories found for this asset",
      data: {
        histories: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
          mode: isSearchMode ? "search" : "pagination",
        }
      }
    });
    return;
  }

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: "Asset histories fetched successfully",
    data: {
      histories: result.data,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
        mode: isSearchMode ? "search" : "pagination",
      }
    }
  });
});


/**
 * @swagger
 * tags:
 *   name: AssetHistory
 *   description: Asset history management
 */

/**
 * @swagger
 * /assetHistory:
 *   get:
 *     summary: Get all asset histories
 *     tags: [AssetHistory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of asset histories
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
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 */

/**
 * @swagger
 * /assetHistory/{historyId}:
 *   get:
 *     summary: Get asset history by ID
 *     tags: [AssetHistory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Asset history found
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
 *                   $ref: '#/components/schemas/AssetHistory'
 *       404:
 *         description: Asset history not found
 */

/**
 * @swagger
 * /assetHistory/asset/{assetId}:
 *   get:
 *     summary: Get asset history by asset ID
 *     tags: [AssetHistory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Asset history records found
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
 *                 total:
 *                   type: integer
 */

export default {
  getAssetHistories,
  getAssetHistoryById,
  getAssetHistoryByAssetId,
};
