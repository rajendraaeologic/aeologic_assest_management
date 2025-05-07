import { UserRole } from "@prisma/client";

// const allRoles = {
//   [UserRole.ADMIN]: ["getUser", "createOrganization", "getAllOrganizations"],
//   [UserRole.MANAGER]: ["getUsers"],
//   [UserRole.SUPERADMIN]: ["getUsers", "manageUsers"],
//   [UserRole.USER]: ["getAssignAssetUser"],
// };

// export const roles = Object.keys(allRoles);
// export const roleRights = new Map(Object.entries(allRoles));

const manageUserDashboardPermissions = ["getAssignAssetUser"];
const manageUsersPermissions = ["manageUsers"];
const manageOrganizationsPermissions = ["manageOrganizations"];
const manageBranchesPermissions = ["manageBranches"];
const manageDepartmentsPermissions = ["manageDepartments"];
const manageAssetsPermissions = ["manageAssets"];
const manageDashboardPermissions = ["manageDashboard"];
const manageAssignAssetPermissions = ["manageAssignAsset"];

const adminPermissions = [
  ...manageUsersPermissions,
  ...manageOrganizationsPermissions,
  ...manageBranchesPermissions,
  ...manageDepartmentsPermissions,
  ...manageAssetsPermissions,
  ...manageDashboardPermissions,
  ...manageAssignAssetPermissions,
];
const managerPermissions = [
  ...manageUsersPermissions,
  ...manageOrganizationsPermissions,
  ...manageBranchesPermissions,
  ...manageDepartmentsPermissions,
  ...manageAssetsPermissions,
  ...manageDashboardPermissions,
  ...manageAssignAssetPermissions,
];
const superAdminPermissions = [
  ...manageUsersPermissions,
  ...manageOrganizationsPermissions,
  ...manageBranchesPermissions,
  ...manageDepartmentsPermissions,
  ...manageAssetsPermissions,
  ...manageDashboardPermissions,
  ...manageAssignAssetPermissions,
];

const allRoles = {
  [UserRole.USER]: manageUserDashboardPermissions,
  [UserRole.ADMIN]: adminPermissions,
  [UserRole.MANAGER]: managerPermissions,
  [UserRole.SUPERADMIN]: superAdminPermissions,
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
