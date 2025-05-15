import db from "@/lib/db";

const getDashboardCounts = async () => {
  const [
    userCount,
    organizationsCount,
    branchesCount,
    departmentsCount,
    assetsCount,
  ] = await Promise.all([
    db.user.count({
      where: { deleted: false },
    }),
    db.organization.count({
      where: { deleted: false },
    }),
    db.branch.count({
      where: { deleted: false },
    }),
    db.department.count({
      where: { deleted: false },
    }),
    db.asset.count({
      where: { deleted: false },
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
