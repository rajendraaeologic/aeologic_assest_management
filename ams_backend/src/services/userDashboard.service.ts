import db from "@/lib/db";
import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import { AssetAssignmentKeys } from "@/utils/selects.utils";
const queryAssignAssetUser = async (
  userId: string,
  filter: object,
  options: {
    sortBy?: string;
    sortType?: "asc" | "desc";
    limit?: number;
    page?: number;
  }
): Promise<any[]> => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const skip = (page - 1) * limit || 0;
  const sortBy = options.sortBy;
  const sortType = options.sortType ?? "desc";

  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User ID is required");
  }

  const combinedFilter = {
    ...filter,
    userId,
  };

  return await db.assetAssignment.findMany({
    where: combinedFilter,
    select: AssetAssignmentKeys,
    skip: skip > 0 ? skip : 0,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType } : undefined,
  });
};

export default {
  queryAssignAssetUser,
};
