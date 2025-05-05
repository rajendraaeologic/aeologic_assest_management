const assignAssetStrings = {
  assignAsset: {
    title: " Assign Asset List",
    breadcrumb: {
      dashboard: "Dashboard",
      assignAsset: " Assign Asset",
    },
    buttons: {
      save: "Save",
      addAssignAsset: "Add Assign Asset",
      previous: "Previous",
      next: "Next",
      yes: "Yes",
      no: "No",
      ok: "OK",
    },
    table: {
      headers: {
        userName: "User Name",
        branchName: "Branch Name",
        assetName: "Asset Name",
        departmentName: "Department Name",
        action: "Action",
        deleteAll: "Delete All",
      },
      searchPlaceholders: {
        userName: "User Name",
        assetName: "Asset Name",
        branchName: "Branch Name",
        departmentName: "Department Name",
      },
      showEntries: "Show",
      entries: "Entries",
      noData: "No  assignAssets found",
      selectAll: "Select All",
    },
    modals: {
      deleteConfirmation: {
        single: "Are you sure you want to delete this  assignAsset?",
        multiple:
          "Are you sure you want to delete {count} selected  assignAssets?",
      },
      selectFirst: "Please select  assignAsset first before deleting",
      deleteSuccess: {
        single: " assignAsset deleted successfully!",
        multiple: "{count} assignAsset deleted successfully!",
      },
    },
    chipsList: {
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
      organization: "Organization",
      branch: "Branch",
      department: "Department",
      asset: "Asset",
    },
    select: {
      organizationDefault: "Please select an organization",
      branchDefault: "Please select a branch",
      departmentDefault: "Please select a department",
      assetDefault: "Please select an asset",
      loadingBranches: "Loading branches...",
      loadingDepartments: "Loading departments...",
    },
    validation: {
      branchRequired: "Branch is required",
      departmentRequired: "Department is required",
      assetRequired: "Asset is required",
    },
    toast: {
      success: "Asset assigned successfully!",
      error: "An error occurred, please try again!",
      assetAssigned: "This asset is already assigned",
      branchError: "Error loading branches",
      departmentError: "Error loading departments",
    },
  },
};

export default assignAssetStrings;
