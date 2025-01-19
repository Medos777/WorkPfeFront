import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import httpClient from '../http-common';

class ReportService {
    static async generateProjectReport(projectId, format = 'pdf') {
        try {
            const response = await httpClient.get(`/projects/${projectId}/export/${format}`, {
                responseType: 'blob'
            });
            
            const fileName = `project-report-${projectId}.${format}`;
            saveAs(new Blob([response.data]), fileName);
            
            return true;
        } catch (error) {
            console.error('Error generating report:', error);
            throw error;
        }
    }

    static async exportToExcel(data, fileName = 'export.xlsx') {
        try {
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Data');
            
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            saveAs(new Blob([excelBuffer]), fileName);
            
            return true;
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            throw error;
        }
    }

    static async exportToCsv(data, fileName = 'export.csv') {
        try {
            const replacer = (key, value) => value === null ? '' : value;
            const header = Object.keys(data[0]);
            const csv = [
                header.join(','),
                ...data.map(row => header.map(fieldName => 
                    JSON.stringify(row[fieldName], replacer)).join(','))
            ].join('\r\n');

            saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), fileName);
            return true;
        } catch (error) {
            console.error('Error exporting to CSV:', error);
            throw error;
        }
    }

    static async scheduleReport(projectId, schedule) {
        try {
            const response = await httpClient.post(`/projects/${projectId}/schedule-report`, schedule);
            return response.data;
        } catch (error) {
            console.error('Error scheduling report:', error);
            throw error;
        }
    }

    static async getScheduledReports(projectId) {
        try {
            const response = await httpClient.get(`/projects/${projectId}/scheduled-reports`);
            return response.data;
        } catch (error) {
            console.error('Error getting scheduled reports:', error);
            throw error;
        }
    }

    static async deleteScheduledReport(projectId, reportId) {
        try {
            const response = await httpClient.delete(`/projects/${projectId}/scheduled-reports/${reportId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting scheduled report:', error);
            throw error;
        }
    }

    static async getCustomReport(projectId, filters) {
        try {
            const response = await axios.post(`/api/projects/${projectId}/custom-report`, filters);
            return response.data;
        } catch (error) {
            console.error('Error generating custom report:', error);
            throw error;
        }
    }
}

export default ReportService;
