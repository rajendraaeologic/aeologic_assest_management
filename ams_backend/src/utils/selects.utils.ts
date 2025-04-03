import { Prisma } from "@prisma/client";

export const LoginUserKeys: Prisma.UserSelect = {
  id: true,
  email: true,
  userName: true,
  ISDCode: true,
  phone: true,
  image: true,
  status: true,
  userRole: true,
  isEmailVerified: true,
  createdAt: true,
  updatedAt: true,
};

// Users Selects

export const UserKeys: Prisma.UserSelect = {
  id: true,
  email: true,
  userName: true,
  phone: true,
  image: true,
  status: true,
  userRole: true,
  isEmailVerified: true,
  createdAt: true,
  updatedAt: true,
};

export const UserNotificationKeys: Prisma.UserNotificationSelect = {
  id: true,
  User: {
    select: {
      id: true,
      userName: true,
      phone: true,
      email: true,
      image: true,
      userRole: true,
      status: true,
    },
  },
  userId: true,
  message: true,
  data: true,
  hasRead: true,
  readAt: true,
  createdAt: true,
};

export const OrganizationKeys: Prisma.OrganizationSelect = {
  id: true,
  organizationName: true,
  createdAt: true,
  updatedAt: true,
  branches: {
    select: {
      id: true,
      branchName: true,
      branchLocation: true,
      // companyId: true,
      departments: {
        select: {
          id: true,
          departmentName: true,
        },
      },
      users: {
        select: {
          id: true,
          userName: true,
          email: true,
        },
      },
      assets: {
        select: {
          id: true,
          assetName: true,
          status: true,
        },
      },
    },
  },
};

//department
export const DepartmentKeys: Prisma.DepartmentSelect = {
  id: true,
  departmentName: true,
  createdAt: true,
  updatedAt: true,
  branch: {
    select: {
      id: true,
      branchName: true,
    },
  },
  users: {
    select: {
      id: true,
      userName: true,
      email: true,
    },
  },
  Asset: {
    select: {
      id: true,
      assetName: true,
      status: true,
    },
  },
};

// BranchKeys

export const BranchKeys: Prisma.BranchSelect = {
  id: true,
  branchName: true,
  branchLocation: true,
  createdAt: true,
  updatedAt: true,
  company: {
    select: {
      id: true,
    },
  },
  departments: {
    select: {
      id: true,
      departmentName: true,
    },
  },
  users: {
    select: {
      id: true,
      userName: true,
      email: true,
    },
  },
  assets: {
    select: {
      id: true,
      assetName: true,
      status: true,
    },
  },
};
