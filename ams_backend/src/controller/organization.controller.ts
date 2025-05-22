import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import catchAsync from "@/lib/catchAsync";
import { Organization } from "@prisma/client";
import pick from "@/lib/pick";
import organizationService from "@/services/organization.service";
import { applyDateFilter } from "@/utils/filters.utils";

/**
 * @swagger
 * tags:
 *   name: Organizations
 *   description: Organization management
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
 *     OrganizationResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         organization:
 *           $ref: '#/components/schemas/Organization'
 *     OrganizationsListResponse:
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
 *             $ref: '#/components/schemas/Organization'
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
 * /organization/createOrganization:
 *   post:
 *     summary: Create a new organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
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
 *                 example: "Acme Corp"
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrganizationResponse'
 *       "400":
 *         description: Bad Request
 *       "409":
 *         description: Conflict (organization already exists)
 */
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

/**
 * @swagger
 * /organization/getAllOrganizations:
 *   get:
 *     summary: Get all organizations
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
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
 *         description: Sort order
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrganizationsListResponse'
 *       "404":
 *         description: No organizations found
 */
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

/**
 * @swagger
 * /organization/{organizationId}:
 *   get:
 *     summary: Get organization by ID
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
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
 *                   $ref: '#/components/schemas/Organization'
 *       "404":
 *         description: Organization not found
 */
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

/**
 * @swagger
 * /organization/{organizationId}:
 *   put:
 *     summary: Update organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organizationName:
 *                 type: string
 *                 example: "Updated Organization Name"
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
 *                   $ref: '#/components/schemas/Organization'
 *       "404":
 *         description: Organization not found
 */
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

/**
 * @swagger
 * /organization/{organizationId}:
 *   delete:
 *     summary: Delete organization (soft delete)
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       "204":
 *         description: No Content *         :
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Organization soft-deleted successfully"
 *       "404":
 *         description: Organization not found
 */
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

/**
 * @swagger
 * /organization/bulk-delete:
 *   post:
 *     summary: Bulk delete organizations (soft delete)
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
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
 *                 example: ["org1", "org2"]
 *     responses:
 *       "204":
 *         description: No Content *         :
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Organizations soft-deleted successfully"
 *       "404":
 *         description: Organizations not found
 */
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

export default {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  bulkDeleteOrganizations,
};
