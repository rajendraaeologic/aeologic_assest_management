import {
  Asset,
  AssetStatus,
  Prisma,
  User,
  UserStatus,
  AssetAssignment,
} from "@prisma/client";
import db from "@/lib/db";
import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import { AssetKeys, UserKeys } from "@/utils/selects.utils";

const getAvailableAssets = async (
  branchId?: string,
  departmentId?: string
): Promise<Asset[]> => {
  const where: Prisma.AssetWhereInput = {
    status: AssetStatus.UNASSIGNED,
    assignedToUserId: null,
    deleted: false,
    AssetAssignment: {
      none: {
        status: AssetStatus.IN_USE,
      },
    },
  };

  if (branchId) where.branchId = branchId;
  if (departmentId) where.departmentId = departmentId;

  return await db.asset.findMany({
    where,
    select: AssetKeys,
  });
};

const getUsersForAssignment = async (
  branchId?: string,
  departmentId?: string
): Promise<Partial<User>[]> => {
  const where: Prisma.UserWhereInput = {
    status: "ACTIVE",
    deleted: false,
  };

  if (branchId) where.branchId = branchId;
  if (departmentId) where.departmentId = departmentId;

  return await db.user.findMany({
    where,
    select: UserKeys,
  });
};

// Assign asset to user
const assignAsset = async (
  assetId: string,
  userId: string
): Promise<{
  assignment: any;
  asset: Asset;
  user: Partial<User>;
}> => {
  const asset = await db.asset.findUnique({
    where: { id: assetId, deleted: false },
  });

  if (!asset) {
    throw new ApiError(httpStatus.NOT_FOUND, "Asset not found");
  }

  if (asset.status !== AssetStatus.UNASSIGNED) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Asset is not available for assignment (current status: ${asset.status})`
    );
  }

  // Check if user exists
  const user = await db.user.findUnique({
    where: { id: userId, deleted: false },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // Check for existing active assignment
  const existingAssignment = await db.assetAssignment.findFirst({
    where: {
      assetId,
      status: AssetStatus.UNASSIGNED,
      deleted: false,
    },
  });

  if (existingAssignment) {
    throw new ApiError(
      httpStatus.CONFLICT,
      `Asset is already assigned to another user (Assignment ID: ${existingAssignment.id})`
    );
  }

  // Start transaction to ensure data consistency
  const [assignment, updatedAsset] = await db.$transaction([
    db.assetAssignment.create({
      data: {
        assetId,
        userId,
        status: AssetStatus.IN_USE,
      },
      include: {
        asset: { select: AssetKeys },
        user: { select: UserKeys },
      },
    }),
    db.asset.update({
      where: { id: assetId },
      data: {
        status: AssetStatus.IN_USE,
        assignedToUserId: userId,
      },
    }),
  ]);

  // Create asset history record
  await db.assetHistory.create({
    data: {
      assetId,
      userId,
      action: "ASSIGNED",
    },
  });

  return {
    assignment,
    asset: updatedAsset,
    user: assignment.user,
  };
};

// Unassign asset
const unassignAsset = async (
  assignmentId: string
): Promise<{
  assignment: any;
  asset: Asset;
}> => {
  const assignment = await db.assetAssignment.findUnique({
    where: { id: assignmentId, deleted: false },
  });

  if (!assignment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Assignment not found");
  }

  if (assignment.status !== AssetStatus.UNASSIGNED) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Assignment is not active (current status: ${assignment.status})`
    );
  }

  // Start transaction
  const [updatedAssignment, updatedAsset] = await db.$transaction([
    db.assetAssignment.update({
      where: { id: assignmentId },
      data: {
        status: AssetStatus.RETIRED,
      },
    }),
    db.asset.update({
      where: { id: assignment.assetId },
      data: {
        status: AssetStatus.UNASSIGNED,
        assignedToUserId: null,
      },
    }),
  ]);

  // Create asset history record
  await db.assetHistory.create({
    data: {
      assetId: assignment.assetId,
      userId: assignment.userId,
      action: "UNASSIGNED",
    },
  });

  return {
    assignment: updatedAssignment,
    asset: updatedAsset,
  };
};

// Get asset assignments with filters

export const getAssetAssignments = async (
  filter: Prisma.AssetAssignmentWhereInput = {},
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: "asc" | "desc";
  } = {}
): Promise<{ data: any[]; total: number }> => {
  const {
    limit = 10,
    page = 1,
    sortBy = "assignedAt",
    sortType = "desc",
  } = options;
  const skip = (page - 1) * limit;
  const finalFilter = {
    ...filter,
    deleted: false,
  };

  const [data, total] = await Promise.all([
    db.assetAssignment.findMany({
      where: finalFilter,
      include: {
        asset: { select: AssetKeys },
        user: { select: UserKeys },
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: sortType },
    }),
    db.assetAssignment.count({ where: finalFilter }),
  ]);

  return { data, total };
};

// Get single assignment by ID
const getAssetAssignmentById = async (assignmentId: string) => {
  return await db.assetAssignment.findUnique({
    where: { id: assignmentId, deleted: false },
    include: {
      asset: { select: AssetKeys },
      user: { select: UserKeys },
    },
  });
};

