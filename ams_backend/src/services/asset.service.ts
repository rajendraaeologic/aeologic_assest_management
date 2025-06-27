import {Asset, AssetStatus, Prisma, User, UserRole} from "@prisma/client";
import db from "@/lib/db";
import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import { AssetKeys } from "@/utils/selects.utils";
import xlsx from "xlsx";

// createAsset
const createAsset = async (
    asset: Pick<
        Asset,
        | "assetName"
        | "uniqueId"
        | "brand"
        | "model"
        | "serialNumber"
        | "status"
        | "description"
        | "branchId"
        | "departmentId"
        | "companyId"
    > & { createdById: string }
): Promise<Omit<Asset, "id"> | null> => {
  if (!asset.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company ID is required");
  }
  if (!asset.branchId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Branch ID is required");
  }
  if (!asset.departmentId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Department ID is required");
  }

  const lowerCaseAssetName = asset.assetName.toLowerCase();

  const [companyExists, branchExists, departmentExists, assetUniqueIdExists, assetNameExists] =
      await Promise.all([
        db.organization.findUnique({ where: { id: asset.companyId } }),
        db.branch.findUnique({ where: { id: asset.branchId } }),
        db.department.findUnique({ where: { id: asset.departmentId } }),
        db.asset.findFirst({
          where: {
            uniqueId: asset.uniqueId,
            deleted: false,
          },
        }),
        db.asset.findFirst({
          where: {
            assetName: lowerCaseAssetName,
            deleted: false,
          },
        }),
      ]);

  if (!companyExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Company ID");
  }
  if (!branchExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Branch ID");
  }
  if (!departmentExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Department ID");
  }
  if (assetUniqueIdExists) {
    throw new ApiError(
      httpStatus.CONFLICT,
      `Asset with unique ID "${asset.uniqueId}" already exists`
    );
  }
  if (assetNameExists) {
    throw new ApiError(
        httpStatus.CONFLICT,
        `Asset name "${asset.assetName}" already exists`
    );
  }

  return db.$transaction(async (tx) => {
    const createdAsset = await tx.asset.create({
      data: {
        assetName: lowerCaseAssetName,
        uniqueId: asset.uniqueId,
        brand: asset.brand,
        model: asset.model,
        serialNumber: asset.serialNumber,
        status: asset.status || AssetStatus.UNASSIGNED,
        description: asset.description,
        company: {
          connect: { id: asset.companyId },
        },
        branch: {
          connect: { id: asset.branchId },
        },
        department: {
          connect: { id: asset.departmentId },
        },
      },
    });

    await tx.assetHistory.create({
      data: {
        action: AssetStatus.UNASSIGNED,
        asset: {
          connect: { id: createdAsset.id },
        },
        user: {
          connect: { id: asset.createdById },
        },
        timestamp: new Date(),
      },
    });

    return createdAsset;
  });
};

// queryAssets
export const queryAssets = async (
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
    db.asset.findMany({
      where: finalFilter,
      select: AssetKeys,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortType },
    }),
    db.asset.count({ where: finalFilter }),
  ]);

  return { data, total };
};

// getAssetById
const getAssetById = async (assetId: string) => {
  return await db.asset.findUnique({
    where: { id: assetId, deleted: false },
    select: AssetKeys,
  });
};

