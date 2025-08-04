import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';
import './ManageStudents.css';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
  level: string;
  admission: string;
}

const ManageStudents: React.FC = () => {
  const { user, token } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  useEffect(() => {
    if (user?.course && token) {
      fetchStudents();
    }
  }, [user?.course, token]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const courseParam = encodeURIComponent(user?.course || '');
      const res = await fetch(
        `${API_ENDPOINTS.STUDENTS_BY_COURSE}/${courseParam}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Failed to fetch');
      const data: Student[] = await res.json();
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
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

  return (
    <div className="manage-students-container">
      <div className="manage-students-content">
        <header className="manage-students-header">
          <h1 className="manage-students-title">
            My Students – {user?.course}
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
                        checked={selectedStudents.length === students.length}
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
                          onChange={() =>
                            handleStudentSelect(student._id)
                          }
                        />
                      </td>
                      <td>
                        {student?.firstName || 'Unknown'} {student?.lastName || ''}
                      </td>
                      <td>{student.email}</td>
                      <td>{student.phone || 'N/A'}</td>
                      <td>{student.level}</td>
                      <td>{student.admission}</td>
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