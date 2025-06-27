import API from "../App/api/axiosInstance";
import { toast } from "react-toastify";

export const generateExcelReport = async ({
      endpoint,
      filters = {},
      defaultFileName = "export",
      successMessage = "Report generated and downloaded successfully",
      errorMessage = "No data found matching criteria",
  }) => {
    try {
        const params = new URLSearchParams();

        // Add filters to params
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "") {
                params.append(key, value);
            }
        });

        const response = await API.get(endpoint, {
            params,
            responseType: "blob",
        });

        const contentType = response.headers['content-type'] ||
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        const blob = new Blob([response.data], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${defaultFileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        toast.success(successMessage);
        return true;
    } catch (error) {
        console.error("Download failed:", error);
        const message = error.response?.data?.message || errorMessage;
        toast.error(message);
        return false;
    }
};

export const handleReportGeneration = async ({
                                                 reportType,
                                                 dateFilters,
                                                 otherFilters = {},
                                                 endpoint,
                                                 defaultFileName,
                                                 successMessage,
                                                 errorMessage,
                                             }) => {
    // Validate date inputs based on report type
    if (reportType === 'date' && !dateFilters.selectedDate) {
        toast.error("Please select a date");
        return false;
    }

    if (reportType === 'range') {
        if (!dateFilters.fromDate || !dateFilters.toDate) {
            toast.error("Please select both dates");
            return false;
        }
        if (dateFilters.fromDate > dateFilters.toDate) {
            toast.error("From date cannot be after To date");
            return false;
        }
    }

    // Prepare filters object
    const filters = { ...otherFilters };

    if (reportType === 'date') {
        filters.selectedDate = dateFilters.selectedDate;
    } else if (reportType === 'range') {
        filters.from_date = dateFilters.fromDate;
        filters.to_date = dateFilters.toDate;
    }

    return await generateExcelReport({
        endpoint,
        filters,
        defaultFileName,
        successMessage,
        errorMessage,
    });
};