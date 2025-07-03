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
        state: "State",
        city: "City",
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
        state: "State",
        city: "City",
        branchCity: "Branch City",
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
      state: "State",
      city: "City",
      companyId: "Organization",
    },
    placeholders: {
      branchName: "Branch Name",
      state: "State",
      city: "City",
    },
    validation: {
      branchNameRequired: "Branch Name is required",
      branchNameMinLength: "Branch Name must be min 3 or max 25 alphanumeric ",
      branchNameMaxLength: "Branch name must be max 25 alphanumeric ",
      stateRequired: "State is required",
      cityRequired: "City is required",
      organizationRequired: "Organization selection is required",
      branchNamePattern:
        "Branch Name must contain only alphanumeric ",
      trimSpaces: "Branch Name must not start or end with spaces.",

    },
    select: {
      loading: "Loading Organizations...",
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
      branchNameExists: "Branch Name already exists",
    },
  },
  updateBranch: {
    title: "Update Branch",
    formLabels: {
      branchName: "Branch Name",
      state: "State",
      city: "City",
    },
    validation: {
      branchNameRequired: "Branch Name is required",
      branchNameMinLength: "Branch Name must be min 3 or max 25 alphanumeric  ",
      branchNameMaxLength: "Branch Name must be max 25 alphanumeric ",
      trimSpaces: "Branch Name must not start or end with spaces.",
      stateRequired: "State is required",
      cityRequired: "City is required",
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
