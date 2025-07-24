import { User, Prisma, UserRole, UserStatus } from "@prisma/client";
import httpStatus from "http-status";
import db from "@/lib/db";
import ApiError from "@/lib/ApiError";
import { UserKeys } from "@/utils/selects.utils";
import { sendEmail } from "@/utils/sendEmail";
import { generateUserWelcomeEmail } from "@/utils/emailTemplate";
import { encryptPassword } from "@/lib/encryption";
import { userValidation } from "@/validations";
import { generateRandomPassword } from "@/utils/passwordGenerator";
import { generateUserEmailUpdateNotification } from "@/utils/emailTemplate";
import path from "path";
import xlsx from "xlsx";

const createUser = async (
    user: User & { plainPassword?: string },
    requestingUser?: User
): Promise<Omit<User, "password"> | null> => {
  if (!user) return null;

  const deletedUser = await db.user.findFirst({
    where: {
      email: user.email,
      phone: user.phone,
      deleted: true
    }
  });

  if (deletedUser) {
    throw new ApiError(
        httpStatus.CONFLICT,
        "This user has been deleted. Please contact SuperAdmin for further assistance."
    );
  }


  if (await getUserByEmail(user.email)) {
    throw new ApiError(httpStatus.CONFLICT, "Email Id already taken");
  }

  if (await getUserByPhone(user.phone)) {
    throw new ApiError(httpStatus.CONFLICT, "Phone Number already taken");
  }

  const { companyId, branchId, departmentId, plainPassword, ...rest } = user;

  if (!companyId && requestingUser?.userRole !== UserRole.SUPERADMIN) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company ID is required");
  }

  if (requestingUser) {
    let allowedRoles: UserRole[] = [];

    switch (requestingUser.userRole) {
      case UserRole.ADMIN:
        allowedRoles = [UserRole.USER, UserRole.MANAGER];
        break;
      case UserRole.MANAGER:
        allowedRoles = [UserRole.USER];
        break;
      case UserRole.SUPERADMIN:
        allowedRoles = [UserRole.USER, UserRole.MANAGER, UserRole.ADMIN];
        break;
      default:
        throw new ApiError(
            httpStatus.FORBIDDEN,
            "You don't have permission to create users"
        );
    }

    if (!allowedRoles.includes(rest.userRole)) {
      throw new ApiError(
          httpStatus.FORBIDDEN,
          `You can only create users with these roles: ${allowedRoles.join(', ')}`
      );
    }

    if (
        (requestingUser.userRole === UserRole.ADMIN && rest.userRole === UserRole.ADMIN) ||
        (requestingUser.userRole === UserRole.MANAGER && rest.userRole === UserRole.MANAGER)
    ) {
      throw new ApiError(
          httpStatus.FORBIDDEN,
          "You cannot create users with the same or higher privilege level"
      );
    }

    if (requestingUser.userRole !== UserRole.SUPERADMIN && companyId !== requestingUser.companyId) {
      throw new ApiError(
          httpStatus.FORBIDDEN,
          "You can only create users for your own company"
      );
    }
  } else {
    throw new ApiError(
        httpStatus.FORBIDDEN,
        "Authentication required to create users"
    );
  }

  const createdUser = await db.user.create({
    data: {
      ...rest,
      ...(branchId ? { branch: { connect: { id: branchId } } } : {}),
      ...(departmentId ? { department: { connect: { id: departmentId } } } : {}),
      company: {
        connect: { id: companyId },
      },
    },
  });

  if (plainPassword) {
    const emailContent = generateUserWelcomeEmail(
      user.userName,
      user.email,
      plainPassword
    );

    await sendEmail(user.email, "Welcome to Our Platform", emailContent);
  }

  return createdUser;
};

// Interfaces
interface ExcelUserPayload {
  userName: string;
  email: string;
  phone: string;
  password: string;
  plainPassword: string;
  userRole: UserRole;
  status: UserStatus;
  branchId: string;
  departmentId: string;
  companyId: string;
}

interface FailedUser {
  row: ExcelUserPayload;
  error: string;
}

