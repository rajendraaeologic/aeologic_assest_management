import { Organization, Prisma } from "@prisma/client";
import db from "@/lib/db";
import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import { OrganizationKeys } from "@/utils/selects.utils";

//createOrganization
const createOrganization = async (
  organization: Pick<Organization, "organizationName">
): Promise<Omit<Organization, "id"> | null> => {
  if (!organization) {
    return null;
  }

  const existingOrganization = await db.organization.findFirst({
    where: { organizationName: organization.organizationName, deleted: false },
  });

  if (existingOrganization) {
    throw new ApiError(
      httpStatus.CONFLICT,
      `Organization name "${existingOrganization.organizationName}" already exist`
    );
  }

  return await db.organization.create({
    data: {
      organizationName: organization.organizationName,
    },
  });
};

//queryOrganizations
const queryOrganizations = async (
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
  const sortType = options.sortType || "desc";

  const finalFilter = {
    ...filter,
    deleted: false,
  };

  const [data, total] = await Promise.all([
    db.organization.findMany({
      where: finalFilter,
      select: OrganizationKeys,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortType },
    }),
    db.organization.count({ where: finalFilter }),
  ]);

  return { data, total };
};

//getOrganizationById
const getOrganizationById = async (organizationId: string) => {
  return await db.organization.findUnique({
    where: { id: organizationId, deleted: false },
    select: OrganizationKeys,
  });
};

// updateOrganizationById
const updateOrganizationById = async (
  organizationId: string,
  updateBody: Prisma.OrganizationUpdateInput,
  selectKeys: Prisma.OrganizationSelect = OrganizationKeys
): Promise<any | null> => {
  const organization = await db.organization.findUnique({
    where: { id: organizationId, deleted: false },
  });

  if (!organization) {
    throw new ApiError(httpStatus.NOT_FOUND, "Organization not found");
  }

  if (updateBody.organizationName) {
    const currentName = organization.organizationName;
    let newName: string | undefined;

    // Extract new name value from update body
    if (typeof updateBody.organizationName === "string") {
      newName = updateBody.organizationName;
    } else if (
      updateBody.organizationName &&
      typeof updateBody.organizationName === "object" &&
      "set" in updateBody.organizationName
    ) {
      newName = updateBody.organizationName.set;
    }

    // Check if name is actually changing
    if (newName && newName !== currentName) {
      const existingOrganizationWithName = await db.organization.findFirst({
        where: {
          organizationName: newName,
          id: { not: organizationId },
          deleted: false,
        },
      });

      if (existingOrganizationWithName) {
        throw new ApiError(
          httpStatus.CONFLICT,
          "Organization name already exists"
        );
      }
    }
  }

  return await db.organization.update({
    where: { id: organizationId },
    data: updateBody,
    select: selectKeys,
  });
};

