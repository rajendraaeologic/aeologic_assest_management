import { Asset, AssetStatus, Prisma, User, UserStatus } from "@prisma/client";
import db from "@/lib/db";
import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import { AssetKeys, UserKeys } from "@/utils/selects.utils";

const getAvailableAssets = async (
  branchId?: string,
  departmentId?: string
): Promise<Asset[]> => {
  const where: Prisma.AssetWhereInput = {
    status: AssetStatus.ACTIVE,
    assignedToUserId: null,
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
    where: { id: assetId },
  });

  if (!asset) {
    throw new ApiError(httpStatus.NOT_FOUND, "Asset not found");
  }

  if (asset.status !== AssetStatus.ACTIVE) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Asset is not available for assignment (current status: ${asset.status})`
    );
  }

  // Check if user exists
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // Check for existing active assignment
  const existingAssignment = await db.assetAssignment.findFirst({
    where: {
      assetId,
      status: AssetStatus.ACTIVE,
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
    where: { id: assignmentId },
  });

  if (!assignment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Assignment not found");
  }

  if (assignment.status !== AssetStatus.ACTIVE) {
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
        status: AssetStatus.ACTIVE,
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
// const getAssetAssignments = async (
//   filter: Prisma.AssetAssignmentWhereInput = {},
//   options: {
//     limit?: number;
//     page?: number;
//     sortBy?: string;
//     sortType?: "asc" | "desc";
//   } = {}
// ): Promise<any[]> => {
//   const {
//     limit = 10,
//     page = 1,
//     sortBy = "assignedAt",
//     sortType = "desc",
//   } = options;
//   const skip = (page - 1) * limit;

//   return await db.assetAssignment.findMany({
//     where: filter,
//     include: {
//       asset: { select: AssetKeys },
//       user: { select: UserKeys },
//     },
//     skip,
//     take: limit,
//     orderBy: { [sortBy]: sortType },
//   });
// };
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

  const [data, total] = await Promise.all([
    db.assetAssignment.findMany({
      where: filter,
      include: {
        asset: { select: AssetKeys },
        user: { select: UserKeys },
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: sortType },
    }),
    db.assetAssignment.count({ where: filter }),
  ]);

  return { data, total };
};

// Get single assignment by ID
const getAssetAssignmentById = async (assignmentId: string) => {
  return await db.assetAssignment.findUnique({
    where: { id: assignmentId },
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
    status: (options.status as UserStatus) || "ACTIVE", // Cast to UserStatus enum
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
}> => {
  // Find the existing assignment
  const existingAssignment = await db.assetAssignment.findUnique({
    where: { id: assignmentId },
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
    const newAsset = await db.asset.findUnique({
      where: { id: updateData.assetId },
    });

    if (!newAsset) {
      throw new ApiError(httpStatus.NOT_FOUND, "New asset not found");
    }

    if (newAsset.status !== AssetStatus.ACTIVE) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `New asset is not available for assignment (current status: ${newAsset.status})`
      );
    }

    // Check if new asset is already assigned to someone else
    const existingAssignmentForNewAsset = await db.assetAssignment.findFirst({
      where: {
        assetId: updateData.assetId,
        status: AssetStatus.IN_USE,
        id: { not: assignmentId },
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
    const newUser = await db.user.findUnique({
      where: { id: updateData.userId },
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
                status: AssetStatus.ACTIVE,
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
  assignment: any;
  asset: Asset;
}> => {
  // First find the assignment to verify it exists
  const assignment = await db.assetAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      asset: true,
    },
  });

  if (!assignment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Assignment not found");
  }

  try {
    // Use transaction to ensure data consistency
    const [deletedAssignment, updatedAsset] = await db.$transaction([
      db.assetAssignment.delete({
        where: { id: assignmentId },
      }),
      db.asset.update({
        where: { id: assignment.assetId },
        data: {
          assignedToUserId: null,
          status: AssetStatus.ACTIVE,
        },
      }),
    ]);

    // Create history record
    await db.assetHistory.create({
      data: {
        assetId: assignment.assetId,
        userId: assignment.userId,
        action: "ASSIGNMENT_DELETED",
      },
    });

    return {
      assignment: deletedAssignment,
      asset: updatedAsset,
    };
  } catch (error) {
    console.error("Error deleting assignment:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

// Bulk delete assignments by IDs
const deleteAssignmentsByIds = async (
  assignmentIds: string[]
): Promise<{
  deletedCount: number;
  affectedAssets: Asset[];
}> => {
  // First verify all assignments exist
  const assignments = await db.assetAssignment.findMany({
    where: { id: { in: assignmentIds } },
    include: {
      asset: true,
    },
  });

  if (assignments.length !== assignmentIds.length) {
    const foundIds = assignments.map((a) => a.id);
    const missingIds = assignmentIds.filter((id) => !foundIds.includes(id));
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Assignments not found: ${missingIds.join(", ")}`
    );
  }

  try {
    // Get unique asset IDs that will be affected
    const assetIds = [...new Set(assignments.map((a) => a.assetId))];

    // Use transaction for atomic operations
    const result = await db.$transaction(async (prisma) => {
      // Delete the assignments
      const { count: deletedCount } = await prisma.assetAssignment.deleteMany({
        where: { id: { in: assignmentIds } },
      });

      // For each affected asset, check if it still has assignments
      const assetUpdates = await Promise.all(
        assetIds.map(async (assetId) => {
          const remainingAssignments = await prisma.assetAssignment.count({
            where: { assetId },
          });

          // If no assignments left, update asset status
          if (remainingAssignments === 0) {
            return prisma.asset.update({
              where: { id: assetId },
              data: {
                assignedToUserId: null,
                status: AssetStatus.ACTIVE,
              },
            });
          }
          return null;
        })
      );

      // Create history records for each deleted assignment
      await prisma.assetHistory.createMany({
        data: assignments.map((assignment) => ({
          assetId: assignment.assetId,
          userId: assignment.userId,
          action: "ASSIGNMENT_DELETED",
        })),
      });

      return {
        deletedCount,
        affectedAssets: assetUpdates.filter(Boolean) as Asset[],
      };
    });

    return result;
  } catch (error) {
    console.error("Error bulk deleting assignments:", error);
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