export const getAssetsByDepartmentId = async (
  departmentId: string,
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
    departmentId,
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
            assetName: {
              contains: options.searchTerm,
              mode: "insensitive" as const,
            },
          },
          {
            uniqueId: {
              contains: options.searchTerm,
              mode: "insensitive" as const,
            },
          },
          {
            serialNumber: {
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
    db.asset.findMany({
      where,
      select: AssetKeys,
      skip,
      take: finalLimit,
      orderBy: {
        [sortBy]: sortType,
      },
    }),
    db.asset.count({ where }),
  ]);

  return { data, total };
};

export const getUsersByDepartmentId = async (
  departmentId: string,
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
): Promise<{ data: Partial<User>[]; total: number }> => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy || "createdAt";
  const sortType = options.sortType ?? "desc";

  // Use proper Prisma types for the filters
  const filters: Prisma.UserWhereInput = {
    departmentId,
    deleted: false,
    status: (options.status as UserStatus) || "ACTIVE",
  };

  if (options.createdAtFrom || options.createdAtTo) {
    filters.createdAt = {} as Prisma.DateTimeFilter;
    if (options.createdAtFrom) filters.createdAt.gte = options.createdAtFrom;
    if (options.createdAtTo) filters.createdAt.lte = options.createdAtTo;
  }

  // Properly type the search conditions
  const searchConditions: Prisma.UserWhereInput = options.searchTerm?.trim()
    ? {
        OR: [
          {
            userName: {
              contains: options.searchTerm,
              mode: "insensitive" as const,
            },
          },
          {
            email: {
              contains: options.searchTerm,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : {};

  const where: Prisma.UserWhereInput = {
    ...filters,
    ...searchConditions,
  };

  const finalLimit = options.searchTerm ? 5 : limit;

  const [data, total] = await Promise.all([
    db.user.findMany({
      where,
      select: UserKeys,
      skip,
      take: finalLimit,
      orderBy: {
        [sortBy]: sortType,
      },
    }),
    db.user.count({ where }),
  ]);

  return { data, total };
};

const updateAssetAssignment = async (
  assignmentId: string,
  updateData: {
    assetId?: string;
    userId?: string;
    departmentId?: string;
  }
): Promise<{
  assignment: any;
  asset: Asset;
  user: Partial<User>;
  oldAsset?: Asset;
}> => {
  // Find the existing assignment
  const existingAssignment = await db.assetAssignment.findFirst({
    where: {
      id: assignmentId,
      deleted: false, // Ensure assignment is not soft-deleted (if applicable)
    },
    include: {
      asset: true,
      user: true,
    },
  });

  if (!existingAssignment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Assignment not found");
  }

  // Check if the new asset is available (if being changed)
  if (updateData.assetId && updateData.assetId !== existingAssignment.assetId) {
    const newAsset = await db.asset.findFirst({
      where: {
        id: updateData.assetId,
        deleted: false, // Only consider non-deleted assets
      },
    });

    if (!newAsset) {
      throw new ApiError(httpStatus.NOT_FOUND, "New asset not found");
    }

    if (newAsset.status !== AssetStatus.UNASSIGNED) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `New asset is not available for assignment (current status: ${newAsset.status})`
      );
    }

    const existingAssignmentForNewAsset = await db.assetAssignment.findFirst({
      where: {
        assetId: updateData.assetId,
        status: AssetStatus.IN_USE,
        id: { not: assignmentId },
        deleted: false, // if soft-delete is supported
      },
    });

    if (existingAssignmentForNewAsset) {
      throw new ApiError(
        httpStatus.CONFLICT,
        `New asset is already assigned to another user`
      );
    }
  }

  // Check if new user exists (if being changed)
  if (updateData.userId && updateData.userId !== existingAssignment.userId) {
    const newUser = await db.user.findFirst({
      where: {
        id: updateData.userId,
        deleted: false, // Only non-deleted users allowed
      },
    });

    if (!newUser) {
      throw new ApiError(httpStatus.NOT_FOUND, "New user not found");
    }
  }

  // Start transaction
  const [updatedAssignment, updatedAsset, oldAsset] = await db.$transaction(
    async (prisma) => {
      // Update the assignment
      const updatedAssignment = await prisma.assetAssignment.update({
        where: { id: assignmentId },
        data: {
          assetId: updateData.assetId,
          userId: updateData.userId,
        },
        include: {
          asset: { select: AssetKeys },
          user: { select: UserKeys },
        },
      });

      // Update the new asset (if changed)
      const updatedAsset =
        updateData.assetId && updateData.assetId !== existingAssignment.assetId
          ? await prisma.asset.update({
              where: { id: updateData.assetId },
              data: {
                status: AssetStatus.IN_USE,
                assignedToUserId:
                  updateData.userId || existingAssignment.userId,
              },
            })
          : existingAssignment.asset;

      // Update the old asset (if asset was changed)
      const oldAsset =
        updateData.assetId && updateData.assetId !== existingAssignment.assetId
          ? await prisma.asset.update({
              where: { id: existingAssignment.assetId },
              data: {
                status: AssetStatus.UNASSIGNED,
                assignedToUserId: null,
              },
            })
          : null;

      return [updatedAssignment, updatedAsset, oldAsset];
    }
  );

  // Create asset history records
  await db.assetHistory.createMany({
    data: [
      {
        assetId: updateData.assetId || existingAssignment.assetId,
        userId: updateData.userId || existingAssignment.userId,
        action: "ASSIGNMENT_UPDATED",
      },
      ...(updateData.assetId &&
      updateData.assetId !== existingAssignment.assetId
        ? [
            {
              assetId: existingAssignment.assetId,
              userId: existingAssignment.userId,
              action: "UNASSIGNED",
            },
          ]
        : []),
    ],
  });

  return {
    assignment: updatedAssignment,
    asset: updatedAsset,
    user: updatedAssignment.user,
    ...(oldAsset ? { oldAsset } : {}),
  };
};

// Delete single assignment by ID
const deleteAssignmentById = async (
  assignmentId: string
): Promise<{
  assignment: Omit<AssetAssignment, "sensitiveField">;
  asset: Asset;
}> => {
  // Step 1: Fetch assignment (even if soft-deleted)
  const assignment = await db.assetAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      asset: true,
    },
  });

  if (!assignment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Assignment not found");
  }

  if (assignment.deleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Assignment already deleted");
  }

  try {
    const result = await db.$transaction(
      async (tx) => {
        // Step 2: Soft-delete assignment
        const softDeletedAssignment = await tx.assetAssignment.update({
          where: { id: assignmentId },
          data: { deleted: true, deletedAt: new Date() },
        });

        // Step 3: Update asset - clear assignment
        const updatedAsset = await tx.asset.update({
          where: { id: assignment.assetId },
          data: {
            assignedToUserId: null,
            status: AssetStatus.UNASSIGNED,
          },
        });

        // Step 4: Log action in asset history
        await tx.assetHistory.create({
          data: {
            assetId: assignment.assetId,
            userId: assignment.userId,
            action: "ASSIGNMENT_SOFT_DELETED",
          },
        });

        return {
          assignment: softDeletedAssignment,
          asset: updatedAsset,
        };
      },
      {
        maxWait: 5000,
        timeout: 15000,
      }
    );

    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Assignment soft delete failed:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

// Bulk delete assignments by IDs
const deleteAssignmentsByIds = async (
  assignmentIds: string[]
): Promise<{
  assignments: Omit<AssetAssignment, "sensitiveField">[];
  updatedAssets: Asset[];
}> => {
  // Step 1: Fetch assignments (including soft-deleted)
  const assignments = await db.assetAssignment.findMany({
    where: { id: { in: assignmentIds } },
    include: {
      asset: true,
    },
  });

  const foundIds = assignments.map((a) => a.id);
  const missingIds = assignmentIds.filter((id) => !foundIds.includes(id));

  if (missingIds.length > 0) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Assignments not found: ${missingIds.join(", ")}`
    );
  }

  const alreadyDeleted = assignments.filter((a) => a.deleted);
  if (alreadyDeleted.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Assignments already deleted: ${alreadyDeleted
        .map((a) => a.id)
        .join(", ")}`
    );
  }

  try {
    const result = await db.$transaction(async (tx) => {
      // Step 2: Soft-delete assignments
      await tx.assetAssignment.updateMany({
        where: { id: { in: assignmentIds } },
        data: { deleted: true, deletedAt: new Date() },
      });

      // Step 3: Update affected assets (if no active assignments remain)
      const affectedAssetIds = [...new Set(assignments.map((a) => a.assetId))];

      const updatedAssets: Asset[] = [];

      for (const assetId of affectedAssetIds) {
        const remainingAssignments = await tx.assetAssignment.count({
          where: {
            assetId,
            deleted: false,
          },
        });

        if (remainingAssignments === 0) {
          const updatedAsset = await tx.asset.update({
            where: { id: assetId },
            data: {
              assignedToUserId: null,
              status: AssetStatus.UNASSIGNED,
            },
          });

          updatedAssets.push(updatedAsset);
        }
      }

      // Step 4: Log asset history
      await tx.assetHistory.createMany({
        data: assignments.map((a) => ({
          assetId: a.assetId,
          userId: a.userId,
          action: "ASSIGNMENT_SOFT_DELETED",
        })),
      });

      // Step 5: Return updated records
      const softDeletedAssignments = await tx.assetAssignment.findMany({
        where: { id: { in: assignmentIds } },
      });

      return {
        assignments: softDeletedAssignments,
        updatedAssets,
      };
    });

    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Bulk assignment soft delete failed:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

export default {
  assignAsset,
  unassignAsset,
  getAssetAssignments,
  getAssetAssignmentById,
  getAvailableAssets,
  getUsersForAssignment,
  getAssetsByDepartmentId,
  getUsersByDepartmentId,
  updateAssetAssignment,
  deleteAssignmentsByIds,
  deleteAssignmentById,
};
