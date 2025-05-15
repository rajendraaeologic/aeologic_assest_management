const branchStrings = {
  branch: {
    title: "Branch List",
    breadcrumb: {
      dashboard: "Dashboard",
      branch: "Branch",
    },
    buttons: {
      save: "Save",
      addBranch: "Add Branch",
      previous: "Previous",
      next: "Next",
      yes: "Yes",
      no: "No",
      ok: "OK",
      deleting: "Deleting...",
    },
    table: {
      headers: {
        branchName: "Branch Name",
        branchLocation: "Branch Location",
        organizationName: "Organization Name",
        departmentName: "Department Name",
        userName: "User Name",
        assetName: "Asset Name",
        assetStatus: "Asset Status",
        action: "Action",
        deleteAll: "Delete All",
      },
      searchPlaceholders: {
        branchName: "Branch Name",
        branchLocation: "Branch Location",
        organizationName: "Organization Name",
        departmentName: "Department Name",
        userName: "User Name",
        assetName: "Asset Name",
        status: "Asset Status",
      },
      showEntries: "Show",
      entries: "Entries",
      noData: "No branches found",
      selectAll: "Select All",
    },
    modals: {
      deleteConfirmation: {
        single: "Are you sure you want to delete this branch?",
        multiple: "Are you sure you want to delete {count} selected branches?",
      },
      selectFirst: "Please select branches first before deleting",
      deleteSuccess: {
        single: "Branch deleted successfully!",
        multiple: "{count} branches deleted successfully!",
      },
    },
    notAvailable: {
      emptyText: "N/A",
    },
  },
  addBranch: {
    title: "Add Branch",
    formLabels: {
      branchName: "Branch Name",
      branchLocation: "Location",
      companyId: "Organization",
    },
    placeholders: {
      branchName: "Branch name",
      branchLocation: "Branch location",
    },
    validation: {
      branchNameRequired: "Branch name is required",
      branchNameMinLength: "Branch name must be at least 3 characters long",
      branchNameMaxLength: "Branch name must be at most 25 characters long",

      branchLocationRequired: "Branch location is required",
      branchLocationMinLength:
        "Branch Location  must be at least 3 characters long",
      branchLocationMaxLength:
        "Branch Location  must be at most 25 characters long",
      organizationRequired: "Organization selection is required",
      branchNamePattern:
        "Branch name must contain only alphanumeric characters",
    },
    select: {
      loading: "Loading organizations...",
      defaultOption: "Select Organization",
    },
    buttons: {
      save: "Save",
      saving: "Saving...",
      close: "Close",
    },
    toast: {
      success: "Branch added successfully!",
      error: "Failed to add branch",
      branchNameExists: "Branch name already exists",
    },
  },
  updateBranch: {
    title: "Update Branch",
    formLabels: {
      branchName: "Branch Name",
      branchLocation: "Location",
    },
    validation: {
      branchNameRequired: "Branch name is required",
      branchNameMinLength: "Branch name must be at least 3 characters long",
      branchNameMaxLength: "Branch name must be at most 25 characters long",

      branchLocationRequired: "Branch location is required",
      branchLocationMinLength:
        "Branch Location  must be at least 3 characters long",
      branchLocationMaxLength:
        "Branch Location  must be at most 25 characters long",
      branchNamePattern:
        "Branch name must contain only alphanumeric characters",
    },
    toast: {
      success: "Branch updated successfully!",
      error: "Failed to update branch",
    },
    buttons: {
      close: "Close",
      update: "Update",
      updating: "Updating...",
    },
  },
};

export default branchStrings;
