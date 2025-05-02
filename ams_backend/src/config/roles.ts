import { UserRole } from "@prisma/client";

const allRoles = {
  [UserRole.ADMIN]: ["getUser"],
  [UserRole.MANAGER]: ["getUsers"],
  [UserRole.SUPERADMIN]: ["getUsers", "manageUsers"],
  [UserRole.USER]: ["getAssignAssetUser"],
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
