import httpStatus from "http-status";
import pick from "@/lib/pick";
import ApiError from "@/lib/ApiError";
import catchAsync from "@/lib/catchAsync";
import { userService } from "@/services";
import { User } from "@prisma/client";
import { encryptPassword } from "@/lib/encryption";
import { applyDateFilter } from "@/utils/filters.utils";
import xlsx from "xlsx";
import { userValidation } from "@/validations";
import { generateRandomPassword } from "@/utils/passwordGenerator";
import * as fs from "fs";
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         status:
 *           type: string
 *         userRole:
 *           type: string
 *         isEmailVerified:
 *           type: boolean
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
 *     UserResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: number
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *     UsersListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: number
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             users:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
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
 *     ExcelUploadResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: number
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             successCount:
 *               type: number
 *             failedCount:
 *               type: number
 *             createdUsers:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *             failedUsers:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   row:
 *                     type: object
 *                   error:
 *                     type: string
 */

/**
 * @swagger
 * /users/:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - phone
 *               - email
 *               - userRole
 *             properties:
 *               userName:
 *                 type: string
 *                 example: "John Doe"
 *               phone:
 *                 type: string
 *                 example: "1234567890"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *               status:
 *                 type: string
 *                 example: "ACTIVE"
 *               userRole:
 *                 type: string
 *                 example: "USER"
 *               branchId:
 *                 type: string
 *                 example: "branch-id"
 *               departmentId:
 *                 type: string
 *                 example: "dept-id"
 *               companyId:
 *                 type: string
 *                 example: "company-id"
 *     responses:
 *       "201":
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       "400":
 *         description: Bad request
 *       "404":
 *         description: Not found
 */
const createUser = catchAsync(async (req, res) => {
  try {
    const plainPassword = req.body.password || generateRandomPassword();

    const user = await userService.createUser({
      userName: req.body.userName,
      phone: req.body.phone,
      email: req.body.email,
      password: await encryptPassword(plainPassword),
      status: req.body.status,
      userRole: req.body.userRole,
      branchId: req.body.branchId,
      departmentId: req.body.departmentId,
      companyId: req.body.companyId,
      plainPassword,
    } as User & { plainPassword: string });

    res.status(httpStatus.CREATED).send({
      statusCode: httpStatus.CREATED,
      message: "User created successfully",
      data: {
        user
      }
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});
/**
 * @swagger
 * /users/upload:
 *   post:
 *     summary: Upload users from Excel file
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       "201":
 *         description: Users created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExcelUploadResponse'
 *       "400":
 *         description: Bad request (invalid file or data)
 *       "409":
 *         description: Conflict (duplicate users)
 *       "404":
 *         description: Not found (invalid references)
 */

const uploadUsersFromExcel = catchAsync(async (req, res) => {
  const { error } = userValidation.uploadUsers.file.validate(req.file);
  if (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.details[0].message);
  }

  const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  if (!sheetData || sheetData.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Excel sheet is empty");
  }

  const sheetDataWithPassword = sheetData.map((row: any) => ({
    ...row,
    plainPassword: row.password,
  }));

  const { createdUsers, failedUsers } = await userService.createUsersFromExcel(
    sheetDataWithPassword
  );

  if (failedUsers.length > 0) {
    const hasMissingFields = failedUsers.some((user) =>
      user.error.includes("Missing fields")
    );
    const hasDuplicates = failedUsers.some(
      (user) =>
        user.error.includes("Email exists") ||
        user.error.includes("Phone exists")
    );
    const hasValidationErrors = failedUsers.some((user) =>
      user.error.includes("must be a")
    );
    const hasInvalidIds = failedUsers.some((user) =>
      user.error.includes("does not exist")
    );

    let statusCode: 400 | 404 | 409 = httpStatus.BAD_REQUEST;
    let message = "Some users failed to process";

    if (hasMissingFields || hasValidationErrors) {
      statusCode = httpStatus.BAD_REQUEST;
      message = hasMissingFields
        ? "Missing required fields in some users"
        : "Validation errors in user data";
    } else if (hasDuplicates) {
      statusCode = httpStatus.CONFLICT;

      message = "Duplicate email or phone number found";
    } else if (hasInvalidIds && Array.isArray(failedUsers)) {
      statusCode = httpStatus.NOT_FOUND;
      const errors = failedUsers
        .map((user) => {
          const [mainMessage] = (user?.error || "").split(":");
          return mainMessage.trim();
        })
        .filter(Boolean);
      const uniqueErrors = [...new Set(errors)];
      message = uniqueErrors.join(", ");
    }

    res.status(statusCode).json({
      statusCode: statusCode,
      message,
      data: {
        successCount: createdUsers.length,
        failedCount: failedUsers.length,
        createdUsers,
        failedUsers,
      }
    });
    return;
  }

  // Only send success response if no failures
  res.status(httpStatus.CREATED).json({
    statusCode: httpStatus.CREATED,
    message: "All users processed successfully",
    data: {
      successCount: createdUsers.length,
      failedCount: 0,
      createdUsers,
      failedUsers: [],
    }
  });
});
/**
 * @swagger
 * /users/template:
 *   get:
 *     summary: Download user Excel template
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Template file downloaded
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       "404":
 *         description: Template not found
 *       "500":
 *         description: Internal server error
 */

const downloadUserExcelTemplate = catchAsync(async (req, res) => {
  try {
    const filePath = await userService.getUserExcelTemplateDowndload();

    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        statusCode: httpStatus.NOT_FOUND,
        message: "Template file not found",
        data: null
      });
    }

    const fileName = "UserTemplate.csv";
    res.download(filePath, fileName);
  } catch (error) {
    res.status(500).json({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Failed to download template",
      data: { error: error.message }
    });
  }
});
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userName
 *         schema:
 *           type: string
 *         description: Filter by user name
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: Filter by phone
 *       - in: query
 *         name: userRole
 *         schema:
 *           type: string
 *         description: Filter by user role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter by email
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by creation date from
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by creation date to
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search term for user name, email, or phone
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
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
 *               $ref: '#/components/schemas/UsersListResponse'
 *       "404":
 *         description: No users found
 */
