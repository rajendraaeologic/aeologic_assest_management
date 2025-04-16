import { User, Prisma, UserRole } from "@prisma/client";
import httpStatus from "http-status";
import db from "@/lib/db";
import ApiError from "@/lib/ApiError";
import { UserKeys } from "@/utils/selects.utils";

const createUser = async (
  user: User
): Promise<Omit<User, "password"> | null> => {
  if (!user) {
    return null;
  }
  if (await getUserByEmail(user.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  if (await getUserByPhone(user.phone)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Phone already taken");
  }

  return db.user.create({
    data: user,
  });
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
  const users = await Promise.all(
    userIds.map((id) => db.user.findUnique({ where: { id } }))
  );

  const notFoundIds = userIds.filter((_, index) => !users[index]);
  if (notFoundIds.length > 0) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Users not found: ${notFoundIds.join(", ")}`
    );
  }

  const deletedUsers = await db.$transaction(async (tx) => {
    const deleted = await Promise.all(
      userIds.map((id) => tx.user.delete({ where: { id } }))
    );
    return deleted.map((user) => {
      const { password, ...rest } = user;
      return rest;
    });
  });

  return deletedUsers;
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
};
