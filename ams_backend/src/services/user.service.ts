import { User, Prisma, UserRole, UserStatus } from "@prisma/client";
import httpStatus from "http-status";
import db from "@/lib/db";
import ApiError from "@/lib/ApiError";
import { UserKeys } from "@/utils/selects.utils";
import { sendEmail } from "@/utils/sendEmail";
import { generateUserWelcomeEmail } from "@/utils/emailTemplate";
import { encryptPassword } from "@/lib/encryption";
import { userValidation } from "@/validations";
const createUser = async (
  user: User & { plainPassword?: string }
): Promise<Omit<User, "password"> | null> => {
  if (!user) return null;

  if (await getUserByEmail(user.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }

  if (await getUserByPhone(user.phone)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Phone already taken");
  }

  const { branchId, departmentId, plainPassword, ...rest } = user;

  const createdUser = await db.user.create({
    data: {
      ...rest,
      branch: {
        connect: { id: branchId },
      },
      department: {
        connect: { id: departmentId },
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
}

interface FailedUser {
  row: ExcelUserPayload;
  error: string;
}

export const createUsersFromExcel = async (sheetData: ExcelUserPayload[]) => {
  const failedUsers: FailedUser[] = [];
  const emails = new Set<string>();
  const phones = new Set<string>();

  // Step 1: Pre-validation (collect errors but don't stop processing)
  for (const row of sheetData) {
    try {
      const { plainPassword, ...userDataWithRelations } = row;
      userValidation.validateExcelUser(userDataWithRelations);

      const { email, phone } = userDataWithRelations;
      if (emails.has(email))
        throw new Error(`Duplicate email in Excel: ${email}`);
      if (phones.has(phone))
        throw new Error(`Duplicate phone in Excel: ${phone}`);

      emails.add(email);
      phones.add(phone);
    } catch (error) {
      failedUsers.push({ row, error: error.message });
    }
  }

  // Step 2: Process valid rows in batches with individual error handling
  const BATCH_SIZE = 100;
  const createdUsers: any[] = [];
  const batchFailedUsers: FailedUser[] = [];

  for (let i = 0; i < sheetData.length; i += BATCH_SIZE) {
    const batch = sheetData.slice(i, i + BATCH_SIZE);

    // Process each row individually in the batch
    const batchPromises = batch.map(async (row) => {
      // Skip rows that failed pre-validation
      if (failedUsers.some((f) => f.row === row)) return null;

      try {
        const { plainPassword, ...userDataWithRelations } = row;
        const { branchId, departmentId, ...userData } = userDataWithRelations;

        // Check existing users within individual transaction
        const user = await db.$transaction(async (tx) => {
          const [existingEmail, existingPhone] = await Promise.all([
            tx.user.findFirst({ where: { email: userData.email } }),
            tx.user.findUnique({ where: { phone: userData.phone } }),
          ]);

          if (existingEmail) throw new Error(`Email exists: ${userData.email}`);
          if (existingPhone) throw new Error(`Phone exists: ${userData.phone}`);

          return tx.user.create({
            data: {
              ...userData,
              password: await encryptPassword(userData.password),
              branch: { connect: { id: branchId } },
              department: { connect: { id: departmentId } },
            },
          });
        });

        return { user, plainPassword };
      } catch (error) {
        batchFailedUsers.push({ row, error: error.message });
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    const successfulUsers = batchResults.filter((result) => result !== null);
    createdUsers.push(...successfulUsers);
  }

  // Step 3: Send emails (unchanged)
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

  return {
    createdUsers: createdUsers.map((u) => u.user),
    failedUsers: [...failedUsers, ...batchFailedUsers],
  };
};
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
  selectKeys: Prisma.UserSelect = UserKeys
): Promise<User[]> => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const skip = (page - 1) * limit || 0;
  const sortBy = options.sortBy;
  const sortType = options.sortType ?? "desc";
  return db.user.findMany({
    where: {
      ...filter,
      NOT: {
        userRole: "SUPERADMIN",
      },
    },
    select: selectKeys,
    skip: skip > 0 ? skip : 0,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType } : undefined,
  });
};

const getUserById = async (
  id: string
): Promise<Omit<User, "password"> | null> => {
  return db.user.findUnique({
    where: { id },
  });
};

const getSuperAdmin = async (): Promise<Omit<User, "password"> | null> => {
  return db.user.findFirst({
    where: { userRole: UserRole.SUPERADMIN },
  });
};
const getUserByEmail = async (
  email: string,
  excludeUserId: string = null
): Promise<Omit<User, "password"> | null> => {
  if (!excludeUserId) {
    return db.user.findFirst({
      where: { email },
    }) as Promise<Omit<User, "password"> | null>;
  }
};

const getUserWithPasswordByEmail = async (
  email: string,
  excludeUserId: string = null
): Promise<User | null> => {
  if (!excludeUserId) {
    return db.user.findFirst({
      omit: { password: false },
      where: { email },
    });
  }
};

const getUserByPhone = async (
  phone: string,
  excludeUserId: string = null,
  selectKeys: Prisma.UserSelect = UserKeys
): Promise<Omit<User, "password"> | null> => {
  return db.user.findUnique({
    where: {
      phone,
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

  if (
    updateBody.email &&
    (await getUserByEmail(updateBody.email as string, userId))
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }

  if (
    updateBody.phone &&
    (await getUserByPhone(updateBody.phone as string, userId))
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Phone already taken");
  }

  return db.user.update({
    where: { id: user.id },
    data: updateBody,
    select: selectKeys,
  });
};

const deleteUserById = async (
  userId: string
): Promise<Omit<User, "password">> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  await db.user.delete({ where: { id: user.id } });
  return user;
};

const deleteUsersByIds = async (
  userIds: string[]
): Promise<Omit<User, "password">[]> => {
  return await db.$transaction(
    async (tx) => {
      const users = await Promise.all(
        userIds.map((id) =>
          tx.user.findUnique({
            where: { id },
            select: {
              id: true,
              userName: true,
              email: true,
            },
          })
        )
      );

      const notFoundIds = userIds.filter((_, index) => !users[index]);
      if (notFoundIds.length > 0) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          `Users not found: ${notFoundIds.join(", ")}`
        );
      }

      await tx.user.deleteMany({
        where: { id: { in: userIds } },
      });

      return users as Omit<User, "password">[];
    },
    {
      timeout: 10000,
    }
  );
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
    where: { id: userId },
  });
  return user !== null;
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
};
