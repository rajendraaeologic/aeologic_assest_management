import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import catchAsync from "@/lib/catchAsync";
import { Organization } from "@prisma/client";
import pick from "@/lib/pick";
import organizationService from "@/services/organization.service";
import { applyDateFilter } from "@/utils/filters.utils";


const createOrganization = catchAsync(async (req, res) => {
  try {
    const organization = await organizationService.createOrganization({
      organizationName: req.body.organizationName,
    } as Organization);

    res.status(httpStatus.CREATED).send({
      statusCode: httpStatus.CREATED,
      message: "Organization Created Successfully",
      data: {
        organization
      }
    });
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

  // Apply special logic if searchTerm is present
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
        ],
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

  const result = await organizationService.queryOrganizations(where, options);

  if (!result || result.data.length === 0) {
    res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      message: "No organizations found",
      data: {
        organizations: [],
        pagination: {
          totalData: 0,
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
    message: "Organizations fetched successfully",
    data: {
      organizations: result.data,
      pagination: {
        totalData: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
        mode: isSearchMode ? "search" : "pagination",
      }
    }
  });
});

const getOrganizationById = catchAsync(async (req, res) => {
  const result = await organizationService.getOrganizationById(
    req.params.organizationId
  );

  if (!result) {
    res.status(httpStatus.OK).json({
      status: 404,
      message: "No organization found",
      data: [],
    });
    return;
  }
  res.status(httpStatus.OK).json({
    status: 200,
    success: true,
    message: "Organization fetched successfully",
    data:{
      result
    }
  });
});

const updateOrganization = catchAsync(async (req, res) => {
  try {
    const result = await organizationService.updateOrganizationById(
      req.params.organizationId,
      req.body
    );
    res.status(httpStatus.OK).json({
      status: 200,
      success: true,
      message: "Organization update successfully",
      data:{
        result
      }
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

const deleteOrganization = catchAsync(async (req, res) => {
  try {
    await organizationService.deleteOrganizationById(req.params.organizationId);
    res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      message: "Organization soft-deleted successfully",
      data: null
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

const bulkDeleteOrganizations = catchAsync(async (req, res) => {
  try {
    await organizationService.deleteOrganizationsByIds(
      req.body.organizationIds
    );
    res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      message: "Organizations soft-deleted successfully",
      data: null
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

/**
 * @swagger
 * tags:
 *   name: Organizations
 *   description: Organization management endpoints
 */

/**
 * @swagger
 * /organizations:
 *   post:
 *     summary: Create a new organization
 *     tags: [Organizations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizationName
 *             properties:
 *               organizationName:
 *                 type: string
 *                 description: Name of the organization
 *     responses:
 *       201:
 *         description: Organization created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Organization Created Successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     organization:
 *                       $ref: '#/components/schemas/Organization'
 *       409:
 *         description: Conflict
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /organizations:
 *   get:
 *     summary: Get all organizations with filtering and pagination
 *     tags: [Organizations]
 *     parameters:
 *       - in: query
 *         name: organizationName
 *         schema:
 *           type: string
 *         description: Filter by organization name
 *       - in: query
 *         name: createdAtFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter organizations created after this date
 *       - in: query
 *         name: createdAtTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter organizations created before this date
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search term for organization name
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
 *         description: Sort direction
 *     responses:
 *       200:
 *         description: Organizations fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Organizations fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     organizations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Organization'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalData:
 *                           type: integer
 *                           example: 10
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         totalPages:
 *                           type: integer
 *                           example: 1
 *                         mode:
 *                           type: string
 *                           example: pagination
 */

/**
 * @swagger
 * /organizations/{organizationId}:
 *   get:
 *     summary: Get an organization by ID
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the organization to get
 *     responses:
 *       200:
 *         description: Organization fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Organization fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     result:
 *                       $ref: '#/components/schemas/Organization'
 *       404:
 *         description: Organization not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: No organization found
 *                 data:
 *                   type: array
 *                   items: {}
 */

/**
 * @swagger
 * /organizations/{organizationId}:
 *   patch:
 *     summary: Update an organization
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the organization to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organizationName:
 *                 type: string
 *                 description: New name for the organization
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Organization update successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     result:
 *                       $ref: '#/components/schemas/Organization'
 *       404:
 *         description: Organization not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /organizations/{organizationId}:
 *   delete:
 *     summary: Delete an organization (soft delete)
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the organization to delete
 *     responses:
 *       200:
 *         description: Organization soft-deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Organization soft-deleted successfully
 *                 data:
 *                   type: null
 *       404:
 *         description: Organization not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /organizations/bulk-delete:
 *   post:
 *     summary: Bulk delete organizations (soft delete)
 *     tags: [Organizations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizationIds
 *             properties:
 *               organizationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of organization IDs to delete
 *     responses:
 *       200:
 *         description: Organizations soft-deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Organizations soft-deleted successfully
 *                 data:
 *                   type: null
 *       404:
 *         description: Organizations not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Organization:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         organizationName:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         deleted:
 *           type: boolean
 *     ApiError:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *         message:
 *           type: string
 *       required:
 *         - statusCode
 *         - message
 */

export default {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  bulkDeleteOrganizations,
};
