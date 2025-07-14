import React, { useState, useEffect } from 'react';

const ReportDialog = ({
      show,
      onClose,
      onGenerate,
      defaultFileName = "export",
      isLoading = false,
  }) => {
    const [reportType, setReportType] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    const currentDate = new Date().toISOString().split('T')[0];

    useEffect(() => {
        setSelectedDate(null);
        setFromDate(null);
        setToDate(null);
    }, [reportType]);

    const handleGenerate = async () => {
        const success = await onGenerate({
            reportType,
            selectedDate,
            fromDate,
            toDate,
        });

        if (success) {
            handleClose();
        }
    };

    const handleClose = () => {
        setReportType(null);
        setSelectedDate(null);
        setFromDate(null);
        setToDate(null);
        onClose();
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Generate Report</h3>

                <div className="mb-4">
                    <label htmlFor="reportType" className="block mb-2">Report Type:</label>
                    <select
                        id="reportType"
                        value={reportType || ''}
                        onChange={(e) => setReportType(e.target.value)}
                        className="w-full border p-2 rounded"
                    >
                        <option value="">Select Report Type</option>
                        <option value="date">Date Wise Report</option>
                        <option value="range">Range Wise Report</option>
                    </select>
                </div>

                {reportType === 'date' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <label>Select Date:</label>
                            <input
                                type="date"
                                value={selectedDate || ''}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="border p-2 rounded"
                                max={currentDate}
                            />
                        </div>
                    </div>
                )}

                {reportType === 'range' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <label>From Date:</label>
                            <input
                                type="date"
                                value={fromDate || ''}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="border p-2 rounded"
                                max={currentDate}
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <label>To Date:</label>
                            <input
                                type="date"
                                value={toDate || ''}
                                onChange={(e) => setToDate(e.target.value)}
                                className="border p-2 rounded"
                                max={currentDate}
                            />
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-gray-300 rounded"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-[#3BC0C3] text-white rounded-lg"
                        onClick={handleGenerate}
                        disabled={isLoading || !reportType ||
                            (reportType === 'date' && !selectedDate) ||
                            (reportType === 'range' && (!fromDate || !toDate))}
                    >
                        {isLoading ? 'Exporting...' : 'Export to Excel'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportDialog;