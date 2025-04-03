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
): Promise<any[]> => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const skip = (page - 1) * limit || 0;
  const sortBy = options.sortBy;
  const sortType = options.sortType ?? "desc";

  return await db.organization.findMany({
    where: { ...filter },
    select: OrganizationKeys,
    skip: skip > 0 ? skip : 0,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType } : undefined,
  });
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

  await db.$transaction(async (tx) => {
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
  });

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

  await db.$transaction(async (tx) => {
    await tx.asset.deleteMany({
      where: {
        OR: [
          { branch: { companyId: { in: organizationIds } } },
          { department: { branch: { companyId: { in: organizationIds } } } },
        ],
      },
    });

    await tx.user.deleteMany({
      where: {
        OR: [
          { branch: { companyId: { in: organizationIds } } },
          { department: { branch: { companyId: { in: organizationIds } } } },
        ],
      },
    });

    await tx.assetAssignment.deleteMany({
      where: {
        OR: [
          { user: { branch: { companyId: { in: organizationIds } } } },
          {
            user: {
              department: { branch: { companyId: { in: organizationIds } } },
            },
          },
        ],
      },
    });

    await tx.assetHistory.deleteMany({
      where: {
        asset: {
          OR: [
            { branch: { companyId: { in: organizationIds } } },
            { department: { branch: { companyId: { in: organizationIds } } } },
          ],
        },
      },
    });

    await tx.department.deleteMany({
      where: {
        branch: { companyId: { in: organizationIds } },
      },
    });

    await tx.branch.deleteMany({
      where: { companyId: { in: organizationIds } },
    });

    await tx.organization.deleteMany({
      where: { id: { in: organizationIds } },
    });
  });

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
