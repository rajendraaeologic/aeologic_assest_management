import { Branch, Prisma } from "@prisma/client";
import db from "@/lib/db";
import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import { BranchKeys } from "@/utils/selects.utils";
// createBranch
const createBranch = async (
  branch: Pick<Branch, "name" | "location" | "companyId">
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
    where: { name: branch.name },
  });

  if (existingBranchByName) {
    throw new ApiError(
      httpStatus.CONFLICT,
      `Branch  name   "${branch.name}" already exists `
    );
  }

  return await db.branch.create({
    data: {
      name: branch.name,
      location: branch.location,
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
): Promise<any[]> => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const skip = (page - 1) * limit || 0;
  const sortBy = options.sortBy;
  const sortType = options.sortType ?? "desc";

  return await db.branch.findMany({
    where: { ...filter },
    select: BranchKeys,
    skip: skip > 0 ? skip : 0,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType } : undefined,
  });
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
  return await db.$transaction(async (tx) => {
    await tx.department.deleteMany({ where: { branchId } });
    await tx.asset.deleteMany({ where: { branchId } });
    await tx.user.deleteMany({ where: { branchId } });
    await tx.branch.delete({ where: { id: branch.id } });

    return branch;
  });
};
//deleteBranchesByIds
const deleteBranchesByIds = async (
  branchIds: string[]
): Promise<Omit<Branch, "sensitiveField">[]> => {
  const branches = await Promise.all(
    branchIds.map((id) => db.branch.findUnique({ where: { id } }))
  );

  const notFoundIds = branchIds.filter((_, index) => !branches[index]);
  if (notFoundIds.length > 0) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Branches not found: ${notFoundIds.join(", ")}`
    );
  }

  return await db.$transaction(async (tx) => {
    await tx.department.deleteMany({ where: { branchId: { in: branchIds } } });
    await tx.asset.deleteMany({ where: { branchId: { in: branchIds } } });
    await tx.user.deleteMany({ where: { branchId: { in: branchIds } } });

    const deletedBranches = await Promise.all(
      branchIds.map((id) => tx.branch.delete({ where: { id } }))
    );

    return deletedBranches;
  });
};

export default {
  createBranch,
  queryBranches,
  getBranchById,
  updateBranchById,
  deleteBranchById,
  deleteBranchesByIds,
};
