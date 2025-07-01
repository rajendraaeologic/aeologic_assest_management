// dashboard.service.ts
import db from "@/lib/db";
import { subDays, subWeeks, subMonths } from 'date-fns';

const getDashboardCounts = async (period: string = '7days') => {
  let dateFilter = {};
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

  const [
    userCount,
    organizationsCount,
    branchesCount,
    departmentsCount,
    assetsCount,
  ] = await Promise.all([
    db.user.count({
      where: {
        deleted: false,
        createdAt: dateFilter
      },
    }),
    db.organization.count({
      where: {
        deleted: false,
        createdAt: dateFilter
      },
    }),
    db.branch.count({
      where: {
        deleted: false,
        createdAt: dateFilter
      },
    }),
    db.department.count({
      where: {
        deleted: false,
        createdAt: dateFilter
      },
    }),
    db.asset.count({
      where: {
        deleted: false,
        createdAt: dateFilter
      },
    }),
  ]);

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