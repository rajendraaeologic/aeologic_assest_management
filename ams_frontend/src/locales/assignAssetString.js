const assignAssetStrings = {
  assignAsset: {
    title: "Assign Asset List",
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
        organizationName: "Organization Name",
        branchName: "Branch Name",
        assetName: "Asset Name",
        departmentName: "Department Name",
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
      organizationDefault: "Please select an organization",
      branchDefault: "Please select a branch",
      departmentDefault: "Please select a department",
      assetDefault: "Please select an asset",
      loadingBranches: "Loading branches...",
      loadingDepartments: "Loading departments...",
    },
    validation: {
      organizationRequired: "Organization selection is required",
      userNameRequired: "User name is required",
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
    title: "Edit Assigned Asset",
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
      organizationDefault: "Please select an organization",
      branchDefault: "Please select a branch",
      departmentDefault: "Please select a department",
      assetDefault: "Please select an asset",
      loadingBranches: "Loading branches...",
      loadingDepartments: "Loading departments...",
    },
    validation: {
      userNameRequired: "User name is required",
      organizationRequired: "Organization is required",
      branchRequired: "Branch is required",
      departmentRequired: "Department is required",
      assetRequired: "Asset is required",
    },
    toast: {
      success: "Assigned asset updated successfully!",
      error: "Failed to update assigned asset",
      assetAssigned: "This asset is already assigned to another user",
      branchError: "Error loading branches",
      departmentError: "Error loading departments",
    },
  },
};

export default assignAssetStrings;
