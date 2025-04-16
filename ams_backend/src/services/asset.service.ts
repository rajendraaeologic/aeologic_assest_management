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
    | "locationId"
  >
): Promise<Omit<Asset, "id"> | null> => {
  if (!asset) {
    return null;
  }

  const branchExists = await db.branch.findUnique({
    where: { id: asset.branchId },
  });
  if (!branchExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Branch ID");
  }

  const departmentExists = await db.department.findUnique({
    where: { id: asset.departmentId },
  });
  if (!departmentExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Department ID");
  }

  const locationExists = await db.location.findUnique({
    where: { id: asset.locationId },
  });
  if (!locationExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Location ID");
  }

  const existingAsset = await db.asset.findFirst({
    where: { uniqueId: asset.uniqueId },
  });
  if (existingAsset) {
    throw new ApiError(
      httpStatus.CONFLICT,
      `Asset with unique ID "${existingAsset.uniqueId}" already exists`
    );
  }

  return await db.asset.create({
    data: {
      assetName: asset.assetName,
      uniqueId: asset.uniqueId,
      brand: asset.brand,
      model: asset.model,
      serialNumber: asset.serialNumber,
      status: asset.status,
      description: asset.description,
      branchId: asset.branchId,
      departmentId: asset.departmentId,
      locationId: asset.locationId,
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

  await db.asset.delete({ where: { id: asset.id } });
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
    throw new ApiError(httpStatus.NOT_FOUND, "Some assets not found");
  }

  await db.asset.deleteMany({
    where: { id: { in: assetIds } },
  });

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
