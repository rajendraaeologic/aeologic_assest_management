const departmentStrings = {
  department: {
    title: "Department",
    breadcrumb: {
      dashboard: "Dashboard",
      department: "Department",
    },
    buttons: {
      save: "Save",
      addDepartment: "Add Department",
      previous: "Previous",
      next: "Next",
      yes: "Yes",
      no: "No",
      ok: "OK",
      deleting: "Deleting...",
    },
    table: {
      headers: {
        departmentName: "Department",
        branchName: "Branch",
        state: "State",
        city: "City",
        userName: "User Name",
        assetName: "Asset Name",
        assetStatus: "Asset Status",
        action: "Action",
        deleteAll: "Delete All",
      },
      searchPlaceholders: {
        departmentName: "Department Name",
        branchName: "Branch Name",
        state: "State",
        city: "City",
        userName: "User Name",
        assetName: "Asset Name",
        status: "Asset Status",
      },
      showEntries: "Show",
      entries: "Entries",
      noData: "No departments found",
      selectAll: "Select All",
    },
    modals: {
      deleteConfirmation: {
        single: "Are you sure you want to delete this department?",
        multiple:
          "Are you sure you want to delete {count} selected departments?",
      },
      selectFirst: "Please select departments first before deleting",
      deleteSuccess: {
        single: "Department deleted successfully!",
        multiple: "{count} departments deleted successfully!",
      },
    },
    notAvailable: {
      emptyText: "N/A",
    },
  },
  addDepartment: {
    title: "Add Department",
    formLabels: {
      departmentName: "Department",
      selectOrganization: "Organization",
      selectBranch: "Branch",
    },
    placeholders: {
      departmentName: "Department Name",
    },
    validation: {
      departmentNameRequired: "Department Name is required",
      departmentNameMinLength:
        "Department Name must be min 3 or max 25 alphanumeric  ",
      departmentNameMaxLength:
        "Department Name  must be max 25 alphanumeric ",
      branchRequired: "Branch is required",
      organizationRequired: "Organization is required",
      deptNamePattern:
        "Department Name must contain only alphanumeric ",
      trimSpaces: "Department Name must not start or end with spaces.",
    },
    buttons: {
      save: "Save",
      saving: "Saving...",
      close: "Close",
    },
    toast: {
      success: "Department added successfully!",
      error: "Failed to add department",
    },
  },
  updateDepartment: {
    title: "Edit Department",
    formLabels: {
      departmentName: "Department",
    },
    validation: {
      departmentNameRequired: "Department Name is required",
      departmentNameMinLength:
        "Department Name must be min 3 or max 25 alphanumeric  ",
      departmentNameMaxLength:
        "Department Name  must be max 25 alphanumeric ",
      deptNamePattern:
        "Department Name must contain only alphanumeric ",
      trimSpaces: "Department name must not start or end with spaces.",

    },
    buttons: {
      close: "Close",
      update: "Update",
      updating: "Updating...",
    },
    toast: {
      success: "Department updated successfully!",
      error: "Failed to update department",
    },
  },
};

export default departmentStrings;
