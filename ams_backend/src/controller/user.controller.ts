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
      plainPassword,
    } as User & { plainPassword: string });

    res.status(httpStatus.CREATED).send({
      user,
      message: "User Created Successfully.",
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
    res.status(httpStatus.BAD_REQUEST).json({
      status: httpStatus.BAD_REQUEST,
      message: "Excel sheet is empty",
    });
    return;
  }

  const sheetDataWithPassword = sheetData.map((row: any) => ({
    ...row,
    plainPassword: row.password,
  }));

  const { createdUsers, failedUsers } = await userService.createUsersFromExcel(
    sheetDataWithPassword
  );

  const duplicateErrors = failedUsers.filter(
    (user) =>
      user.error.includes("Email exists") || user.error.includes("Phone exists")
  );

  if (duplicateErrors.length > 0) {
    const hasEmailDuplicate = duplicateErrors.some((user) =>
      user.error.includes("Email exists")
    );
    const hasPhoneDuplicate = duplicateErrors.some((user) =>
      user.error.includes("Phone exists")
    );

    let errorMessage = "Duplicate ";
    if (hasEmailDuplicate && hasPhoneDuplicate) {
      errorMessage += "email and phone number found";
    } else if (hasEmailDuplicate) {
      errorMessage += "email found";
    } else if (hasPhoneDuplicate) {
      errorMessage += "phone number found";
    }

    res.status(httpStatus.CONFLICT).json({
      status: httpStatus.CONFLICT,
      message: errorMessage,
      failedUsers: duplicateErrors,
    });
    return;
  }

  res.status(httpStatus.CREATED).json({
    status: httpStatus.CREATED,
    message: "Users processed from Excel file",
    successCount: createdUsers.length,
    failedCount: failedUsers.length,
    createdUsers,
    failedUsers,
  });
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

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    "name",
    "phone",
    "userRole",
    "status",
    "isEmailVerified",
    "email",
    "from_date",
    "to_date",
  ]);

  applyDateFilter(filter);

  const options = pick(req.query, ["sortBy", "sortType", "limit", "page"]);

  if (filter.name) {
    filter.name = {
      contains: filter.name,
      mode: "insensitive",
    };
  }

  console.log(options);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
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
