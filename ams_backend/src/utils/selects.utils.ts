import { Prisma } from "@prisma/client";

export const LoginUserKeys: Prisma.UserSelect = {
  id: true,
  email: true,
  name: true,
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
  name: true,
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
      name: true,
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
  name: true,
  createdAt: true,
  updatedAt: true,
  branches: {
    select: {
      id: true,
      name: true,
      location: true,
      // companyId: true,
      departments: {
        select: {
          id: true,
          name: true,
        },
      },
      users: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assets: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
  },
};

//department
export const DepartmentKeys: Prisma.DepartmentSelect = {
  id: true,
  name: true,
  location: true,
  createdAt: true,
  updatedAt: true,
  branch: {
    select: {
      id: true,
      name: true,
    },
  },
  users: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  Asset: {
    select: {
      id: true,
      name: true,
      status: true,
    },
  },
};

// BranchKeys

export const BranchKeys: Prisma.BranchSelect = {
  id: true,
  name: true,
  location: true,
  createdAt: true,
  updatedAt: true,
  company: {
    select: {
      id: true,
      name: true,
    },
  },
  departments: {
    select: {
      id: true,
      name: true,
    },
  },
  users: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  assets: {
    select: {
      id: true,
      name: true,
      status: true,
    },
  },
};
