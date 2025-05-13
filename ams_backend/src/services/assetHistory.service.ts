import { Prisma } from "@prisma/client";
import db from "@/lib/db";
import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import { AssetHistoryKeys } from "@/utils/selects.utils";

const queryAssetHistories = async (
  filter: Prisma.AssetHistoryWhereInput = {},
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
    sortBy = "timestamp",
    sortType = "desc",
  } = options;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    db.assetHistory.findMany({
      where: filter,
      select: AssetHistoryKeys,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortType },
    }),
    db.assetHistory.count({ where: filter }),
  ]);

  return { data, total };
};

const getAssetHistoryById = async (historyId: string) => {
  return await db.assetHistory.findUnique({
    where: { id: historyId },
    select: AssetHistoryKeys,
  });
};

const getAssetHistoriesByAssetId = async (
  assetId: string,
  filter: Prisma.AssetHistoryWhereInput = {},
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
    sortBy = "timestamp",
    sortType = "desc",
  } = options;
  const skip = (page - 1) * limit;

  const where = { ...filter, assetId };

  const [data, total] = await Promise.all([
    db.assetHistory.findMany({
      where,
      select: AssetHistoryKeys,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortType },
    }),
    db.assetHistory.count({ where }),
  ]);

  return { data, total };
};

export default {
  queryAssetHistories,
  getAssetHistoryById,
  getAssetHistoriesByAssetId,
};
