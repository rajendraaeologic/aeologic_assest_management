const organizationStrings = {
  organization: {
    title: "Organization List",
    breadcrumb: {
      dashboard: "Dashboard",
      organization: "Organization",
    },
    buttons: {
      save: "Save",
      addOrganization: "Add Organization",
      previous: "Previous",
      next: "Next",
      yes: "Yes",
      no: "No",
      ok: "OK",
      deleting: "Deleting...",
    },
    table: {
      headers: {
        orgName: "Organization Name",
        branchName: "Branch Name",
        state: "State",
        city: "City",
        departmentName: "Department Name",
        action: "Action",
        deleteAll: "Delete All",
      },
      searchPlaceholders: {
        orgName: "Organization Name",
        branchName: "Branch Name",
        state: "State",
        city: "City",
        departmentName: "Department Name",
      },
      showEntries: "Show",
      entries: "Entries",
      noData: "No organizations found",
      selectAll: "Select All",
    },
    modals: {
      deleteConfirmation: {
        single: "Are you sure you want to delete this organization?",
        multiple:
          "Are you sure you want to delete {count} selected organizations?",
      },
      selectFirst: "Please select organizations first before deleting",
      deleteSuccess: {
        single: "Organization deleted successfully!",
        multiple: "{count} organizations deleted successfully!",
      },
    },
    notAvailable: {
      emptyText: "N/A",
    },
  },
  addOrganization: {
    title: "Add Organization",
    formLabels: {
      organizationName: "Organization Name",
    },
    placeholders: {
      organizationName: "Enter organization name",
    },
    validation: {
      organizationNameRequired: "Organization name is required",
      organizationNameMinLength:
        "Organization name must be min 3 or max 25 alphanumeric  ",
      organizationNameMaxLength:
        "Organization name must be at most 25 alphanumeric ",
      orgNamePattern:
        "Organization Name must contain only alphanumeric",
      trimSpaces: "Organization name must not start or end with spaces.",
    },
    buttons: {
      save: "Save",
      saving: "Saving...",
      close: "Close",
    },
    toast: {
      success: "Organization added successfully!",
      error: "Failed to add organization",
    },
  },
  updateOrganization: {
    title: "Update Organization",
    formLabels: {
      organizationName: "Organization Name",
    },
    placeholders: {
      organizationName: "Enter organization name",
    },
    validation: {
      organizationNameRequired: "Organization name is required",
      organizationNameMinLength:
        "Organization name must be min 3 or max 25 alphanumeric  ",
      organizationNameMaxLength:
        "Organization name must be at most 25 alphanumeric ",
      orgNamePattern:
        "Organization Name must contain only  alphanumeric",
      trimSpaces: "Organization name must not start or end with spaces.",

    },
    buttons: {
      update: "Update",
      updating: "Updating...",
      close: "Close",
    },
    toast: {
      success: "Organization updated successfully!",
      error: "Failed to update organization",
    },
  },
};

export default organizationStrings;