// updateAssetById
const updateAssetById = async (
  assetId: string,
  updateBody: Prisma.AssetUpdateInput,
  selectKeys: Prisma.AssetSelect = AssetKeys
): Promise<any | null> => {
  const asset = await db.asset.findUnique({
    where: { id: assetId, deleted: false },
  });

  if (!asset) {
    throw new ApiError(httpStatus.NOT_FOUND, "Asset not found");
  }

  // Check for uniqueId
  if (updateBody.uniqueId) {
    const currentUniqueId = asset.uniqueId;
    let newUniqueId: string | undefined;

    if (typeof updateBody.uniqueId === "string") {
      newUniqueId = updateBody.uniqueId;
    } else if (
      updateBody.uniqueId &&
      typeof updateBody.uniqueId === "object" &&
      "set" in updateBody.uniqueId
    ) {
      newUniqueId = updateBody.uniqueId.set;
    }

    if (newUniqueId && newUniqueId !== currentUniqueId) {
      const existingAssetWithUniqueId = await db.asset.findFirst({
        where: {
          uniqueId: newUniqueId,
          id: { not: assetId },
          deleted: false,
        },
      });

      if (existingAssetWithUniqueId) {
        throw new ApiError(
          httpStatus.CONFLICT,
          "Asset with this uniqueId already exists"
        );
      }
    }
  }

  // Check for serialNumber
  if (updateBody.serialNumber) {
    const currentSerialNumber = asset.serialNumber;
    let newSerialNumber: string | undefined;

    if (typeof updateBody.serialNumber === "string") {
      newSerialNumber = updateBody.serialNumber;
    } else if (
      updateBody.serialNumber &&
      typeof updateBody.serialNumber === "object" &&
      "set" in updateBody.serialNumber
    ) {
      newSerialNumber = updateBody.serialNumber.set;
    }

    if (newSerialNumber && newSerialNumber !== currentSerialNumber) {
      const existingAssetWithSerialNumber = await db.asset.findFirst({
        where: {
          serialNumber: newSerialNumber,
          id: { not: assetId },
          deleted: false,
        },
      });

      if (existingAssetWithSerialNumber) {
        throw new ApiError(
          httpStatus.CONFLICT,
          "Asset with this serialNumber already exists"
        );
      }
    }
  }

  // Check and lowercase assetName
  if (updateBody.assetName) {
    let newAssetName: string | undefined;

    if (typeof updateBody.assetName === "string") {
      newAssetName = updateBody.assetName.toLowerCase();
      updateBody.assetName = newAssetName;
    } else if (
        updateBody.assetName &&
        typeof updateBody.assetName === "object" &&
        "set" in updateBody.assetName
    ) {
      const nameValue = updateBody.assetName.set;
      if (typeof nameValue === "string") {
        newAssetName = nameValue.toLowerCase();
        updateBody.assetName.set = newAssetName;
      }
    }

    if (newAssetName && newAssetName !== asset.assetName.toLowerCase()) {
      const existingAssetWithName = await db.asset.findFirst({
        where: {
          assetName: newAssetName,
          id: { not: assetId },
          deleted: false,
        },
      });

      if (existingAssetWithName) {
        throw new ApiError(
            httpStatus.CONFLICT,
            `Asset with name "${existingAssetWithName.assetName}" already exists`
        );
      }
    }
  }

  return await db.asset.update({
    where: { id: assetId },
    data: updateBody,
    select: selectKeys,
  });
};

