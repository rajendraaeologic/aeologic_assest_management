const departmentStrings = {
  department: {
    title: "Department List",
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
    },
    table: {
      headers: {
        departmentName: "Department Name",
        branchName: "Branch Name",
        branchLocation: "Branch Location",
        userName: "User Name",
        assetName: "Asset Name",
        assetStatus: "Asset Status",
        action: "Action",
        deleteAll: "Delete All",
      },
      searchPlaceholders: {
        departmentName: "Department Name",
        branchName: "Branch Name",
        branchLocation: "Branch Location",
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
      departmentName: "Department Name",
      selectOrganization: "Select Organization",
      selectBranch: "Select Branch",
    },
    placeholders: {
      departmentName: "Department name",
    },
    validation: {
      departmentNameRequired: "Department name is required",
      departmentNameMinLength:
        "Department Name must be at least 3 characters long",
      departmentNameMaxLength:
        "Department Name  must be at most 25 characters long",
      branchRequired: "Branch is required",
      organizationRequired: "Organization is required",
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
    title: "Update Department",
    formLabels: {
      departmentName: "Department Name",
    },
    validation: {
      departmentNameRequired: "Department name is required",
      departmentNameMinLength:
        "Department Name must be at least 3 characters long",
      departmentNameMaxLength:
        "Department Name  must be at most 25 characters long",
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
