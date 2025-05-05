import { Asset, Prisma } from "@prisma/client";
import db from "@/lib/db";
import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import { AssetKeys } from "@/utils/selects.utils";

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
  >
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

  const [companyExists, branchExists, departmentExists, assetExists] =
    await Promise.all([
      db.organization.findUnique({ where: { id: asset.companyId } }),
      db.branch.findUnique({ where: { id: asset.branchId } }),
      db.department.findUnique({ where: { id: asset.departmentId } }),
      db.asset.findFirst({ where: { uniqueId: asset.uniqueId } }),
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
  if (assetExists) {
    throw new ApiError(
      httpStatus.CONFLICT,
      `Asset with unique ID "${asset.uniqueId}" already exists`
    );
  }

  return db.asset.create({
    data: {
      assetName: asset.assetName,
      uniqueId: asset.uniqueId,
      brand: asset.brand,
      model: asset.model,
      serialNumber: asset.serialNumber,
      status: asset.status,
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
};

// queryAssets
const queryAssets = async (
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

  return await db.asset.findMany({
    where: { ...filter },
    select: AssetKeys,
    skip: skip > 0 ? skip : 0,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType } : undefined,
  });
};

// getAssetById
const getAssetById = async (assetId: string) => {
  return await db.asset.findUnique({
    where: { id: assetId },
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
    where: { id: assetId },
  });

  if (!asset) {
    throw new ApiError(httpStatus.NOT_FOUND, "Asset not found");
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
  const asset = await getAssetById(assetId);
  if (!asset) {
    throw new ApiError(httpStatus.NOT_FOUND, "Asset not found");
  }

  try {
    await db.$transaction(
      async (tx) => {
        await tx.asset.delete({ where: { id: asset.id } });
      },
      {
        maxWait: 5000,
        timeout: 10000,
      }
    );
  } catch (error) {
    console.error("Error deleting asset:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to delete asset. Please try again later."
    );
  }

  return asset;
};

// deleteAssetsByIds
const deleteAssetsByIds = async (
  assetIds: string[]
): Promise<Omit<Asset, "sensitiveField">[]> => {
  const assets = await db.asset.findMany({
    where: { id: { in: assetIds } },
  });

  if (assets.length !== assetIds.length) {
    const foundIds = assets.map((a) => a.id);
    const missingIds = assetIds.filter((id) => !foundIds.includes(id));
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Assets not found: ${missingIds.join(", ")}`
    );
  }

  try {
    await db.$transaction(
      async (tx) => {
        await tx.asset.deleteMany({
          where: { id: { in: assetIds } },
        });
      },
      {
        maxWait: 5000,
        timeout: 10000,
      }
    );
  } catch (error) {
    console.error("Error deleting assets:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to delete assets. Please try again later."
    );
  }

  return assets;
};

export default {
  createAsset,
  queryAssets,
  getAssetById,
  updateAssetById,
  deleteAssetById,
  deleteAssetsByIds,
};
