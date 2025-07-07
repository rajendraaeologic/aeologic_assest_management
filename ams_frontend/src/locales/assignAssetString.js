const assignAssetStrings = {
  assignAsset: {
    title: "Assign Asset",
    breadcrumb: {
      dashboard: "Dashboard",
      assignAsset: "Assign Asset",
    },
    buttons: {
      save: "Save",
      addAssignAsset: "Add Assign Asset",
      previous: "Previous",
      next: "Next",
      yes: "Yes",
      no: "No",
      ok: "OK",
      deleting: "Deleting...",
    },
    table: {
      headers: {
        userName: "User Name",
        organizationName: "Organization",
        branchName: "Branch",
        assetName: "Asset",
        departmentName: "Department",
        action: "Action",
        deleteAll: "Delete All",
      },
      searchPlaceholders: {
        userName: "User Name",
        assetName: "Asset Name",
        organizationName: "Organization Name",
        branchName: "Branch Name",
        departmentName: "Department Name",
      },
      showEntries: "Show",
      entries: "Entries",
      noData: "No assignAssets found",
      selectAll: "Select All",
    },
    modals: {
      deleteConfirmation: {
        single: "Are you sure you want to delete this assignAsset?",
        multiple:
          "Are you sure you want to delete {count} selected assignAssets?",
      },
      selectFirst: "Please select assignAsset first before deleting",
      deleteSuccess: {
        single: "AssignAsset deleted successfully!",
        multiple: "{count} assignAssets deleted successfully!",
      },
    },
    notAvailable: {
      emptyText: "N/A",
    },
  },

  addAssignAsset: {
    title: "Assign Asset",
    breadcrumb: {
      dashboard: "Dashboard",
      assignAsset: "Assign Asset",
    },
    buttons: {
      save: "Save",
      AddAssignAsset: "Add Assign Asset",
      previous: "Previous",
      next: "Next",
      yes: "Yes",
      no: "No",
      ok: "OK",
      saving: "Saving...",
      close: "Close",
    },
    formLabels: {
      userName: "User Name",
      organization: "Organization",
      branch: "Branch",
      department: "Department",
      asset: "Asset",
    },
    select: {
      userDefault: "Please select a User Name",
      organizationDefault: "Please select an Organization",
      branchDefault: "Please select a branch",
      departmentDefault: "Please select a Department",
      assetDefault: "Please select an Asset",
      loadingOrganizations: "Loading Organizations...",
      loadingBranches: "Loading Branches...",
      loadingDepartments: "Loading Departments...",
      loadingAssets: "Loading Assets...",
      loadingUsers: "Loading Users...",
    },
    validation: {
      organizationRequired: "Organization selection is required",
      userNameRequired: "User Name is required",
      branchRequired: "Branch is required",
      departmentRequired: "Department is required",
      assetRequired: "Asset is required",
    },
    toast: {
      success: "Asset assigned successfully!",
      error: "An error occurred, please try again!",
      assetAssigned: "This asset is already assigned",
      organizationRequired: "Please select a valid organization",
      assetNotAvailable: "Asset is not available for assignment",
      branchError: "Error loading branches",
      departmentError: "Error loading departments",
    },
  },

  updateAssignAsset: {
    title: "Edit Assign Asset",
    breadcrumb: {
      dashboard: "Dashboard",
      assignAsset: "Assign Asset",
    },
    buttons: {
      update: "Update",
      updating: "Updating...",
      close: "Close",
    },
    formLabels: {
      userName: "User Name",
      organization: "Organization",
      branch: "Branch",
      department: "Department",
      asset: "Asset",
    },
    select: {
      userDefault: "Please select a User Name",
      organizationDefault: "Please select an Organization",
      branchDefault: "Please select a Branch",
      departmentDefault: "Please select a Department",
      assetDefault: "Please select an Asset",
      loadingBranches: "Loading Branches...",
      loadingDepartments: "Loading Departments...",
    },
    validation: {
      userNameRequired: "User Name is required",
      organizationRequired: "Organization is required",
      branchRequired: "Branch is required",
      departmentRequired: "Department is required",
      assetRequired: "Asset is required",
    },
    toast: {
      success: "Assigned Asset updated successfully!",
      error: "Failed to Update Assigned Asset",
      assetAssigned: "This Asset is already assigned to another User",
      branchError: "Error loading Branches",
      departmentError: "Error loading Departments",
    },
  },
};

export default assignAssetStrings;
