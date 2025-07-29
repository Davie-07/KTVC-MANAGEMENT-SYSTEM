import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';

interface DataExportProps {
  userRole: string;
  dataType: 'students' | 'teachers' | 'courses' | 'classes' | 'exam-results' | 'fee-status' | 'personal';
}

const DataExport: React.FC<DataExportProps> = ({ userRole, dataType }) => {
  const { token, user } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');

  const exportData = async () => {
    setExporting(true);
    try {
      let endpoint = '';

      // Determine endpoint based on user role and data type
      switch (dataType) {
        case 'students':
          if (user?.role === 'teacher') {
            endpoint = `${API_ENDPOINTS.CLASSES}/teacher/${user?.id}/students`;
          } else {
            endpoint = API_ENDPOINTS.STUDENTS;
          }
          break;
        case 'teachers':
          endpoint = API_ENDPOINTS.TEACHERS;
          break;
        case 'courses':
          if (user?.role === 'teacher') {
            endpoint = API_ENDPOINTS.PUBLISHED_COURSES;
          } else {
            endpoint = API_ENDPOINTS.COURSES;
          }
          break;
        case 'classes':
          if (user?.role === 'teacher') {
            endpoint = `${API_ENDPOINTS.CLASSES}/teacher/${user?.id}`;
          } else {
            endpoint = API_ENDPOINTS.CLASSES;
          }
          break;
        case 'exam-results':
          if (user?.role === 'student') {
            endpoint = `${API_ENDPOINTS.EXAM_RESULTS}/student/${user?.id}`;
          } else {
            endpoint = API_ENDPOINTS.EXAM_RESULTS;
          }
          break;
        case 'fee-status':
          if (user?.role === 'student') {
            endpoint = `${API_ENDPOINTS.FEE_STATUS}/student/${user?.id}`;
          } else {
            endpoint = API_ENDPOINTS.FEE_STATUS;
          }
          break;
        case 'personal':
          endpoint = `${API_ENDPOINTS.AUTH}/profile/${user?.id}`;
          break;
      }

      if (!endpoint) {
        throw new Error('Export not available for this data type and role');
      }

      const response = await fetch(`${endpoint}?format=${exportFormat}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataType}-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const getExportOptions = () => {
    const options = [];

    if (userRole === 'admin') {
      options.push(
        { value: 'students', label: 'All Students' },
        { value: 'teachers', label: 'All Teachers' },
        { value: 'courses', label: 'All Courses' },
        { value: 'classes', label: 'All Classes' },
        { value: 'exam-results', label: 'All Exam Results' },
        { value: 'fee-status', label: 'All Fee Status' }
      );
    } else if (userRole === 'teacher') {
      options.push(
        { value: 'students', label: 'My Students' },
        { value: 'courses', label: 'All Courses' },
        { value: 'classes', label: 'My Classes' },
        { value: 'exam-results', label: 'Exam Results' },
        { value: 'fee-status', label: 'Fee Status' }
      );
    } else if (userRole === 'student') {
      options.push(
        { value: 'personal', label: 'My Profile & Data' },
        { value: 'exam-results', label: 'My Exam Results' },
        { value: 'fee-status', label: 'My Fee Status' }
      );
    }

    return options;
  };

  return (
    <div style={{
      background: '#23232b',
      color: '#fff',
      borderRadius: 12,
      padding: '1.5rem',
      marginBottom: '1rem',
      border: '1px solid #374151'
    }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>
        📊 Data Export
      </h3>
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={dataType}
          onChange={(e) => e.target.value && setExportFormat(e.target.value as 'csv' | 'pdf')}
          style={{
            background: '#374151',
            color: '#fff',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            padding: '0.5rem',
            fontSize: '0.875rem'
          }}
        >
          {getExportOptions().map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf')}
          style={{
            background: '#374151',
            color: '#fff',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            padding: '0.5rem',
            fontSize: '0.875rem'
          }}
        >
          <option value="csv">CSV Format</option>
          <option value="pdf">PDF Format</option>
        </select>

        <button
          onClick={exportData}
          disabled={exporting}
          style={{
            background: exporting ? '#6b7280' : '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            cursor: exporting ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {exporting ? '⏳' : '📥'} {exporting ? 'Exporting...' : 'Export'}
        </button>
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#9ca3af' }}>
        {exportFormat === 'csv' ? 
          'CSV format is best for data analysis and spreadsheet applications.' :
          'PDF format includes charts, formatting, and is ready for printing.'
        }
      </div>
    </div>
  );
};

export default DataExport; 