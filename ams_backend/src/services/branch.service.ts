import { Branch, Prisma } from "@prisma/client";
import db from "@/lib/db";
import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import { BranchKeys } from "@/utils/selects.utils";
// createBranch
const createBranch = async (
  branch: Pick<Branch, "branchName" | "branchLocation" | "companyId">
): Promise<Omit<Branch, "id"> | null> => {
  if (!branch) {
    return null;
  }

  const existingOrganization = await db.organization.findUnique({
    where: { id: branch.companyId, deleted: false },
  });

  if (!existingOrganization) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Organization ID");
  }

  const existingBranchByName = await db.branch.findFirst({
    where: { branchName: branch.branchName, deleted: false },
  });

  if (existingBranchByName) {
    throw new ApiError(
      httpStatus.CONFLICT,
      `Branch  name   "${branch.branchName}" already exists `
    );
  }

  return await db.branch.create({
    data: {
      branchName: branch.branchName,
      branchLocation: branch.branchLocation,
      companyId: branch.companyId,
    },
  });
};

//queryBranches
export const queryBranches = async (
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
    db.branch.findMany({
      where: finalFilter,
      select: BranchKeys,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortType },
    }),
    db.branch.count({ where: finalFilter }),
  ]);

  return { data, total };
};

// getBranchById
const getBranchById = async (branchId: string) => {
  return await db.branch.findUnique({
    where: { id: branchId, deleted: false },
    select: BranchKeys,
  });
};

// updateBranchById
export const updateBranchById = async (
  branchId: string,
  updateBody: Prisma.BranchUpdateInput,
  selectKeys: Prisma.BranchSelect = BranchKeys
): Promise<any | null> => {
  if (!branchId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Branch ID is required");
  }
  const branch = await db.branch.findUnique({
    where: { id: branchId, deleted: false },
  });

  if (!branch) {
    throw new ApiError(httpStatus.NOT_FOUND, "Branch not found");
  }

  // Check if branchName is being updated
  if (updateBody.branchName) {
    const currentName = branch.branchName;
    let newName: string | undefined;

    // Extract new name value from update body
    if (typeof updateBody.branchName === "string") {
      newName = updateBody.branchName;
    } else if (
      updateBody.branchName &&
      typeof updateBody.branchName === "object" &&
      "set" in updateBody.branchName
    ) {
      newName = updateBody.branchName.set;
    }

    // Check if name is actually changing
    if (newName && newName !== currentName) {
      const existingBranchWithName = await db.branch.findFirst({
        where: {
          branchName: newName,
          id: { not: branchId },
          deleted: false,
        },
      });

      if (existingBranchWithName) {
        throw new ApiError(httpStatus.CONFLICT, "Branch name already exists");
      }
    }
  }

  return await db.branch.update({
    where: { id: branchId },
    data: updateBody,
    select: selectKeys,
  });
};