interface CreateUsersResult {
  createdUsers: User[];
  failedUsers: FailedUser[];
}

const createUsersFromExcel = async (
  sheetData: ExcelUserPayload[]
): Promise<CreateUsersResult> => {
  const failedUsers: FailedUser[] = [];
  const emails = new Set<string>();
  const phones = new Set<string>();

  for (const row of sheetData) {
    try {
      const missingFields = [];
      if (!row.userName) missingFields.push("userName");
      if (!row.email) missingFields.push("email");
      if (!row.phone) missingFields.push("phone");
      if (!row.userRole) missingFields.push("userRole");
      if (!row.status) missingFields.push("status");
      if (!row.branchId) missingFields.push("branchId");
      if (!row.departmentId) missingFields.push("departmentId");
      if (!row.companyId) missingFields.push("companyId");

      if (missingFields.length > 0) {
        throw new Error(`Missing fields: ${missingFields.join(", ")}`);
      }

      const { plainPassword, password, ...userDataWithRelations } = row;
      userValidation.validateExcelUser(userDataWithRelations);

      const { email, phone, branchId, companyId, departmentId } =
        userDataWithRelations;

      if (emails.has(email))
        throw new Error(`Duplicate email in Excel: ${email}`);
      if (phones.has(phone))
        throw new Error(`Duplicate phone in Excel: ${phone}`);

      emails.add(email);
      phones.add(phone);

      const [branchExists, companyExists, departmentExists] = await Promise.all(
        [
          db.branch.findUnique({ where: { id: branchId, deleted: false } }),
          db.organization.findUnique({
            where: { id: companyId, deleted: false },
          }),
          db.department.findUnique({
            where: { id: departmentId, deleted: false },
          }),
        ]
      );

      if (!branchExists)
        throw new Error(`Branch ID does not exist: ${branchId}`);
      if (!companyExists)
        throw new Error(`Company ID does not exist: ${companyId}`);
      if (!departmentExists)
        throw new Error(`Department ID does not exist: ${departmentId}`);
    } catch (error) {
      failedUsers.push({ row, error: error.message });
    }
  }

  if (failedUsers.length > 0) {
    return {
      createdUsers: [],
      failedUsers,
    };
  }

  const BATCH_SIZE = 100;
  const createdUsers: { user: User; plainPassword: string }[] = [];
  const batchFailedUsers: FailedUser[] = [];

  for (let i = 0; i < sheetData.length; i += BATCH_SIZE) {
    const batch = sheetData.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(async (row) => {
      try {
        const generatedPassword = generateRandomPassword();
        const { plainPassword, password, ...userDataWithRelations } = row;
        const { branchId, departmentId, companyId, ...userData } =
          userDataWithRelations;

        const user = await db.$transaction(async (tx) => {
          const [existingEmail, existingPhone] = await Promise.all([
            tx.user.findFirst({
              where: { email: userData.email, deleted: false },
            }),
            tx.user.findUnique({
              where: { phone: userData.phone, deleted: false },
            }),
          ]);

          if (existingEmail) throw new Error(`Email exists: ${userData.email}`);
          if (existingPhone) throw new Error(`Phone exists: ${userData.phone}`);

          return tx.user.create({
            data: {
              ...userData,
              password: await encryptPassword(generatedPassword),
              company: { connect: { id: companyId } },
              branch: { connect: { id: branchId } },
              department: { connect: { id: departmentId } },
            },
          });
        });

        return { user, plainPassword: generatedPassword };
      } catch (error) {
        batchFailedUsers.push({ row, error: error.message });
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    createdUsers.push(
      ...batchResults.filter(
        (result): result is NonNullable<typeof result> => result !== null
      )
    );
  }

  await Promise.allSettled(
    createdUsers.map(async ({ user, plainPassword }) => {
      try {
        const emailContent = generateUserWelcomeEmail(
          user.userName,
          user.email,
          plainPassword
        );
        await sendEmail(user.email, "Welcome to Platform", emailContent);
      } catch (emailError) {
        console.error(`Email failed for ${user.email}: ${emailError.message}`);
      }
    })
  );

  const allFailedUsers = [...failedUsers, ...batchFailedUsers];

  if (allFailedUsers.length > 0) {
    return {
      createdUsers: createdUsers.map((u) => u.user),
      failedUsers: allFailedUsers,
    };
  }

  return {
    createdUsers: createdUsers.map((u) => u.user),
    failedUsers: [],
  };
};

const getUserExcelTemplateDowndload = async () => {
  const filePath = path.join(__dirname, "../public/UserTemplate.csv");
  return filePath;
};
//registerUser
const registerUser = async (
  user: User,
  selectKeys: Prisma.UserSelect = UserKeys
): Promise<Omit<User, "password"> | null> => {
  if (!user) {
    return null;
  }
  const existingUser = await getUserByPhone(user.phone);
  if (!existingUser) {
    return db.user.create({
      data: {
        ...user,
      },
      select: selectKeys,
    });
  }
  return existingUser;
};

const queryUsers = async (
  filter: object,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: "asc" | "desc";
  },
  requestingUserId?: string,
  selectKeys: Prisma.UserSelect = UserKeys
): Promise<{ data: User[]; total: number }> => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy || "createdAt";
  const sortType = options.sortType ?? "desc";
  const finalFilter = {
    ...filter,
    deleted: false,
    ...(requestingUserId ? { id: { not: requestingUserId } } : {}),
  };
  console.log('Final filter before query:', JSON.stringify(finalFilter, null, 2));
  const [data, total] = await Promise.all([
    db.user.findMany({
      where: finalFilter,
      select: {
        ...selectKeys,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: sortType },
    }),
    db.user.count({ where: finalFilter }),
  ]);
  console.log(`Query returned ${data.length} users`);
  return { data, total };
};

const getUserById = async (
  id: string
): Promise<Omit<User, "password"> | null> => {
  return db.user.findUnique({
    where: { id, deleted: false },
  });
};

const getSuperAdmin = async (): Promise<Omit<User, "password"> | null> => {
  return db.user.findFirst({
    where: { userRole: UserRole.SUPERADMIN, deleted: false },
  });
};


const getUserByEmail = async (
    email: string,
    excludeUserId: string = null
): Promise<Omit<User, "password"> | null> => {
  return db.user.findFirst({
    where: {
      email,
      deleted: false,
      ...(excludeUserId ? { id: { not: excludeUserId } } : {})
    },
  });
};

const getUserWithPasswordByEmail = async (
    email: string,
    excludeUserId: string | null = null
): Promise<User | null> => {
  return db.user.findFirst({
    where: {
      email,
      deleted: false,
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
    select: {
      id: true,
      userName: true,
      phone: true,
      ISDCode: true,
      email: true,
      image: true,
      password: true,
      userRole: true,
      status: true,
      isEmailVerified: true,
      deleted: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
      companyId: true,
      branchId: true,
      departmentId: true
    }
  });
};

const getUserByPhone = async (
  phone: string,
  excludeUserId: string = null,
  selectKeys: Prisma.UserSelect = UserKeys
): Promise<Omit<User, "password"> | null> => {
  return db.user.findUnique({
    where: {
      phone,
      deleted: false,
      ...(excludeUserId ? { NOT: { id: excludeUserId } } : {}),
    },
    select: selectKeys,
  });
};

const updateUserById = async (
  userId: string,
  updateBody: Prisma.UserUpdateInput,
  selectKeys: Prisma.UserSelect = UserKeys
): Promise<User | null> => {
  const user = await getUserById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  let newEmail: string | undefined;
  let newPhone: string | undefined;

  // Extract new email value from update body
  if (updateBody.email) {
    if (typeof updateBody.email === "string") {
      newEmail = updateBody.email;
    } else if (
      typeof updateBody.email === "object" &&
      "set" in updateBody.email
    ) {
      newEmail = updateBody.email.set;
    }
  }

  // Extract new phone value from update body
  if (updateBody.phone) {
    if (typeof updateBody.phone === "string") {
      newPhone = updateBody.phone;
    } else if (
      typeof updateBody.phone === "object" &&
      "set" in updateBody.phone
    ) {
      newPhone = updateBody.phone.set;
    }
  }

  // Check email uniqueness if changed
  if (newEmail && newEmail !== user.email) {
    const existingUserWithEmail = await db.user.findFirst({
      where: {
        email: newEmail,
        id: { not: userId },
        deleted: false,
      },
    });

    if (existingUserWithEmail) {
      throw new ApiError(httpStatus.CONFLICT, "Email already taken");
    }
  }

  // Check phone uniqueness if changed
  if (newPhone && newPhone !== user.phone) {
    const existingUserWithPhone = await db.user.findFirst({
      where: {
        phone: newPhone,
        id: { not: userId },
        deleted: false,
      },
    });

    if (existingUserWithPhone) {
      throw new ApiError(httpStatus.CONFLICT, "Phone already taken");
    }
  }

  const oldEmail = user.email;
  let plainPassword = null;

  // Generate new password only if email is actually changing
  if (newEmail && newEmail !== oldEmail) {
    plainPassword = generateRandomPassword();
    updateBody.password = await encryptPassword(plainPassword);
  }

  const updatedUser = await db.user.update({
    where: { id: user.id },
    data: updateBody,
    select: selectKeys,
  });

  // Send email notification if email changed
  if (newEmail && newEmail !== oldEmail) {
    const emailContent = generateUserEmailUpdateNotification(
      updatedUser.userName,
      newEmail,
      plainPassword!
    );

    await sendEmail(newEmail, "Your Email Has Been Updated", emailContent);
  }

  return updatedUser;
};
const deleteUserById = async (
  userId: string
): Promise<Omit<User, "password">> => {
  const user = await getUserById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.deleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User already deleted");
  }

  try {
    const updatedUser = await db.$transaction(
      async (tx) => {
        // Soft-delete related assetAssignments
        await tx.assetAssignment.updateMany({
          where: { userId },
          data: { deleted: true, deletedAt: new Date() },
        });

        // Soft-delete related assetHistories
        await tx.assetHistory.updateMany({
          where: { userId },
          data: { deleted: true, deletedAt: new Date() },
        });

        // Soft-delete the user itself
        return tx.user.update({
          where: { id: userId },
          data: { deleted: true, deletedAt: new Date() },
        });
      },
      {
        maxWait: 5000,
        timeout: 15000,
      }
    );

    return updatedUser;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("User soft delete failed:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

const deleteUsersByIds = async (
  userIds: string[]
): Promise<Omit<User, "password">[]> => {
  // Fetch all users (including soft-deleted)
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
  });

  // Check for missing IDs
  const foundIds = users.map((u) => u.id);
  const missingIds = userIds.filter((id) => !foundIds.includes(id));
  if (missingIds.length > 0) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Users not found: ${missingIds.join(", ")}`
    );
  }

  // Check if any are already soft-deleted
  const alreadyDeleted = users.filter((u) => u.deleted);
  if (alreadyDeleted.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Users already deleted: ${alreadyDeleted.map((u) => u.id).join(", ")}`
    );
  }

  try {
    const updatedUsers = await db.$transaction(
      async (tx) => {
        // Check for active asset assignments (non-deleted)
        const activeAssignmentCount = await tx.assetAssignment.count({
          where: {
            userId: { in: userIds },
            deleted: false,
          },
        });

        if (activeAssignmentCount > 0) {
          const message =
            activeAssignmentCount === 1
              ? "1 active asset assignment exists - cannot delete users"
              : `${activeAssignmentCount} active asset assignments exist - cannot delete users`;
          throw new ApiError(httpStatus.BAD_REQUEST, message);
        }

        // Soft-delete related entities
        await tx.assetAssignment.updateMany({
          where: { userId: { in: userIds } },
          data: { deleted: true, deletedAt: new Date() },
        });

        await tx.assetHistory.updateMany({
          where: { userId: { in: userIds } },
          data: { deleted: true, deletedAt: new Date() },
        });

        // Soft-delete users
        await tx.user.updateMany({
          where: { id: { in: userIds } },
          data: { deleted: true, deletedAt: new Date() },
        });

        // Return updated users without passwords
        const updatedUsers = await tx.user.findMany({
          where: { id: { in: userIds } },
        });

        return updatedUsers.map(({ password, ...user }) => user);
      },
      {
        maxWait: 5000,
        timeout: 15000,
      }
    );

    return updatedUsers;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Bulk user soft-delete failed:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

// const getUsersByDepartmentId = async (departmentId: string): Promise<any[]> => {
//   return await db.department.findMany({
//     where: {
//       id: departmentId,
//     },
//     select: UserKeys,
//   });
// };

const checkUserExists = async (userId: string) => {
  const user = await db.user.findUnique({
    where: { id: userId, deleted: false },
  });
  return user !== null;
};

type ExportFilters = {
  userName?: string;
  phone?: string;
  userRole?: string;
  status?: string;
  email?: string;
  from_date?: string;
  to_date?: string;
  selectedDate?: string;
  searchTerm?: string;
  department?: string;
  organization?: string;
  branch?: string;
};
const exportUsersToExcelService = async (user: User, filters: ExportFilters): Promise<Buffer> => {
  let dateFilter = {};

  if (filters.selectedDate) {
    const selectedDate = new Date(filters.selectedDate);
    if (isNaN(selectedDate.getTime())) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid selectedDate format. Use YYYY-MM-DD");
    }
    dateFilter = {
      createdAt: {
        gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
        lte: new Date(selectedDate.setHours(23, 59, 59, 999)),
      },
    };
  } else if (filters.from_date && filters.to_date) {
    const fromDate = new Date(filters.from_date);
    const toDate = new Date(filters.to_date);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format. Use YYYY-MM-DD");
    }
    toDate.setHours(23, 59, 59, 999);
    dateFilter = {
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
    };
  }

  const where: any = {
    ...dateFilter,
    deleted: false,
    NOT: { userRole: "SUPERADMIN" },
  };

  if (user.userRole !== UserRole.SUPERADMIN) {
    where.companyId = user.companyId;
  }

  if (filters.userName) {
    where.userName = { contains: filters.userName, mode: "insensitive" };
  }
  if (filters.userRole) {
    where.userRole = filters.userRole;
  }
  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.organization) {
    where.company = {
      organizationName: {
        contains: filters.organization,
        mode: "insensitive",
      },
    };
  }
  if (filters.branch) {
    where.branch = {
      branchName: {
        contains: filters.branch,
        mode: "insensitive",
      },
    };
  }
  if (filters.department) {
    where.department = {
      departmentName: {
        contains: filters.department,
        mode: "insensitive",
      },
    };
  }

  if (filters.searchTerm?.trim()) {
    where.OR = [
      { userName: { contains: filters.searchTerm, mode: "insensitive" } },
      { email: { contains: filters.searchTerm, mode: "insensitive" } },
      { phone: { contains: filters.searchTerm, mode: "insensitive" } },
    ];
  }

  const users = await db.user.findMany({
    where,
    include: {
      company: { select: { organizationName: true } },
      branch: { select: { branchName: true } },
      department: { select: { departmentName: true } },
    },
  });

  if (!users.length) {
    throw new ApiError(httpStatus.NOT_FOUND, "No users found matching the criteria");
  }

  const excelData = users.map(u => ({
    "User Name": u.userName,
    "Email": u.email,
    "Phone": u.phone,
    "Status": u.status,
    "Role": u.userRole,
    "Organization": u.company?.organizationName || "N/A",
    "Branch": u.branch?.branchName || "N/A",
    "Department": u.department?.departmentName || "N/A",
    "Created At": u.createdAt.toISOString(),
  }));

  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(excelData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 25 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
  ];

  xlsx.utils.book_append_sheet(workbook, worksheet, "Users");
  const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer;
};

export default {
  createUser,
  registerUser,
  checkUserExists,
  queryUsers,
  getSuperAdmin,
  getUserById,
  getUserByPhone,
  getUserByEmail,
  getUserWithPasswordByEmail,
  updateUserById,
  deleteUserById,
  deleteUsersByIds,
  createUsersFromExcel,
  getUserExcelTemplateDowndload,
  exportUsersToExcelService
};
