import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  course: string;
  level: string;
  courseDuration?: string;
}

const SetStudentCourseDuration: React.FC = () => {
  const { user, token } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [courseDuration, setCourseDuration] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        if (!user?.course) {
          setStudents([]);
          return;
        }

        const response = await fetch(`${API_ENDPOINTS.STUDENTS_BY_COURSE}/${encodeURIComponent(user.course)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error('Error fetching students:', error);
        setError('Failed to fetch students');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    if (token && user?.course) {
      fetchStudents();
    } else {
      setLoading(false);
    }
  }, [token, user?.course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !courseDuration) {
      setError('Please select a student and enter course duration');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`${API_ENDPOINTS.AUTH_STUDENT_COURSE_DURATION}/${selectedStudent}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courseDuration })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Course duration updated successfully for ${data.student.firstName} ${data.student.lastName}`);
        setSelectedStudent('');
        setCourseDuration('');
        
        // Refresh students list to show updated duration
        const updatedStudents = students.map(student => 
          student._id === selectedStudent 
            ? { ...student, courseDuration }
            : student
        );
        setStudents(updatedStudents);
      } else {
        setError(data.message || 'Failed to update course duration');
      }
    } catch (error) {
      console.error('Error updating course duration:', error);
      setError('Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedStudentData = students.find(s => s._id === selectedStudent);

  return (
    <div style={{
      background: '#23232b',
      color: '#fff',
      borderRadius: 12,
      padding: '1.5rem',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      marginBottom: '1.5rem'
    }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>
        📅 Set Student Course Duration
      </h3>
      
      {error && (
        <div style={{ 
          color: '#ef4444', 
          background: '#1f2937', 
          padding: '0.5rem', 
          borderRadius: 6, 
          marginBottom: '1rem' 
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          color: '#22c55e', 
          background: '#1f2937', 
          padding: '0.5rem', 
          borderRadius: 6, 
          marginBottom: '1rem' 
        }}>
          {success}
        </div>
      )}

      {loading ? (
        <div style={{ color: '#9ca3af' }}>Loading students...</div>
      ) : students.length === 0 ? (
        <div style={{ color: '#9ca3af' }}>No students found in your course.</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Select Student:
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: 6,
                border: '1px solid #444',
                background: '#18181b',
                color: '#fff'
              }}
              required
            >
              <option value="">Choose a student...</option>
              {students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.firstName} {student.lastName} - {student.level} 
                  {student.courseDuration ? ` (Current: ${student.courseDuration})` : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedStudentData && (
            <div style={{ 
              background: '#1f2937', 
              padding: '1rem', 
              borderRadius: 6, 
              marginBottom: '1rem' 
            }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#3b82f6' }}>
                Student Details:
              </h4>
              <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
                <div><strong>Name:</strong> {selectedStudentData.firstName} {selectedStudentData.lastName}</div>
                <div><strong>Email:</strong> {selectedStudentData.email}</div>
                <div><strong>Course Level:</strong> {selectedStudentData.level}</div>
                <div><strong>Current Duration:</strong> {selectedStudentData.courseDuration || 'Not set'}</div>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Course Duration:
            </label>
            <input
              type="text"
              value={courseDuration}
              onChange={(e) => setCourseDuration(e.target.value)}
              placeholder="e.g., 2 Years, 18 Months, 3 Semesters"
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: 6,
                border: '1px solid #444',
                background: '#18181b',
                color: '#fff'
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedStudent || !courseDuration}
            style={{
              background: submitting ? '#6b7280' : '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '0.7rem 1.5rem',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting || !selectedStudent || !courseDuration ? 0.6 : 1
            }}
          >
            {submitting ? 'Updating...' : 'Set Course Duration'}
          </button>
        </form>
      )}
    </div>
  );
};

export default SetStudentCourseDuration; 