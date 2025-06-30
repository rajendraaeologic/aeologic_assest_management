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

    res.status(httpStatus.CREATED).json({
      statusCode: httpStatus.CREATED,
      message: "Organization created successfully",
      data: { organization },
    });
  } catch (error) {
    throw new ApiError(httpStatus.CONFLICT, error.message);
  }
});

export const getAllOrganizations = catchAsync(async (req, res) => {
  const rawFilters = pick(req.query, [
    "organizationName",
    "from_date",
    "to_date",
    "selectedDate",
    "searchTerm",
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
  const isSearchMode = !!searchTerm;

  if (isSearchMode) {
    limit = 5;
    sortBy = "createdAt";
    sortType = "desc";
  }

  const searchConditions = searchTerm
    ? {
        OR: [
          { organizationName: { contains: searchTerm, mode: "insensitive"} },
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

  const result = await organizationService.queryOrganizations(where, options);

  if (!result || result.data.length === 0) {
    const message = (rawFilters.selectedDate || (rawFilters.from_date && rawFilters.to_date))
        ? "No organizations found for the selected date range"
        : "No organizations found";

    res.status(httpStatus.OK).json({
      statusCode: httpStatus.NOT_FOUND,
      message,
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
    res.status(httpStatus.NOT_FOUND).json({
      statusCode: httpStatus.NOT_FOUND,
      message: "No organization found",
      data: [],
    });
    return;
  }
  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
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
      statusCode: httpStatus.OK,
      message: "Organization updated successfully",
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
      message: "Organization deleted successfully",
      data: null,
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

const exportOrganizationsToExcel = catchAsync(async (req, res) => {
  const filters = {
    organizationName: req.query.organizationName as string,
    searchTerm: req.query.searchTerm as string,
    from_date: req.query.from_date as string,
    to_date: req.query.to_date as string,
    selectedDate: req.query.selectedDate as string,
  };

  const buffer = await organizationService.exportOrganizationsToExcelService(filters);

  res.setHeader('Content-Disposition', 'attachment; filename="organizations_export.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.status(httpStatus.OK).send(buffer);
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
  exportOrganizationsToExcel,
};