//deleteOrganizationById
const deleteOrganizationById = async (
  organizationId: string
): Promise<Organization> => {
  // Fetch organization (including soft-deleted ones)
  const organization = await db.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    throw new ApiError(httpStatus.NOT_FOUND, "Organization not found");
  }

  if (organization.deleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Organization already deleted");
  }

  try {
    const updatedOrganization = await db.$transaction(
      async (tx) => {
        // Check for active branches (non-deleted)
        const branchCount = await tx.branch.count({
          where: {
            companyId: organizationId,
            deleted: false,
          },
        });

        if (branchCount > 0) {
          const message =
            branchCount === 1
              ? "This organization has active branches and cannot be deleted."
              : `This organization has ${branchCount} active branches and cannot be deleted.`;
          throw new ApiError(httpStatus.BAD_REQUEST, message);
        }

        // Soft-delete all related entities
        // Asset Assignments
        await tx.assetAssignment.updateMany({
          where: {
            asset: {
              OR: [
                { branch: { companyId: organizationId } },
                { department: { branch: { companyId: organizationId } } },
              ],
            },
          },
          data: { deleted: true },
        });

        // Asset Histories
        await tx.assetHistory.updateMany({
          where: {
            asset: {
              OR: [
                { branch: { companyId: organizationId } },
                { department: { branch: { companyId: organizationId } } },
              ],
            },
          },
          data: { deleted: true },
        });

        // Assets
        await tx.asset.updateMany({
          where: {
            OR: [
              { branch: { companyId: organizationId } },
              { department: { branch: { companyId: organizationId } } },
            ],
          },
          data: { deleted: true },
        });

        // Users
        await tx.user.updateMany({
          where: {
            OR: [
              { branch: { companyId: organizationId } },
              { department: { branch: { companyId: organizationId } } },
            ],
          },
          data: { deleted: true },
        });

        // Departments
        await tx.department.updateMany({
          where: { branch: { companyId: organizationId } },
          data: { deleted: true },
        });

        // Branches
        await tx.branch.updateMany({
          where: { companyId: organizationId },
          data: { deleted: true },
        });

        // Soft-delete the organization
        return tx.organization.update({
          where: { id: organizationId },
          data: { deleted: true },
        });
      },
      { maxWait: 5000, timeout: 20000 }
    );

    return updatedOrganization;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Soft delete failed:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

// deleteOrganizationsByIds
const deleteOrganizationsByIds = async (
  organizationIds: string[]
): Promise<Organization[]> => {
  // Fetch all organizations (including soft-deleted)
  const organizations = await db.organization.findMany({
    where: { id: { in: organizationIds } },
  });

  // Check for missing IDs
  const foundIds = organizations.map((org) => org.id);
  const missingIds = organizationIds.filter((id) => !foundIds.includes(id));
  if (missingIds.length > 0) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Organizations not found: ${missingIds.join(", ")}`
    );
  }

  // Check if any are already soft-deleted
  const alreadyDeleted = organizations.filter((org) => org.deleted);
  if (alreadyDeleted.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Organizations already deleted: ${alreadyDeleted
        .map((o) => o.id)
        .join(", ")}`
    );
  }

  try {
    const updatedOrgs = await db.$transaction(
      async (tx) => {
        // Check for active branches in ANY organization
        const activeBranches = await tx.branch.count({
          where: {
            companyId: { in: organizationIds },
            deleted: false,
          },
        });

        if (activeBranches > 0) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Some organizations have active branches"
          );
        }

        // 1. Asset Assignments
        await tx.assetAssignment.updateMany({
          where: {
            asset: {
              OR: [
                { branch: { companyId: { in: organizationIds } } },
                {
                  department: {
                    branch: { companyId: { in: organizationIds } },
                  },
                },
              ],
            },
          },
          data: { deleted: true },
        });

        // 2. Asset Histories
        await tx.assetHistory.updateMany({
          where: {
            asset: {
              OR: [
                { branch: { companyId: { in: organizationIds } } },
                {
                  department: {
                    branch: { companyId: { in: organizationIds } },
                  },
                },
              ],
            },
          },
          data: { deleted: true },
        });

        // 3. Assets
        await tx.asset.updateMany({
          where: {
            OR: [
              { branch: { companyId: { in: organizationIds } } },
              {
                department: { branch: { companyId: { in: organizationIds } } },
              },
            ],
          },
          data: { deleted: true },
        });

        // 4. Users
        await tx.user.updateMany({
          where: {
            OR: [
              { branch: { companyId: { in: organizationIds } } },
              {
                department: { branch: { companyId: { in: organizationIds } } },
              },
            ],
          },
          data: { deleted: true },
        });

        // 5. Departments
        await tx.department.updateMany({
          where: { branch: { companyId: { in: organizationIds } } },
          data: { deleted: true },
        });

        // 6. Branches
        await tx.branch.updateMany({
          where: { companyId: { in: organizationIds } },
          data: { deleted: true },
        });

        // 7. Organizations
        await tx.organization.updateMany({
          where: { id: { in: organizationIds } },
          data: { deleted: true },
        });

        return tx.organization.findMany({
          where: { id: { in: organizationIds } },
        });
      },
      { maxWait: 5000, timeout: 20000 }
    );

    return updatedOrgs;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Bulk soft delete error:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

export default {
  createOrganization,
  queryOrganizations,
  getOrganizationById,
  updateOrganizationById,
  deleteOrganizationById,
  deleteOrganizationsByIds,
};