export const getUsers = catchAsync(async (req, res) => {
  const rawFilters = pick(req.query, [
    "userName",
    "phone",
    "userRole",
    "status",
    "isEmailVerified",
    "email",
    "from_date",
    "to_date",
    "searchTerm",
  ]);

  let limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;

  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  let sortBy = (req.query.sortBy as string) || "createdAt";
  let sortType = (req.query.sortType as "asc" | "desc") || "desc";

  applyDateFilter(rawFilters);

  const filters: any = {};

  // Existing filter logic
  if (rawFilters.name) {
    filters.name = { contains: rawFilters.name, mode: "insensitive" };
  }

  // Add other existing filters similarly...

  const searchTerm = (rawFilters.searchTerm as string)?.trim();
  const isSearchMode = !!searchTerm;

  // Search mode adjustments
  if (isSearchMode) {
    limit = 5;
    sortBy = "createdAt";
    sortType = "desc";
  }

  // Search conditions
  const searchConditions = searchTerm
    ? {
        OR: [
          { userName: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
          { phone: { contains: searchTerm, mode: "insensitive" } },
        ],
      }
    : {};

  const where = {
    ...filters,
    ...searchConditions,
    NOT: { userRole: "SUPERADMIN" },
  };

  const options = {
    limit,
    page,
    sortBy,
    sortType,
  };

  const result = await userService.queryUsers(where, options);
console.log(result)
  if (!result || result.data.length === 0) {
    res.status(httpStatus.OK).json({
      success: false,
      status: 404,
      message: "Users not found",
      data: {
        users: [],
        totalData: 0,
        page,
        limit,
        totalPages: 0,
        mode: isSearchMode ? "search" : "pagination",
      },
    });
    return;
  }

  const users = result.data.map((user) => ({
    ...user,
    updatedAt: user.updatedAt,
  }));

  res.status(httpStatus.OK).json({
    status: 200,
    success: true,
    message: "Users fetched successfully",
    data: {
      users,
      pagination:{
        totalData: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
        mode: isSearchMode ? "search" : "pagination",
      }
    },
  });
});
/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       "404":
 *         description: User not found
 */

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);

  if (!user) {
    res.status(httpStatus.NOT_FOUND).json({
      statusCode: httpStatus.NOT_FOUND,
      message: "User not found",
      data: []
    });
    return;
  }

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: "User fetched successfully",
    data: { user }
  });
});
/**
 * @swagger
 * /users/{userId}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               status:
 *                 type: string
 *               userRole:
 *                 type: string
 *               branchId:
 *                 type: string
 *               departmentId:
 *                 type: string
 *               companyId:
 *                 type: string
 *     responses:
 *       "200":
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       "404":
 *         description: User not found
 */
const updateUser = catchAsync(async (req, res) => {
  try {
    const user = await userService.updateUserById(req.params.userId, req.body);
    res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      message: "User updated successfully",
      data: { user }
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});
/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       "200":
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                 message:
 *                   type: string
 *                 data:
 *                   type: null
 *       "404":
 *         description: User not found
 */
const deleteUser = catchAsync(async (req, res) => {
  try {
    await userService.deleteUserById(req.params.userId);
    res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      message: "User deleted successfully",
      data: null
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

/**
 * @swagger
 * /users/bulk-delete:
 *   post:
 *     summary: Bulk delete users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["user1", "user2"]
 *     responses:
 *       "200":
 *         description: Users deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCount:
 *                       type: number
 *       "404":
 *         description: Users not found
 */
const deleteUsers = catchAsync(async (req, res) => {
  try {
    await userService.deleteUsersByIds(req.body.userIds);
    res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      message: "Users deleted successfully",
      data: {
        deletedCount: req.body.userIds.length
      }
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

export default {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  deleteUsers,
  uploadUsersFromExcel,
  downloadUserExcelTemplate,
};
