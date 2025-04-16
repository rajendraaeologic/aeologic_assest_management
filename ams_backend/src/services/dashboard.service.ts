import db from "@/lib/db";

const getDashboardCounts = async () => {
  const [userCount, organizationsCount, branchsCount, departmentsCount] =
    await Promise.all([
      db.user.count(),
      db.organization.count(),
      db.branch.count(),
      db.department.count(),
    ]);

  return {
    users: userCount,
    organizations: organizationsCount,
    branches: branchsCount,
    departments: departmentsCount,
  };
};

export default {
  getDashboardCounts,
};
