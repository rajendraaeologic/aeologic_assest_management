import { Department, Prisma } from "@prisma/client";
import db from "@/lib/db";
import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import { DepartmentKeys } from "@/utils/selects.utils";

//createDepartment
const createDepartment = async (
  department: Pick<Department, "departmentName" | "branchId">
): Promise<Omit<Department, "id"> | null> => {
  if (!department) return null;

  const branchExists = await db.branch.findUnique({
    where: { id: department.branchId },
  });

  if (!branchExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Branch ID");
  }

  const existingDepartment = await db.department.findFirst({
    where: {
      departmentName: department.departmentName,
      branchId: department.branchId,
    },
  });

  if (existingDepartment) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Department with name "${department.departmentName}" already exists in this branch.`
    );
  }

  return await db.department.create({
    data: {
      departmentName: department.departmentName,
      branch: { connect: { id: department.branchId } },
    },
  });
};

//   queryDepartments
const queryDepartments = async (
  filter: object,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: "asc" | "desc";
  }
): Promise<any[]> => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const skip = (page - 1) * limit || 0;
  const sortBy = options.sortBy;
  const sortType = options.sortType ?? "desc";

  return await db.department.findMany({
    where: { ...filter },
    select: DepartmentKeys,
    skip: skip > 0 ? skip : 0,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType } : undefined,
  });
};

// getDepartmentById
const getDepartmentById = async (id: string) => {
  return await db.department.findUnique({
    where: { id },
    select: DepartmentKeys,
  });
};

// updateDepartmentById

const updateDepartmentById = async (
  departmentId: string,
  updateBody: Prisma.DepartmentUpdateInput,
  selectKeys: Prisma.DepartmentSelect = DepartmentKeys
): Promise<any | null> => {
  const department = await db.department.findUnique({
    where: { id: departmentId },
  });
  if (!department) {
    throw new ApiError(httpStatus.NOT_FOUND, "Department not found");
  }

  return await db.department.update({
    where: { id: departmentId },
    data: updateBody,
    select: selectKeys,
  });
};

// deleteDepartmentById
const deleteDepartmentById = async (
  departmentId: string
): Promise<Omit<Department, "sensitiveField">> => {
  const department = await getDepartmentById(departmentId);
  if (!department) {
    throw new ApiError(httpStatus.NOT_FOUND, "Department not found");
  }

  try {
    await db.$transaction(
      async (tx) => {
        await tx.assetAssignment.deleteMany({
          where: {
            OR: [{ asset: { departmentId } }, { user: { departmentId } }],
          },
        });

        await tx.assetHistory.deleteMany({
          where: {
            OR: [{ asset: { departmentId } }, { user: { departmentId } }],
          },
        });

        await tx.asset.deleteMany({
          where: { departmentId },
        });

        await tx.user.updateMany({
          where: { departmentId },
          data: { departmentId: null },
        });

        await tx.department.delete({
          where: { id: departmentId },
        });
      },
      {
        maxWait: 5000,
        timeout: 15000,
      }
    );
  } catch (error) {
    console.error("Error while deleting department:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }

  return department;
};

//deleteDepartmentsByIds
const deleteDepartmentsByIds = async (
  departmentIds: string[]
): Promise<Omit<Department, "sensitiveField">[]> => {
  const departments = await db.department.findMany({
    where: { id: { in: departmentIds } },
  });

  if (departments.length !== departmentIds.length) {
    const foundIds = departments.map((d) => d.id);
    const missingIds = departmentIds.filter((id) => !foundIds.includes(id));
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Departments not found: ${missingIds.join(", ")}`
    );
  }

  try {
    await db.$transaction(
      async (tx) => {
        await tx.assetAssignment.deleteMany({
          where: {
            OR: [
              { asset: { departmentId: { in: departmentIds } } },
              { user: { departmentId: { in: departmentIds } } },
            ],
          },
        });

        await tx.assetHistory.deleteMany({
          where: {
            OR: [
              { asset: { departmentId: { in: departmentIds } } },
              { user: { departmentId: { in: departmentIds } } },
            ],
          },
        });

        await tx.asset.deleteMany({
          where: { departmentId: { in: departmentIds } },
        });

        await tx.user.updateMany({
          where: { departmentId: { in: departmentIds } },
          data: { departmentId: null },
        });

        await tx.department.deleteMany({
          where: { id: { in: departmentIds } },
        });
      },
      {
        maxWait: 5000,
        timeout: 20000,
      }
    );
  } catch (error) {
    console.error("Error deleting departments:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }

  return departments;
};

//getDepartmentsByBranchId
export const getDepartmentsByBranchId = async (
  branchId: string,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: "asc" | "desc";
    status?: string;
    createdAtFrom?: Date;
    createdAtTo?: Date;
    searchTerm?: string;
  }
): Promise<{ data: any[]; total: number }> => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy || "createdAt";
  const sortType = options.sortType ?? "desc";

  const filters: any = {
    branchId,
  };

  if (options.status) filters.status = options.status;

  if (options.createdAtFrom || options.createdAtTo) {
    filters.createdAt = {};
    if (options.createdAtFrom) filters.createdAt.gte = options.createdAtFrom;
    if (options.createdAtTo) filters.createdAt.lte = options.createdAtTo;
  }

  const searchConditions = options.searchTerm?.trim()
    ? {
        OR: [
          {
            departmentName: {
              contains: options.searchTerm,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : {};

  const where = {
    ...filters,
    ...searchConditions,
  };

  const finalLimit = options.searchTerm ? 5 : limit;

  const [data, total] = await Promise.all([
    db.department.findMany({
      where,
      select: DepartmentKeys,
      skip,
      take: finalLimit,
      orderBy: {
        [sortBy]: sortType,
      },
    }),
    db.department.count({ where }),
  ]);

  return { data, total };
};

export default {
  createDepartment,
  queryDepartments,
  getDepartmentById,
  updateDepartmentById,
  deleteDepartmentById,
  deleteDepartmentsByIds,
  getDepartmentsByBranchId,
};
