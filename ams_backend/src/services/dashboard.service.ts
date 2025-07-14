import db from "@/lib/db";
import { subDays, subWeeks, subMonths } from 'date-fns';
import { UserRole } from "@prisma/client";
import { Prisma } from '@prisma/client';

interface DashboardUser {
  id: string;
  userRole: UserRole;
  companyId?: string | null;
}

const getDashboardCounts = async (period: string = '7days', user?: DashboardUser) => {
  let dateFilter: Prisma.DateTimeFilter = {};
  const now = new Date();

  switch (period) {
    case '7days':
      dateFilter = { gte: subDays(now, 7) };
      break;
    case '4weeks':
      dateFilter = { gte: subWeeks(now, 4) };
      break;
    case '6months':
      dateFilter = { gte: subMonths(now, 6) };
      break;
    case '12months':
      dateFilter = { gte: subMonths(now, 12) };
      break;
    default:
      dateFilter = { gte: subDays(now, 7) };
  }

  const baseWhere = {
    deleted: false,
    createdAt: dateFilter
  };

  const userWhere: Prisma.UserWhereInput = {
    ...baseWhere,
    ...(user?.userRole !== UserRole.SUPERADMIN && { NOT: { userRole: UserRole.SUPERADMIN } }),
    ...(user?.userRole !== UserRole.SUPERADMIN && user?.companyId ? { companyId: user.companyId } : {})
  };

  const organizationWhere: Prisma.OrganizationWhereInput = baseWhere;

  const branchWhere: Prisma.BranchWhereInput = {
    ...baseWhere,
    ...(user?.userRole !== UserRole.SUPERADMIN && user?.companyId ? { companyId: user.companyId } : {})
  };

  const departmentWhere: Prisma.DepartmentWhereInput = {
    ...baseWhere,
    ...(user?.userRole !== UserRole.SUPERADMIN && user?.companyId ? {
      branch: { companyId: user.companyId }
    } : {})
  };

  let assetWhere: Prisma.AssetWhereInput = { ...baseWhere };

  if (user?.userRole !== UserRole.SUPERADMIN && user?.companyId) {
    const companyBranches = await db.branch.findMany({
      where: { companyId: user.companyId },
      select: { id: true }
    });
    const branchIds = companyBranches.map(branch => branch.id);

    const companyDepartments = await db.department.findMany({
      where: { branchId: { in: branchIds } },
      select: { id: true }
    });
    const departmentIds = companyDepartments.map(dept => dept.id);

    assetWhere = {
      AND: [
        baseWhere,
        {
          OR: [
            { companyId: user.companyId },
            { branchId: { in: branchIds } },
            { departmentId: { in: departmentIds } }
          ]
        }
      ]
    };
  }

  const queries = [
    db.user.count({ where: userWhere }),
    user?.userRole === UserRole.SUPERADMIN
        ? db.organization.count({ where: organizationWhere })
        : Promise.resolve(0),
    db.branch.count({ where: branchWhere }),
    db.department.count({ where: departmentWhere }),
    db.asset.count({ where: assetWhere })
  ];

  const [
    userCount,
    organizationsCount,
    branchesCount,
    departmentsCount,
    assetsCount,
  ] = await Promise.all(queries);

  return {
    users: userCount,
    organizations: organizationsCount,
    branches: branchesCount,
    departments: departmentsCount,
    assets: assetsCount,
  };
};

export default {
  getDashboardCounts,
};