// deleteBranchById
const deleteBranchById = async (
  branchId: string
): Promise<Omit<Branch, "sensitiveField">> => {
  // Fetch branch (including soft-deleted)
  const branch = await db.branch.findUnique({
    where: { id: branchId },
  });

  if (!branch) {
    throw new ApiError(httpStatus.NOT_FOUND, "Branch not found");
  }

  if (branch.deleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Branch already deleted");
  }

  try {
    const updatedBranch = await db.$transaction(
      async (tx) => {
        // Check for active departments (non-deleted)
        const departmentCount = await tx.department.count({
          where: {
            branchId: branchId,
            deleted: false,
          },
        });

        if (departmentCount > 0) {
          const message =
            departmentCount === 1
              ? "This branch has active departments and cannot be deleted."
              : `This branch has ${departmentCount} active departments and cannot be deleted.`;
          throw new ApiError(httpStatus.BAD_REQUEST, message);
        }

        // Soft-delete related entities
        // Asset Assignments
        await tx.assetAssignment.updateMany({
          where: {
            asset: {
              OR: [
                { branchId: branchId },
                { department: { branchId: branchId } },
              ],
            },
          },
          data: { deleted: true },
        });

        // Asset Histories
        await tx.assetHistory.updateMany({
          where: {
            asset: {
              OR: [
                { branchId: branchId },
                { department: { branchId: branchId } },
              ],
            },
          },
          data: { deleted: true },
        });

        // Assets
        await tx.asset.updateMany({
          where: {
            OR: [
              { branchId: branchId },
              { department: { branchId: branchId } },
            ],
          },
          data: {
            deleted: true,
          },
        });

        // Users
        await tx.user.updateMany({
          where: {
            OR: [
              { branchId: branchId },
              { department: { branchId: branchId } },
            ],
          },
          data: { deleted: true },
        });

        // Departments (soft-delete remaining if any)
        await tx.department.updateMany({
          where: { branchId: branchId },
          data: { deleted: true },
        });

        // Finally soft-delete branch
        return tx.branch.update({
          where: { id: branchId },
          data: {
            deleted: true,
          },
        });
      },
      {
        maxWait: 5000,
        timeout: 15000,
      }
    );

    return updatedBranch;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Branch soft delete failed:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

//deleteBranchesByIds
const deleteBranchesByIds = async (
  branchIds: string[]
): Promise<Omit<Branch, "sensitiveField">[]> => {
  // Fetch all branches (including soft-deleted)
  const branches = await db.branch.findMany({
    where: { id: { in: branchIds } },
  });

  // Check for missing IDs
  const foundIds = branches.map((b) => b.id);
  const missingIds = branchIds.filter((id) => !foundIds.includes(id));
  if (missingIds.length > 0) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Branches not found: ${missingIds.join(", ")}`
    );
  }

  // Check if any are already soft-deleted
  const alreadyDeleted = branches.filter((b) => b.deleted);
  if (alreadyDeleted.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Branches already deleted: ${alreadyDeleted.map((b) => b.id).join(", ")}`
    );
  }

  try {
    const updatedBranches = await db.$transaction(
      async (tx) => {
        // Check for active departments
        const activeDepartments = await tx.department.count({
          where: {
            branchId: { in: branchIds },
            deleted: false,
          },
        });

        if (activeDepartments > 0) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Cannot delete branches with active departments"
          );
        }

        // 1. Asset Assignments
        await tx.assetAssignment.updateMany({
          where: {
            asset: {
              OR: [
                { branchId: { in: branchIds } },
                { department: { branchId: { in: branchIds } } },
              ],
            },
          },
          data: { deleted: true },
        });

        // 2. Asset Histories
        await tx.assetHistory.updateMany({
          where: {
            asset: {
              OR: [
                { branchId: { in: branchIds } },
                { department: { branchId: { in: branchIds } } },
              ],
            },
          },
          data: { deleted: true },
        });

        // 3. Assets
        await tx.asset.updateMany({
          where: {
            OR: [
              { branchId: { in: branchIds } },
              { department: { branchId: { in: branchIds } } },
            ],
          },
          data: { deleted: true },
        });

        // 4. Users
        await tx.user.updateMany({
          where: {
            OR: [
              { branchId: { in: branchIds } },
              { department: { branchId: { in: branchIds } } },
            ],
          },
          data: { deleted: true },
        });

        // 5. Departments
        await tx.department.updateMany({
          where: { branchId: { in: branchIds } },
          data: { deleted: true },
        });

        // 6. Branches
        await tx.branch.updateMany({
          where: { id: { in: branchIds } },
          data: { deleted: true },
        });

        return tx.branch.findMany({
          where: { id: { in: branchIds } },
        });
      },
      { maxWait: 5000, timeout: 20000 }
    );

    return updatedBranches;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Bulk branch soft-delete error:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

//getBranchesByOrganizationId
const getBranchesByOrganizationId = async (
  organizationId: string,
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
    companyId: organizationId,
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
            branchName: {
              contains: options.searchTerm,
              mode: "insensitive" as const,
            },
          },
          {
            branchLocation: {
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
    db.branch.findMany({
      where,
      select: {
        id: true,
        branchName: true,
        branchLocation: true,
        createdAt: true,
        departments: {
          select: {
            id: true,
            departmentName: true,
          },
        },
        users: {
          select: {
            id: true,
            userName: true,
            email: true,
          },
        },
        assets: {
          select: {
            id: true,
            assetName: true,
            status: true,
          },
        },
      },
      skip,
      take: finalLimit,
      orderBy: {
        [sortBy]: sortType,
      },
    }),
    db.branch.count({ where }),
  ]);

  return { data, total };
};

export default {
  createBranch,
  queryBranches,
  getBranchById,
  updateBranchById,
  deleteBranchById,
  deleteBranchesByIds,
  getBranchesByOrganizationId,
};
