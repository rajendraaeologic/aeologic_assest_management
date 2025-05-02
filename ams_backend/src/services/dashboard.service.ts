import db from "@/lib/db";

const getDashboardCounts = async () => {
  const [
    userCount,
    organizationsCount,
    branchsCount,
    departmentsCount,
    assetsCounts,
  ] = await Promise.all([
    db.user.count(),
    db.organization.count(),
    db.branch.count(),
    db.department.count(),
    db.asset.count(),
  ]);

  return {
    users: userCount,
    organizations: organizationsCount,
    branches: branchsCount,
    departments: departmentsCount,
    assets: assetsCounts,
  };
};

export default {
  getDashboardCounts,
};