// deleteAssetById
const deleteAssetById = async (
  assetId: string
): Promise<Omit<Asset, "sensitiveField">> => {
  // Step 1: Fetch asset including soft-deleted
  const asset = await db.asset.findUnique({
    where: { id: assetId },
  });

  // Step 2: Check if asset exists
  if (!asset) {
    throw new ApiError(httpStatus.NOT_FOUND, "Asset not found");
  }

  // Step 3: Check if asset is already soft-deleted
  if (asset.deleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Asset is already deleted");
  }

  try {
    const updatedAsset = await db.$transaction(
      async (tx) => {
        // 1. Soft-delete Asset Assignments
        await tx.assetAssignment.updateMany({
          where: { assetId: asset.id },
          data: { deleted: true, deletedAt: new Date() },
        });

        // 2. Soft-delete Asset Histories
        await tx.assetHistory.updateMany({
          where: { assetId: asset.id },
          data: { deleted: true, deletedAt: new Date() },
        });

        // 3. Soft-delete Asset
        await tx.asset.update({
          where: { id: asset.id },
          data: { deleted: true, deletedAt: new Date() },
        });

        // Return the updated (soft-deleted) asset
        return tx.asset.findUnique({
          where: { id: asset.id },
        });
      },
      { maxWait: 5000, timeout: 10000 }
    );

    return updatedAsset!;
  } catch (error) {
    console.error("Soft-delete error for asset:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

// deleteAssetsByIds
const deleteAssetsByIds = async (
  assetIds: string[]
): Promise<Omit<Asset, "sensitiveField">[]> => {
  // Fetch all assets (including soft-deleted)
  const assets = await db.asset.findMany({
    where: { id: { in: assetIds } },
  });

  // Check for missing IDs
  const foundIds = assets.map((a) => a.id);
  const missingIds = assetIds.filter((id) => !foundIds.includes(id));
  if (missingIds.length > 0) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Assets not found: ${missingIds.join(", ")}`
    );
  }

  // Check if any assets are already soft-deleted
  const alreadyDeleted = assets.filter((a) => a.deleted);
  if (alreadyDeleted.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Assets already deleted: ${alreadyDeleted.map((a) => a.id).join(", ")}`
    );
  }

  try {
    const updatedAssets = await db.$transaction(
      async (tx) => {
        // 1. Soft delete asset assignments
        await tx.assetAssignment.updateMany({
          where: {
            assetId: { in: assetIds },
          },
          data: { deleted: true, deletedAt: new Date() },
        });

        // 2. Soft delete asset history
        await tx.assetHistory.updateMany({
          where: {
            assetId: { in: assetIds },
          },
          data: { deleted: true, deletedAt: new Date() },
        });

        // 3. Soft delete assets
        await tx.asset.updateMany({
          where: { id: { in: assetIds } },
          data: { deleted: true, deletedAt: new Date() },
        });

        return tx.asset.findMany({
          where: { id: { in: assetIds } },
        });
      },
      {
        maxWait: 5000,
        timeout: 20000,
      }
    );

    return updatedAssets;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Bulk asset soft-delete error:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

export interface ExportOrganizationFilters {
  organizationName?: string;
  assignedUser?: string;
  assetName?: string;
  model?: string;
  uniqueId?: string;
  status?: string;
  branchName?: string;
  departmentName?: string;
  searchTerm?: string;
  from_date?: string;
  to_date?: string;
  selectedDate?: string;
}
const exportAssetsToExcelService = async (user: User, filters: ExportOrganizationFilters): Promise<Buffer> => {
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

  let branchIds: string[] = [];
  let departmentIds: string[] = [];

  if (user.userRole !== UserRole.SUPERADMIN) {
    const companyBranches = await db.branch.findMany({
      where: { companyId: user.companyId },
      select: { id: true }
    });
    branchIds = companyBranches.map(branch => branch.id);

    const companyDepartments = await db.department.findMany({
      where: { branchId: { in: branchIds } },
      select: { id: true }
    });
    departmentIds = companyDepartments.map(dept => dept.id);
  }

  const where: any = {
    ...dateFilter,
    deleted: false,
    ...(user.userRole !== UserRole.SUPERADMIN ? {
      OR: [
        { branchId: { in: branchIds } },
        { departmentId: { in: departmentIds } },
        { companyId: user.companyId },
      ]
    } : {})
  };

  if (filters.assetName) {
    where.assetName = {
      contains: filters.assetName,
      mode: "insensitive"
    };
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.searchTerm?.trim()) {
    where.OR = [
      { assetName: { contains: filters.searchTerm, mode: "insensitive" } },
      { uniqueId: { contains: filters.searchTerm, mode: "insensitive" } },
      { serialNumber: { contains: filters.searchTerm, mode: "insensitive" } },
      { status: { contains: filters.searchTerm, mode: "insensitive" } },
    ];
  }

  const assets = await db.asset.findMany({
    where,
    select: AssetKeys,
  });

  if (!assets.length) {
    throw new ApiError(httpStatus.NOT_FOUND, "No assets found matching the criteria");
  }

  const excelData = assets.map(asset => ({
    "Asset Name": asset.assetName,
    "Unique ID": asset.uniqueId,
    "Brand": asset.brand,
    "Model": asset.model,
    "Serial Number": asset.serialNumber,
    "Status": asset.status,
    "Assigned To": asset.assignedUser?.userName || "Unassigned",
    "Branch": asset.branch?.branchName,
    "Department": asset.department?.departmentName,
    "Organization": asset.company?.organizationName,
    "Created At": asset.createdAt.toISOString(),
    "Updated At": asset.updatedAt.toISOString(),
  }));

  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(excelData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 25 }, // Asset Name
    { wch: 20 }, // Unique ID
    { wch: 20 }, // Brand
    { wch: 20 }, // Model
    { wch: 20 }, // Serial Number
    { wch: 15 }, // Status
    { wch: 20 }, // Assigned To
    { wch: 20 }, // Branch
    { wch: 20 }, // Department
    { wch: 25 }, // Organization
    { wch: 25 }, // Created At
    { wch: 25 }, // Updated At
  ];

  xlsx.utils.book_append_sheet(workbook, worksheet, "Assets");

  const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer;
};

export default {
  createAsset,
  queryAssets,
  getAssetById,
  updateAssetById,
  deleteAssetById,
  deleteAssetsByIds,
  exportAssetsToExcelService,
};
