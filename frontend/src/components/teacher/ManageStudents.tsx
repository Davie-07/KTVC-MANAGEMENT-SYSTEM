import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

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

interface Class {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  course: string;
  teacher: string;
}

const ManageStudents: React.FC = () => {
  const { user, token } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [assignToClass, setAssignToClass] = useState<string>('');
  const [removeFromClass, _setRemoveFromClass] = useState<string>('');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      if (!user?.course) {
        setError('No course assigned to teacher');
        return;
      }
      
      const response = await axios.get(`http://localhost:5000/api/auth/students/course/${encodeURIComponent(user.course)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/class', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(response.data);
    } catch (err) {
      console.error('Error fetching classes:', err);
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
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s._id));
    }
  };

  const handleAssignToClass = async () => {
    if (!selectedClass || selectedStudents.length === 0) {
      setError('Please select a class and at least one student');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const response = await axios.post('http://localhost:5000/api/class/assign-students', {
        classId: selectedClass,
        studentIds: selectedStudents
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        setSuccess(`Successfully assigned ${selectedStudents.length} student(s) to class`);
        setSelectedStudents([]);
        setSelectedClass('');
        setShowAssignmentModal(false);
        fetchStudents(); // Refresh to show updated assignments
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign students to class');
      console.error('Error assigning students:', err);
    }
  };

  const removeFromClass = async (studentId: string, classId: string) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/class/${classId}/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        setSuccess('Student removed from class successfully');
        fetchStudents(); // Refresh
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove student from class');
    }
  };

  return (
    <div style={{ padding: '2rem', background: '#0f0f23', minHeight: '100vh', color: '#fff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, color: '#fff' }}>My Students - {user?.course}</h1>
          <button 
            onClick={() => setShowAssignmentModal(true)}
            disabled={selectedStudents.length === 0}
            style={{
              padding: '0.75rem 1.5rem',
              background: selectedStudents.length === 0 ? '#6b7280' : '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: selectedStudents.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            Assign to Class ({selectedStudents.length} selected)
          </button>
        </div>

        {error && (
          <div style={{ padding: '1rem', background: '#dc2626', color: '#fff', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '1rem', background: '#059669', color: '#fff', borderRadius: '8px', marginBottom: '1rem' }}>
            {success}
          </div>
        )}

        <div style={{ background: '#1a1a2e', borderRadius: '12px', overflow: 'hidden', border: '1px solid #374151' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #374151' }}>
            <h2 style={{ margin: 0, color: '#fff' }}>Student List ({students.length})</h2>
          </div>
          
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>Loading students...</div>
          ) : students.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>No students found in your course</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#374151' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #4b5563' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedStudents.length === students.length}
                        onChange={handleSelectAll}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Select
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #4b5563' }}>Name</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #4b5563' }}>Email</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #4b5563' }}>Phone</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #4b5563' }}>Course Level</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #4b5563' }}>Admission No.</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #4b5563' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id} style={{ borderBottom: '1px solid #374151' }}>
                      <td style={{ padding: '1rem' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedStudents.includes(student._id)}
                          onChange={() => handleStudentSelect(student._id)}
                        />
                      </td>
                      <td style={{ padding: '1rem' }}>{student.firstName} {student.lastName}</td>
                      <td style={{ padding: '1rem' }}>{student.email}</td>
                      <td style={{ padding: '1rem' }}>{student.phone || 'N/A'}</td>
                      <td style={{ padding: '1rem' }}>{student.level}</td>
                      <td style={{ padding: '1rem' }}>{student.admission}</td>
                      <td style={{ padding: '1rem' }}>
                        <button 
                          onClick={() => {
                            setSelectedStudents([student._id]);
                            setShowAssignmentModal(true);
                          }}
                          style={{
                            padding: '0.5rem',
                            background: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          Assign to Class
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Assignment Modal */}
        {showAssignmentModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: '#1a1a2e',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid #374151',
              maxWidth: '500px',
              width: '90%'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#fff' }}>
                Assign Students to Class
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e5e7eb' }}>
                  Select Class:
                </label>
                <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    border: '1px solid #3f3f46',
                    borderRadius: '6px',
                    background: '#18181b',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Choose a class...</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.title} - {cls.date} {cls.time}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ color: '#e5e7eb', margin: 0 }}>
                  Selected Students: {selectedStudents.length}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setSelectedClass('');
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#6b7280',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAssignToClass}
                  disabled={!selectedClass}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: !selectedClass ? '#6b7280' : '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: !selectedClass ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  Assign to Class
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStudents; 