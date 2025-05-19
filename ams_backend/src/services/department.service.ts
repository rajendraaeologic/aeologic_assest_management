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
    where: { id: department.branchId, deleted: false },
  });

  if (!branchExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Branch ID");
  }

  const existingDepartment = await db.department.findFirst({
    where: {
      departmentName: department.departmentName,
      branchId: department.branchId,
      deleted: false,
    },
  });

  if (existingDepartment) {
    throw new ApiError(
      httpStatus.CONFLICT,
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
export const queryDepartments = async (
  filter: object,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: "asc" | "desc";
  }
): Promise<{ data: any[]; total: number }> => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy || "createdAt";
  const sortType = options.sortType ?? "desc";

  const finalFilter = {
    ...filter,
    deleted: false,
  };

  const [data, total] = await Promise.all([
    db.department.findMany({
      where: finalFilter,
      select: DepartmentKeys,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortType },
    }),
    db.department.count({ where: finalFilter }),
  ]);

  return { data, total };
};

// getDepartmentById
const getDepartmentById = async (id: string) => {
  return await db.department.findUnique({
    where: { id, deleted: false },
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
    where: { id: departmentId, deleted: false },
  });
  if (!department) {
    throw new ApiError(httpStatus.NOT_FOUND, "Department not found");
  }
  // Check if departmentName is being updated
  if (updateBody.departmentName) {
    const currentName = department.departmentName;
    let newName: string | undefined;

    // Extract new name value from update body
    if (typeof updateBody.departmentName === "string") {
      newName = updateBody.departmentName;
    } else if (
      updateBody.departmentName &&
      typeof updateBody.departmentName === "object" &&
      "set" in updateBody.departmentName
    ) {
      newName = updateBody.departmentName.set;
    }

    // Check if name is actually changing
    if (newName && newName !== currentName) {
      const existingDepartmentWithName = await db.department.findFirst({
        where: {
          departmentName: newName,
          id: { not: departmentId },
          deleted: false,
        },
      });

      if (existingDepartmentWithName) {
        throw new ApiError(
          httpStatus.CONFLICT,
          "Department name already exists"
        );
      }
    }
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

  if (department.deleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Department already deleted");
  }

  try {
    const updatedDepartment = await db.$transaction(
      async (tx) => {
        //  Check if any users or assets are linked to this department
        const [userCount, assetCount] = await Promise.all([
          tx.user.count({
            where: { departmentId, deleted: false },
          }),
          tx.asset.count({
            where: { departmentId, deleted: false },
          }),
        ]);

        if (userCount > 0) {
          const message =
            userCount === 1
              ? "This department is associated with 1 user and cannot be deleted."
              : `This department is associated with ${userCount} users and cannot be deleted.`;
          throw new ApiError(httpStatus.BAD_REQUEST, message);
        }

        if (assetCount > 0) {
          const message =
            assetCount === 1
              ? "This department is associated with 1 asset and cannot be deleted."
              : `This department is associated with ${assetCount} assets and cannot be deleted.`;
          throw new ApiError(httpStatus.BAD_REQUEST, message);
        }

        // Soft delete related entities

        // Asset Assignments
        await tx.assetAssignment.updateMany({
          where: {
            OR: [{ asset: { departmentId } }, { user: { departmentId } }],
          },
          data: { deleted: true, deletedAt: new Date() },
        });

        // Asset Histories
        await tx.assetHistory.updateMany({
          where: {
            OR: [{ asset: { departmentId } }, { user: { departmentId } }],
          },
          data: { deleted: true, deletedAt: new Date() },
        });

        // Assets
        await tx.asset.updateMany({
          where: { departmentId },
          data: { deleted: true, deletedAt: new Date() },
        });

        // Users — nullify departmentId and optionally soft delete
        await tx.user.updateMany({
          where: { departmentId },
          data: {
            departmentId: null,
            deleted: true,
            deletedAt: new Date(),
          },
        });

        // Department (soft delete)
        return tx.department.update({
          where: { id: departmentId },
          data: { deleted: true, deletedAt: new Date() },
        });
      },
      {
        maxWait: 5000,
        timeout: 15000,
      }
    );

    return updatedDepartment;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Error while soft-deleting department:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

//deleteDepartmentsByIds
const deleteDepartmentsByIds = async (
  departmentIds: string[]
): Promise<Omit<Department, "sensitiveField">[]> => {
  // Step 1: Fetch all departments (even if soft-deleted)
  const departments = await db.department.findMany({
    where: { id: { in: departmentIds } },
  });

  const foundIds = departments.map((d) => d.id);
  const missingIds = departmentIds.filter((id) => !foundIds.includes(id));
  if (missingIds.length > 0) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Departments not found: ${missingIds.join(", ")}`
    );
  }

  // Step 2: Check if any are already soft-deleted
  const alreadyDeleted = departments.filter((d) => d.deleted);
  if (alreadyDeleted.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Departments already deleted: ${alreadyDeleted
        .map((d) => d.id)
        .join(", ")}`
    );
  }

  try {
    const updatedDepartments = await db.$transaction(
      async (tx) => {
        // Step 3: Check if linked with active users or assets
        const [linkedUsers, linkedAssets] = await Promise.all([
          tx.user.findMany({
            where: {
              departmentId: { in: departmentIds },
              deleted: false,
            },
            select: { departmentId: true },
          }),
          tx.asset.findMany({
            where: {
              departmentId: { in: departmentIds },
              deleted: false,
            },
            select: { departmentId: true },
          }),
        ]);

        const departmentsWithUsers = [
          ...new Set(linkedUsers.map((u) => u.departmentId)),
        ];
        const departmentsWithAssets = [
          ...new Set(linkedAssets.map((a) => a.departmentId)),
        ];

        if (departmentsWithUsers.length || departmentsWithAssets.length) {
          const deptNamesWithUsers = departments
            .filter((d) => departmentsWithUsers.includes(d.id))
            .map((d) => d.departmentName);
          const deptNamesWithAssets = departments
            .filter((d) => departmentsWithAssets.includes(d.id))
            .map((d) => d.departmentName);

          if (deptNamesWithUsers.length) {
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              `Departments associated with active users: ${deptNamesWithUsers.join(
                ", "
              )}`
            );
          }

          if (deptNamesWithAssets.length) {
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              `Departments associated with active assets: ${deptNamesWithAssets.join(
                ", "
              )}`
            );
          }
        }

        // Step 4: Soft delete related data
        await tx.assetAssignment.updateMany({
          where: {
            OR: [
              { asset: { departmentId: { in: departmentIds } } },
              { user: { departmentId: { in: departmentIds } } },
            ],
          },
          data: { deleted: true, deletedAt: new Date() },
        });

        await tx.assetHistory.updateMany({
          where: {
            OR: [
              { asset: { departmentId: { in: departmentIds } } },
              { user: { departmentId: { in: departmentIds } } },
            ],
          },
          data: { deleted: true, deletedAt: new Date() },
        });

        await tx.asset.updateMany({
          where: { departmentId: { in: departmentIds } },
          data: { deleted: true, deletedAt: new Date() },
        });

        await tx.user.updateMany({
          where: { departmentId: { in: departmentIds } },
          data: { deleted: true, deletedAt: new Date() },
        });

        await tx.department.updateMany({
          where: { id: { in: departmentIds } },
          data: { deleted: true, deletedAt: new Date() },
        });

        // Step 5: Return soft-deleted departments
        return tx.department.findMany({
          where: { id: { in: departmentIds } },
        });
      },
      {
        maxWait: 5000,
        timeout: 20000,
      }
    );

    return updatedDepartments;
  } catch (error) {
    console.error("Bulk department soft-delete error:", error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
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
    deleted: false,
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
