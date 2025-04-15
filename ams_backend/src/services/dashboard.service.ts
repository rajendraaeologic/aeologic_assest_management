import db from "@/lib/db";

const getDashboardCounts = async () => {
  const [organizationsCount, branchsCount, departmentsCount] =
    await Promise.all([
      db.organization.count(),
      db.branch.count(),
      db.department.count(),
    ]);

  return {
    organizations: organizationsCount,
    branches: branchsCount,
    departments: departmentsCount,
  };
};

export default {
  getDashboardCounts,
};
