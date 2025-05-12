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
    where: { id: branch.companyId },
  });

  if (!existingOrganization) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Organization ID");
  }

  const existingBranchByName = await db.branch.findFirst({
    where: { branchName: branch.branchName },
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

  const [data, total] = await Promise.all([
    db.branch.findMany({
      where: filter,
      select: BranchKeys,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortType },
    }),
    db.branch.count({ where: filter }),
  ]);

  return { data, total };
};

// getBranchById
const getBranchById = async (branchId: string) => {
  return await db.branch.findUnique({
    where: { id: branchId },
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
    where: { id: branchId },
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
  const branch = await getBranchById(branchId);

  if (!branch) {
    throw new ApiError(httpStatus.NOT_FOUND, "Branch not found");
  }

  try {
    await db.$transaction(
      async (tx) => {
        //  Check if any departments are linked to this branch
        const departmentCount = await db.department.count({
          where: { branchId },
        });

        if (departmentCount > 0) {
          const message =
            departmentCount === 1
              ? "This branch is associated with department and cannot be deleted"
              : `This branch is associated with ${departmentCount} departments and cannot be deleted`;
          throw new ApiError(httpStatus.BAD_REQUEST, message);
        }
        await tx.department.deleteMany({ where: { branchId } });

        await tx.assetAssignment.deleteMany({
          where: {
            asset: {
              OR: [{ branchId }, { department: { branchId } }],
            },
          },
        });

        await tx.assetHistory.deleteMany({
          where: {
            asset: {
              OR: [{ branchId }, { department: { branchId } }],
            },
          },
        });

        await tx.asset.deleteMany({
          where: {
            OR: [{ branchId }, { department: { branchId } }],
          },
        });

        await tx.user.deleteMany({
          where: {
            OR: [{ branchId }, { department: { branchId } }],
          },
        });

        await tx.branch.delete({ where: { id: branchId } });
      },
      {
        maxWait: 5000,
        timeout: 15000,
      }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error("Error while deleting branch:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }

  return branch;
};

//deleteBranchesByIds

const deleteBranchesByIds = async (
  branchIds: string[]
): Promise<Omit<Branch, "sensitiveField">[]> => {
  const branches = await db.branch.findMany({
    where: { id: { in: branchIds } },
  });

  if (branches.length !== branchIds.length) {
    const foundIds = branches.map((b) => b.id);
    const missingIds = branchIds.filter((id) => !foundIds.includes(id));
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Branches not found: ${missingIds.join(", ")}`
    );
  }

  try {
    await db.$transaction(
      async (tx) => {
        //  Step 1: Check if any departments are linked to these branches
        const departments = await tx.department.findMany({
          where: { branchId: { in: branchIds } },
          select: { branchId: true },
        });

        const branchesWithDepartments = new Set(
          departments.map((d) => d.branchId)
        );

        const blockedBranches = branchIds.filter((id) =>
          branchesWithDepartments.has(id)
        );

        if (blockedBranches.length > 0) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            "This branches is associated with departments and cannot be deleted."
          );
        }

        //  Step 2: Proceed with deletions only if safe
        await tx.assetAssignment.deleteMany({
          where: {
            asset: {
              OR: [
                { branchId: { in: branchIds } },
                { department: { branchId: { in: branchIds } } },
              ],
            },
          },
        });

        await tx.assetHistory.deleteMany({
          where: {
            asset: {
              OR: [
                { branchId: { in: branchIds } },
                { department: { branchId: { in: branchIds } } },
              ],
            },
          },
        });

        await tx.asset.deleteMany({
          where: {
            OR: [
              { branchId: { in: branchIds } },
              { department: { branchId: { in: branchIds } } },
            ],
          },
        });

        await tx.user.deleteMany({
          where: {
            OR: [
              { branchId: { in: branchIds } },
              { department: { branchId: { in: branchIds } } },
            ],
          },
        });

        await tx.branch.deleteMany({
          where: { id: { in: branchIds } },
        });
      },
      {
        maxWait: 5000,
        timeout: 20000,
      }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error("Error deleting branches:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }

  return branches;
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
