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
      status: 201,
      message: "User Created Successfully.",
      user,
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

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
      status: statusCode,
      message,
      successCount: createdUsers.length,
      failedCount: failedUsers.length,
      createdUsers,
      failedUsers,
    });
    return;
  }

  // Only send success response if no failures
  res.status(httpStatus.CREATED).json({
    status: httpStatus.CREATED,
    message: "All users processed successfully",
    successCount: createdUsers.length,
    failedCount: 0,
    createdUsers,
    failedUsers: [],
  });
  return;
});
//downloadUserExcelTemplate
const downloadUserExcelTemplate = catchAsync(async (req, res) => {
  try {
    const filePath = await userService.getUserExcelTemplateDowndload();

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: "Template file not found." });
    }

    const fileName = "UserTemplate.csv";
    res.download(filePath, fileName);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to download template", error: error.message });
  }
});
//getUsers
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

  if (!result || result.data.length === 0) {
    res.status(httpStatus.OK).json({
      success: false,
      status: 404,
      message: " users not found",
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
    message: "Users fetched successfully",
    data: result.data.map((user) => ({
      ...user,
      updatedAt: user.updatedAt,
    })),
    totalData: result.total,
    page,
    limit,
    totalPages: Math.ceil(result.total / limit),
    mode: isSearchMode ? "search" : "pagination",
  });
});
const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);

  res.status(httpStatus.OK).json({
    success: false,
    status: 404,
    message: "User not found",
    data: [],
  });
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  try {
    const user = await userService.updateUserById(req.params.userId, req.body);
    res.send(user);
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

const deleteUser = catchAsync(async (req, res) => {
  try {
    await userService.deleteUserById(req.params.userId);
    res
      .status(httpStatus.NO_CONTENT)
      .send({ message: "User deleted successfully" });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

const deleteUsers = catchAsync(async (req, res) => {
  try {
    await userService.deleteUsersByIds(req.body.userIds);
    res
      .status(httpStatus.NO_CONTENT)
      .send({ message: "Users deleted successfully" });
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
