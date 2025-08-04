import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';
import './ManageStudents.css';

interface Student {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  course?: string;
  level?: string;
  admission?: string;
}

const ManageStudents: React.FC = () => {
  const { user, token } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  useEffect(() => {
    if (user?.course && token) {
      fetchStudents();
    } else {
      setLoading(false);
    }
  }, [user?.course, token]);

  const fetchStudents = async () => {
    if (!user?.course || !token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const courseParam = encodeURIComponent(user.course);
      console.log('Fetching students for course:', courseParam);
      
      const res = await fetch(
        `${API_ENDPOINTS.STUDENTS_BY_COURSE}/${courseParam}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Students response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch students: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Fetched students data:', data);
      
      // Filter out any null or incomplete students
      const validStudents = data.filter((student: any) => 
        student && 
        student._id && 
        (student.firstName || student.lastName || student.email)
      );
      console.log('Valid students after filtering:', validStudents.length);
      
      setStudents(validStudents);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    setSelectedStudents(prev =>
      prev.length === students.length
        ? []
        : students.map(s => s._id)
    );
  };

  const getStudentName = (student: Student) => {
    const firstName = student?.firstName || 'Unknown';
    const lastName = student?.lastName || 'Student';
    return `${firstName} ${lastName}`;
  };

  if (error) {
    return (
      <div className="manage-students-container">
        <div className="manage-students-content">
          <header className="manage-students-header">
            <h1 className="manage-students-title">
              My Students – {user?.course || 'Unknown Course'}
            </h1>
          </header>
          <div style={{ color: '#ef4444', textAlign: 'center', padding: '2rem' }}>
            {error}
            <button 
              onClick={fetchStudents}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-students-container">
      <div className="manage-students-content">
        <header className="manage-students-header">
          <h1 className="manage-students-title">
            My Students – {user?.course || 'Unknown Course'}
          </h1>
        </header>

        <section className="students-table-container">
          <div className="students-table-header">
            <h2 className="students-table-title">
              Student List ({students.length})
            </h2>
          </div>

          {loading ? (
            <div className="loading">Loading students…</div>
          ) : students.length === 0 ? (
            <div className="no-students">
              No students found in your course
            </div>
          ) : (
            <div className="students-table-wrapper">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectedStudents.length === students.length && students.length > 0}
                        onChange={handleSelectAll}
                      />{' '}
                      Select
                    </th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Level</th>
                    <th>Admission No.</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map(student => (
                    <tr key={student._id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student._id)}
                          onChange={() => handleStudentSelect(student._id)}
                        />
                      </td>
                      <td>{getStudentName(student)}</td>
                      <td>{student?.email || 'No email'}</td>
                      <td>{student?.phone || 'N/A'}</td>
                      <td>{student?.level || 'N/A'}</td>
                      <td>{student?.admission || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ManageStudents; 