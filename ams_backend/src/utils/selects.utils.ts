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
  company: {
    select: {
      id: true,
      organizationName: true,
    },
  },
  branch: {
    select: {
      id: true,
      branchName: true,
    },
  },
  department: {
    select: {
      id: true,
      departmentName: true,
    },
  },
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
      branchLocation: true,
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
      organizationName: true,
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

//AssetKeys
export const AssetKeys: Prisma.AssetSelect = {
  id: true,
  assetName: true,
  description: true,
  uniqueId: true,
  brand: true,
  model: true,
  serialNumber: true,
  purchaseDate: true,
  cost: true,
  warrantyEndDate: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  // assignedUser: {
  //   select: {
  //     id: true,
  //     userName: true,
  //     email: true,
  //   },
  // },
  // assetLocation: {
  //   select: {
  //     id: true,
  //     locationName: true,
  //     address: true,
  //   },
  // },
  company: {
    select: {
      id: true,
      organizationName: true,
    },
  },
  branch: {
    select: {
      id: true,
      branchName: true,
      branchLocation: true,
    },
  },
  department: {
    select: {
      id: true,
      departmentName: true,
    },
  },
  // assetHistory: {
  //   select: {
  //     id: true,
  //     action: true,
  //     timestamp: true,
  //     user: {
  //       select: {
  //         id: true,
  //         userName: true,
  //       },
  //     },
  //   },
  // },
  // AssetAssignment: {
  //   select: {
  //     id: true,
  //     assignedAt: true,
  //     user: {
  //       select: {
  //         id: true,
  //         userName: true,
  //         email: true,
  //       },
  //     },
  //   },
  // },
};

export const AssetAssignmentKeys: Prisma.AssetAssignmentSelect = {
  id: true,
  assignedAt: true,
  asset: {
    select: {
      id: true,
      assetName: true,
      uniqueId: true,
      company: true,
      branch: true,
      department: true,
    },
  },
  user: {
    select: {
      id: true,
      userName: true,
      email: true,
      company: true,
      branch: true,
      department: true,
    },
  },
};

// export const AssetHistoryKeys: Prisma.AssetHistorySelect = {
//   id: true,
//   action: true,
//   timestamp: true,
//   asset: {
//     select: {
//       id: true,
//       assetName: true,
//       uniqueId: true,
//     },
//   },
//   user: {
//     select: {
//       id: true,
//       userName: true,
//     },
//   },
// };
export const AssetHistoryKeys = {
  id: true,
  assetId: true,
  action: true,
  userId: true,
  timestamp: true,
  asset: {
    select: {
      id: true,
      assetName: true,
      uniqueId: true,
      brand: true,
      model: true,
      serialNumber: true,
      status: true,
      company: {
        select: {
          id: true,
          organizationName: true
        }
      },
      branch: {
        select: {
          id: true,
          branchName: true,
          branchLocation: true
        }
      },
      department: {
        select: {
          id: true,
          departmentName: true
        }
      }
    }
  },
  user: {
    select: {
      id: true,
      userName: true,
      email: true,
      department: {
        select: {
          id: true,
          departmentName: true
        }
      }
    }
  }
};