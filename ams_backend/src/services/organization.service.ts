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
    where: { organizationName: organization.organizationName },
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

  const [data, total] = await Promise.all([
    db.organization.findMany({
      where: filter,
      select: OrganizationKeys,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortType },
    }),
    db.organization.count({ where: filter }),
  ]);

  return { data, total };
};

//getOrganizationById
const getOrganizationById = async (organizationId: string) => {
  return await db.organization.findUnique({
    where: { id: organizationId },
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
    where: { id: organizationId },
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
): Promise<Omit<Organization, "sensitiveField">> => {
  const organization = await getOrganizationById(organizationId);

  if (!organization) {
    throw new ApiError(httpStatus.NOT_FOUND, "Organization not found");
  }

  try {
    await db.$transaction(
      async (tx) => {
        // Check for existing branches first
        const branchCount = await tx.branch.count({
          where: { companyId: organizationId },
        });

        if (branchCount > 0) {
          const message =
            branchCount === 1
              ? "This organization is associated with branche and cannot be deleted."
              : `This organization is associated with ${branchCount} branches and cannot be deleted.`;
          throw new ApiError(httpStatus.BAD_REQUEST, message);
        }

        // Proceed with deletions if no branches found
        await tx.assetAssignment.deleteMany({
          where: {
            asset: {
              OR: [
                { branch: { companyId: organizationId } },
                { department: { branch: { companyId: organizationId } } },
              ],
            },
          },
        });

        await tx.assetHistory.deleteMany({
          where: {
            asset: {
              OR: [
                { branch: { companyId: organizationId } },
                { department: { branch: { companyId: organizationId } } },
              ],
            },
          },
        });

        await tx.asset.deleteMany({
          where: {
            OR: [
              { branch: { companyId: organizationId } },
              { department: { branch: { companyId: organizationId } } },
            ],
          },
        });

        await tx.user.deleteMany({
          where: {
            OR: [
              { branch: { companyId: organizationId } },
              { department: { branch: { companyId: organizationId } } },
            ],
          },
        });

        await tx.department.deleteMany({
          where: {
            branch: { companyId: organizationId },
          },
        });

        await tx.branch.deleteMany({
          where: { companyId: organizationId },
        });

        await tx.organization.delete({
          where: { id: organizationId },
        });
      },
      {
        maxWait: 5000,
        timeout: 20000,
      }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error("Error while deleting organization:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }

  return organization;
};

// deleteOrganizationsByIds
const deleteOrganizationsByIds = async (
  organizationIds: string[]
): Promise<Omit<Organization, "sensitiveField">[]> => {
  const organizations = await db.organization.findMany({
    where: { id: { in: organizationIds } },
  });

  if (organizations.length !== organizationIds.length) {
    const foundIds = organizations.map((org) => org.id);
    const missingIds = organizationIds.filter((id) => !foundIds.includes(id));
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Organizations not found: ${missingIds.join(", ")}`
    );
  }

  try {
    await db.$transaction(
      async (tx) => {
        // Check for branches in all organizations first
        const branches = await tx.branch.findMany({
          where: {
            companyId: { in: organizationIds },
          },
          select: {
            companyId: true,
          },
        });

        // Group branches by organization
        const orgsWithBranches = new Set(
          branches.map((branch) => branch.companyId)
        );

        // Check each organization for branches
        const blockedOrgs = organizationIds.filter((id) =>
          orgsWithBranches.has(id)
        );

        if (blockedOrgs.length > 0) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            "This organizations is associated with branches and cannot be deleted."
          );
        }

        // 1. Delete Asset Assignments
        await tx.assetAssignment.deleteMany({
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
        });

        // 2. Delete Asset History
        await tx.assetHistory.deleteMany({
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
        });

        // 3. Delete Assets
        await tx.asset.deleteMany({
          where: {
            OR: [
              { branch: { companyId: { in: organizationIds } } },
              {
                department: { branch: { companyId: { in: organizationIds } } },
              },
            ],
          },
        });

        // 4. Delete Users
        await tx.user.deleteMany({
          where: {
            OR: [
              { branch: { companyId: { in: organizationIds } } },
              {
                department: { branch: { companyId: { in: organizationIds } } },
              },
            ],
          },
        });

        // 5. Delete Departments
        await tx.department.deleteMany({
          where: {
            branch: { companyId: { in: organizationIds } },
          },
        });

        // 6. Delete Branches
        await tx.branch.deleteMany({
          where: {
            companyId: { in: organizationIds },
          },
        });

        // 7. Delete Organizations
        await tx.organization.deleteMany({
          where: {
            id: { in: organizationIds },
          },
        });
      },
      {
        maxWait: 5000,
        timeout: 20000,
      }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error("Error deleting organizations:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }

  return organizations;
};

export default {
  createOrganization,
  queryOrganizations,
  getOrganizationById,
  updateOrganizationById,
  deleteOrganizationById,
  deleteOrganizationsByIds,
};
