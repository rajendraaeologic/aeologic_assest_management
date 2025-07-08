import {Branch, Prisma, User, UserRole} from "@prisma/client";
import db from "@/lib/db";
import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import { BranchKeys } from "@/utils/selects.utils";
import xlsx from "xlsx";
// createBranch
const createBranch = async (
    branch: Pick<Branch, "branchName" | "state" | "city" | "companyId">
): Promise<Omit<Branch, "id"> | null> => {
  if (!branch) {
    return null;
  }

  const lowerCaseBranchName = branch.branchName.toLowerCase();

  const existingOrganization = await db.organization.findUnique({
    where: { id: branch.companyId, deleted: false },
  });

  if (!existingOrganization) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Organization ID");
  }

  const existingBranchByName = await db.branch.findFirst({
    where: { branchName: lowerCaseBranchName, deleted: false },
  });

  if (existingBranchByName) {
    throw new ApiError(
        httpStatus.CONFLICT,
        `Branch name "${existingBranchByName.branchName}" already exists`
    );
  }

  return await db.branch.create({
    data: {
      branchName: lowerCaseBranchName,
      state: branch.state,
      city: branch.city,
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
          companyId: branch.companyId,
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
          data: { deleted: true, deletedAt: new Date() },
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
          data: { deleted: true, deletedAt: new Date() },
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
            deletedAt: new Date(),
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
          data: { deleted: true, deletedAt: new Date() },
        });

        // Departments (soft-delete remaining if any)
        await tx.department.updateMany({
          where: { branchId: branchId },
          data: { deleted: true, deletedAt: new Date() },
        });

        // Finally soft-delete branch
        return tx.branch.update({
          where: { id: branchId },
          data: {
            deleted: true,
            deletedAt: new Date(),
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
          data: { deleted: true, deletedAt: new Date() },
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
          data: { deleted: true, deletedAt: new Date() },
        });

        // 3. Assets
        await tx.asset.updateMany({
          where: {
            OR: [
              { branchId: { in: branchIds } },
              { department: { branchId: { in: branchIds } } },
            ],
          },
          data: { deleted: true, deletedAt: new Date() },
        });

        // 4. Users
        await tx.user.updateMany({
          where: {
            OR: [
              { branchId: { in: branchIds } },
              { department: { branchId: { in: branchIds } } },
            ],
          },
          data: { deleted: true, deletedAt: new Date() },
        });

        // 5. Departments
        await tx.department.updateMany({
          where: { branchId: { in: branchIds } },
          data: { deleted: true, deletedAt: new Date() },
        });

        // 6. Branches
        await tx.branch.updateMany({
          where: { id: { in: branchIds } },
          data: { deleted: true, deletedAt: new Date() },
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

  if (options.status) {
    filters.status = options.status;
  }

  if (options.createdAtFrom || options.createdAtTo) {
    filters.createdAt = {};
    if (options.createdAtFrom) {
      filters.createdAt.gte = options.createdAtFrom;
    }
    if (options.createdAtTo) {
      filters.createdAt.lte = options.createdAtTo;
    }
  }

  if (options.searchTerm) {
    filters.OR = [
      { branchName: { contains: options.searchTerm, mode: "insensitive" } },
      { city: { contains: options.searchTerm, mode: "insensitive" } },
      { state: { contains: options.searchTerm, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    db.branch.findMany({
      where: filters,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortType },
      select: BranchKeys,
    }),
    db.branch.count({ where: filters }),
  ]);

  return { data, total };
};

export interface ExportBranchFilters {
  branchName?: string;
  city?: string;
  state?: string;
  organizationName?: string;
  searchTerm?: string;
  from_date?: string;
  to_date?: string;
  selectedDate?: string;
}
const exportBranchesToExcelService = async (user: User, filters: ExportBranchFilters): Promise<Buffer> => {
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
  };

  if (filters.branchName) {
    where.branchName = {
      contains: filters.branchName,
      mode: "insensitive"
    };
  }

  if (filters.state) {
    where.state = {
      contains: filters.state,
      mode: "insensitive"
    };
  }

  if (filters.city) {
    where.city = {
      contains: filters.city,
      mode: "insensitive"
    };
  }

  if (filters.searchTerm?.trim()) {
    where.OR = [
      { branchName: { contains: filters.searchTerm, mode: "insensitive" } },
      { state: { contains: filters.searchTerm, mode: "insensitive" } },
      { city: { contains: filters.searchTerm, mode: "insensitive" } },
    ];
  }

  const branches = await db.branch.findMany({
    where,
    include: {
      company: {
        select: {
          organizationName: true,
        },
      },
    },
  });

  if (!branches.length) {
    throw new ApiError(httpStatus.NOT_FOUND, "No branches found matching the criteria");
  }

  const excelData = branches.map(branch => ({
    "Branch Name": branch.branchName,
    "State": branch.state,
    "City": branch.city,
    "Organization": branch.company?.organizationName || "N/A",
    "Created At": branch.createdAt.toISOString(),
    "Updated At": branch.updatedAt.toISOString(),
  }));

  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(excelData);

  worksheet['!cols'] = [
    { wch: 30 },
    { wch: 20 },
    { wch: 20 },
    { wch: 30 },
    { wch: 25 },
    { wch: 25 },

  ];

  xlsx.utils.book_append_sheet(workbook, worksheet, "Branches");
  const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer;
};

export default {
  createBranch,
  queryBranches,
  getBranchById,
  updateBranchById,
  deleteBranchById,
  deleteBranchesByIds,
  getBranchesByOrganizationId,
  exportBranchesToExcelService,
};
