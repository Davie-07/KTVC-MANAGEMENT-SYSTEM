import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';
import './TeachersManagement.css';

interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
  teacherId: string;
  isVerified: boolean;
}

interface Course {
  _id: string;
  name: string;
  description: string;
  published: boolean;
}

const TeachersManagement: React.FC = () => {
  const { token } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', course: '', password: '', phone: '' });

  useEffect(() => {
    fetchTeachers();
    fetchPublishedCourses();
  }, []);

  const fetchPublishedCourses = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.PUBLISHED_COURSES, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.TEACHERS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
        setError('');
      } else {
        setError('Failed to fetch teachers');
      }
    } catch (err) {
      setError('Failed to fetch teachers');
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      
      const response = await fetch(API_ENDPOINTS.AUTH_TEACHER, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(form)
      });
      
      if (response.ok) {
        setSuccess(`Teacher ${form.firstName} ${form.lastName} enrolled successfully!`);
        setForm({ firstName: '', lastName: '', email: '', course: '', password: '', phone: '' });
        setShowForm(false);
        fetchTeachers(); // Refresh the list
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to enroll teacher');
      }
    } catch (err: any) {
      setError('Failed to enroll teacher');
      console.error('Error enrolling teacher:', err);
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setForm({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      course: teacher.course,
      phone: teacher.phone,
      password: '' // Don't populate password for editing
    });
    setShowForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    
    try {
      setError('');
      setSuccess('');
      
      const response = await fetch(`${API_ENDPOINTS.AUTH_TEACHER_UPDATE}/${editingTeacher._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(form)
      });
      
      if (response.ok) {
        setSuccess(`Teacher ${form.firstName} ${form.lastName} updated successfully!`);
        setEditingTeacher(null);
        setForm({ firstName: '', lastName: '', email: '', course: '', password: '', phone: '' });
        fetchTeachers(); // Refresh the list
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update teacher');
      }
    } catch (err: any) {
      setError('Failed to update teacher');
      console.error('Error updating teacher:', err);
    }
  };

  const handleDelete = async (teacherId: string, teacherName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${teacherName}?`)) return;
    
    try {
      setError('');
      setSuccess('');
      
      const response = await fetch(`${API_ENDPOINTS.AUTH_TEACHER_DELETE}/${teacherId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setSuccess(`Teacher ${teacherName} deleted successfully!`);
        fetchTeachers(); // Refresh the list
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete teacher');
      }
    } catch (err: any) {
      setError('Failed to delete teacher');
      console.error('Error deleting teacher:', err);
    }
  };

  const cancelEdit = () => {
    setEditingTeacher(null);
    setForm({ firstName: '', lastName: '', email: '', course: '', password: '', phone: '' });
    setShowForm(false);
  };

  return (
    <div className="teachers-container" style={{padding:'2rem',background:'#0f0f23',minHeight:'100vh',color:'#fff'}}>
      <div style={{maxWidth:'1200px',margin:'0 auto'}}>
        <div className="teachers-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'2rem'}}>
          <h1 className="teachers-title" style={{margin:0,color:'#fff'}}>Teachers Management</h1>
          <button 
            className="enroll-button"
            onClick={() => setShowForm(!showForm)}
            style={{
              padding:'0.75rem 1.5rem',
              background:showForm ? '#dc2626' : '#2563eb',
              color:'#fff',
              border:'none',
              borderRadius:'8px',
              cursor:'pointer',
              fontSize:'1rem',
              fontWeight:'600'
            }}
          >
            {showForm ? 'Cancel' : 'Enroll Teacher'}
          </button>
        </div>

        {error && (
          <div style={{padding:'1rem',background:'#dc2626',color:'#fff',borderRadius:'8px',marginBottom:'1rem'}}>
            {error}
          </div>
        )}

        {success && (
          <div style={{padding:'1rem',background:'#059669',color:'#fff',borderRadius:'8px',marginBottom:'1rem'}}>
            {success}
          </div>
        )}

        {showForm && (
          <div className="form-container" style={{background:'#1a1a2e',padding:'2rem',borderRadius:'12px',marginBottom:'2rem',border:'1px solid #374151'}}>
            <h2 className="form-title" style={{marginTop:0,marginBottom:'1.5rem',color:'#fff'}}>
              {editingTeacher ? 'Edit Teacher' : 'Enroll New Teacher'}
            </h2>
            
            <form onSubmit={editingTeacher ? handleUpdate : handleSubmit}>
              <div className="form-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
                <div>
                  <label className="form-label">First Name<br/>
                    <input 
                      name="firstName" 
                      type="text" 
                      value={form.firstName} 
                      onChange={handleChange} 
                      required 
                      className="form-input"
                      style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}}
                    />
                  </label>
                </div>
                <div>
                  <label className="form-label">Last Name<br/>
                    <input 
                      name="lastName" 
                      type="text" 
                      value={form.lastName} 
                      onChange={handleChange} 
                      required 
                      className="form-input"
                      style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}}
                    />
                  </label>
                </div>
              </div>

              <div className="form-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
                <div>
                  <label className="form-label">Email<br/>
                    <input 
                      name="email" 
                      type="email" 
                      value={form.email} 
                      onChange={handleChange} 
                      required 
                      className="form-input"
                      style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}}
                    />
                  </label>
                </div>
                <div>
                  <label className="form-label">Phone Number<br/>
                    <input 
                      name="phone" 
                      type="tel" 
                      value={form.phone} 
                      onChange={handleChange} 
                      required 
                      className="form-input"
                      style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}}
                    />
                  </label>
                </div>
              </div>

              <div className="form-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
                <div>
                  <label className="form-label">Course<br/>
                    <select 
                      name="course" 
                      value={form.course} 
                      onChange={handleChange} 
                      required 
                      className="form-input"
                      style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}}
                    >
                      <option value="">Select Course</option>
                      {courses.map(course => (
                        <option key={course._id} value={course.name}>{course.name}</option>
                      ))}
                    </select>
                  </label>
                </div>
                {!editingTeacher && (
                  <div>
                    <label className="form-label">Password<br/>
                      <input 
                        name="password" 
                        type="password" 
                        value={form.password} 
                        onChange={handleChange} 
                        required 
                        className="form-input"
                        style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}}
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="form-buttons" style={{display:'flex',gap:'1rem',justifyContent:'flex-end'}}>
                {editingTeacher && (
                  <button 
                    type="button" 
                    onClick={cancelEdit}
                    className="form-button"
                    style={{
                      padding:'0.75rem 1.5rem',
                      background:'#6b7280',
                      color:'#fff',
                      border:'none',
                      borderRadius:'8px',
                      cursor:'pointer',
                      fontSize:'1rem'
                    }}
                  >
                    Cancel
                  </button>
                )}
                <button 
                  type="submit"
                  className="form-button"
                  style={{
                    padding:'0.75rem 1.5rem',
                    background:'#2563eb',
                    color:'#fff',
                    border:'none',
                    borderRadius:'8px',
                    cursor:'pointer',
                    fontSize:'1rem',
                    fontWeight:'600'
                  }}
                >
                  {editingTeacher ? 'Update Teacher' : 'Enroll Teacher'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{background:'#1a1a2e',borderRadius:'12px',overflow:'hidden',border:'1px solid #374151'}}>
          <div className="table-container" style={{padding:'1.5rem',borderBottom:'1px solid #374151'}}>
            <h2 className="table-title" style={{margin:0,color:'#fff'}}>All Teachers ({teachers.length})</h2>
          </div>
          
          {loading ? (
            <div style={{padding:'2rem',textAlign:'center',color:'#9ca3af'}}>Loading teachers...</div>
          ) : teachers.length === 0 ? (
            <div style={{padding:'2rem',textAlign:'center',color:'#9ca3af'}}>No teachers found</div>
          ) : (
            <div style={{overflowX:'auto'}}>
              {/* Mobile Card View */}
              <div className="mobile-view" style={{display: 'none'}}>
                <div style={{padding:'1rem'}}>
                  {teachers.map((teacher) => (
                    <div key={teacher._id} className="mobile-card">
                      <div className="mobile-card-title">
                        <strong>{teacher.firstName} {teacher.lastName}</strong>
                      </div>
                      <div className="mobile-card-info">📧 {teacher.email}</div>
                      <div className="mobile-card-info">📞 {teacher.phone || 'N/A'}</div>
                      <div className="mobile-card-info">📚 {teacher.course}</div>
                      <div className="mobile-card-info">🆔 {teacher.teacherId}</div>
                      <div className="mobile-card-status">
                        <span style={{
                          padding:'0.25rem 0.5rem',
                          borderRadius:'4px',
                          fontSize:'0.75rem',
                          background: teacher.isVerified ? '#059669' : '#dc2626',
                          color:'#fff'
                        }}>
                          {teacher.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      <div className="mobile-card-actions">
                        <button 
                          onClick={() => handleEdit(teacher)}
                          className="mobile-action-button"
                          style={{
                            padding:'0.4rem 0.8rem',
                            background:'#2563eb',
                            color:'#fff',
                            border:'none',
                            borderRadius:'4px',
                            cursor:'pointer',
                            fontSize:'0.75rem'
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(teacher._id, `${teacher.firstName} ${teacher.lastName}`)}
                          className="mobile-action-button"
                          style={{
                            padding:'0.4rem 0.8rem',
                            background:'#dc2626',
                            color:'#fff',
                            border:'none',
                            borderRadius:'4px',
                            cursor:'pointer',
                            fontSize:'0.75rem'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Desktop Table View */}
              <div className="desktop-view">
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead>
                    <tr style={{background:'#374151'}}>
                      <th style={{padding:'1rem',textAlign:'left',borderBottom:'1px solid #4b5563'}}>Name</th>
                      <th style={{padding:'1rem',textAlign:'left',borderBottom:'1px solid #4b5563'}}>Email</th>
                      <th style={{padding:'1rem',textAlign:'left',borderBottom:'1px solid #4b5563'}}>Phone</th>
                      <th style={{padding:'1rem',textAlign:'left',borderBottom:'1px solid #4b5563'}}>Course</th>
                      <th style={{padding:'1rem',textAlign:'left',borderBottom:'1px solid #4b5563'}}>Teacher ID</th>
                      <th style={{padding:'1rem',textAlign:'left',borderBottom:'1px solid #4b5563'}}>Status</th>
                      <th style={{padding:'1rem',textAlign:'left',borderBottom:'1px solid #4b5563'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((teacher) => (
                      <tr key={teacher._id} style={{borderBottom:'1px solid #374151'}}>
                        <td style={{padding:'1rem'}}>{teacher.firstName} {teacher.lastName}</td>
                        <td style={{padding:'1rem'}}>{teacher.email}</td>
                        <td style={{padding:'1rem'}}>{teacher.phone || 'N/A'}</td>
                        <td style={{padding:'1rem'}}>{teacher.course}</td>
                        <td style={{padding:'1rem'}}>{teacher.teacherId}</td>
                        <td style={{padding:'1rem'}}>
                          <span style={{
                            padding:'0.25rem 0.5rem',
                            borderRadius:'4px',
                            fontSize:'0.875rem',
                            background: teacher.isVerified ? '#059669' : '#dc2626',
                            color:'#fff'
                          }}>
                            {teacher.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td style={{padding:'1rem'}}>
                          <div style={{display:'flex',gap:'0.5rem'}}>
                            <button 
                              onClick={() => handleEdit(teacher)}
                              style={{
                                padding:'0.5rem',
                                background:'#2563eb',
                                color:'#fff',
                                border:'none',
                                borderRadius:'4px',
                                cursor:'pointer',
                                fontSize:'0.875rem'
                              }}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(teacher._id, `${teacher.firstName} ${teacher.lastName}`)}
                              style={{
                                padding:'0.5rem',
                                background:'#dc2626',
                                color:'#fff',
                                border:'none',
                                borderRadius:'4px',
                                cursor:'pointer',
                                fontSize:'0.875rem'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeachersManagement; 