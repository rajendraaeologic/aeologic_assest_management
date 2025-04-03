import Excel from 'exceljs';

export interface ExportOptions {
    headingStyle?: Partial<Excel.Style>;
    cellStyle?: Partial<Excel.Style>;
    autoFit?: boolean;
}

const defaultOptions: ExportOptions = {
    headingStyle: {
        font: { bold: true, color: { argb: 'FFFFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } },
        alignment: { vertical: 'middle', horizontal: 'center' },
        border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        },
    },
    cellStyle: {
        font: { color: { argb: 'FF000000' } },
        alignment: { vertical: 'middle', horizontal: 'left' },
    },
    autoFit: true,
};


export abstract class ExcelExport<T> {
    protected workbook: Excel.Workbook;
    protected worksheet: Excel.Worksheet;
    protected data: T[];
    protected options: ExportOptions;

    protected constructor(data: T[], options: ExportOptions = {}) {
        this.workbook = new Excel.Workbook();
        this.worksheet = this.workbook.addWorksheet('Sheet1');
        this.data = data;
        this.options = { ...defaultOptions, ...options };
    }

    public async export(): Promise<Buffer> {
        this.addHeadingRow();
        this.addDataRows();
        if (this.options.autoFit) {
            this.autoFitColumns();
        }

        return await this.workbook.xlsx.writeBuffer() as Buffer;
    }

    protected addHeadingRow(): void {
        const headings = this.getHeadings();
        const row = this.worksheet.addRow(headings);

        row.eachCell((cell) => {
            cell.style = { ...cell.style, ...this.options.headingStyle };
        });
    }

    protected addDataRows(): void {
        this.data.forEach((item) => {
            const mappedData = this.map(item);
            const row = this.worksheet.addRow(Object.values(mappedData));

            row.eachCell((cell) => {
                cell.style = { ...cell.style, ...this.options.cellStyle };
            });
        });
    }

    protected autoFitColumns(): void {
        this.worksheet.columns.forEach((column) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const columnLength = cell.value ? cell.value.toString().length : 15;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = maxLength < 15 ? 15 : maxLength + 2;
        });
    }

    protected abstract map(item: T): Record<string, unknown>;
    protected abstract getHeadings(): string[];
}
