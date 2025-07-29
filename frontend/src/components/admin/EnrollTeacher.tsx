import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

const TeachersManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', course: '', password: '', phone: '' });

  const courses = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science', 'Economics', 'Business Studies'];

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/auth/teachers');
      setTeachers(response.data);
      setError('');
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
      
      const response = await axios.post('http://localhost:5000/api/auth/teacher', form);
      
      if (response.status === 201) {
        setSuccess(`Teacher ${form.firstName} ${form.lastName} enrolled successfully!`);
        setForm({ firstName: '', lastName: '', email: '', course: '', password: '', phone: '' });
        setShowForm(false);
        fetchTeachers(); // Refresh the list
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to enroll teacher');
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
      
      const updateData = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        course: form.course,
        phone: form.phone
      };

      const response = await axios.put(`http://localhost:5000/api/auth/teacher/${editingTeacher._id}`, updateData);
      
      if (response.status === 200) {
        setSuccess(`Teacher ${form.firstName} ${form.lastName} updated successfully!`);
        setForm({ firstName: '', lastName: '', email: '', course: '', password: '', phone: '' });
        setEditingTeacher(null);
        setShowForm(false);
        fetchTeachers(); // Refresh the list
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update teacher');
      console.error('Error updating teacher:', err);
    }
  };

  const handleDelete = async (teacherId: string, teacherName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${teacherName}? This action cannot be undone.`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const response = await axios.delete(`http://localhost:5000/api/auth/teacher/${teacherId}`);
      
      if (response.status === 200) {
        setSuccess(`Teacher ${teacherName} deleted successfully!`);
        fetchTeachers(); // Refresh the list
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete teacher');
      console.error('Error deleting teacher:', err);
    }
  };

  const cancelEdit = () => {
    setEditingTeacher(null);
    setForm({ firstName: '', lastName: '', email: '', course: '', password: '', phone: '' });
    setShowForm(false);
  };

  return (
    <div style={{padding:'2rem',background:'#0f0f23',minHeight:'100vh',color:'#fff'}}>
      <div style={{maxWidth:'1200px',margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'2rem'}}>
          <h1 style={{margin:0,color:'#fff'}}>Teachers Management</h1>
          <button 
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
          <div style={{background:'#1a1a2e',padding:'2rem',borderRadius:'12px',marginBottom:'2rem',border:'1px solid #374151'}}>
            <h2 style={{marginTop:0,marginBottom:'1.5rem',color:'#fff'}}>
              {editingTeacher ? 'Edit Teacher' : 'Enroll New Teacher'}
            </h2>
            
            <form onSubmit={editingTeacher ? handleUpdate : handleSubmit}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
                <div>
                  <label>First Name<br/>
                    <input 
                      name="firstName" 
                      type="text" 
                      value={form.firstName} 
                      onChange={handleChange} 
                      required 
                      style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}}
                    />
                  </label>
                </div>
                <div>
                  <label>Last Name<br/>
                    <input 
                      name="lastName" 
                      type="text" 
                      value={form.lastName} 
                      onChange={handleChange} 
                      required 
                      style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}}
                    />
                  </label>
                </div>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
                <div>
                  <label>Email<br/>
                    <input 
                      name="email" 
                      type="email" 
                      value={form.email} 
                      onChange={handleChange} 
                      required 
                      style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}}
                    />
                  </label>
                </div>
                <div>
                  <label>Phone Number<br/>
                    <input 
                      name="phone" 
                      type="tel" 
                      value={form.phone} 
                      onChange={handleChange} 
                      required 
                      style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}}
                    />
                  </label>
                </div>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
                <div>
                  <label>Course<br/>
                    <select 
                      name="course" 
                      value={form.course} 
                      onChange={handleChange} 
                      required 
                      style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}}
                    >
                      <option value="">Select Course</option>
                      {courses.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                  </label>
                </div>
                {!editingTeacher && (
                  <div>
                    <label>Password<br/>
                      <input 
                        name="password" 
                        type="password" 
                        value={form.password} 
                        onChange={handleChange} 
                        required 
                        style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}}
                      />
                    </label>
                  </div>
                )}
              </div>

              <div style={{display:'flex',gap:'1rem',justifyContent:'flex-end'}}>
                {editingTeacher && (
                  <button 
                    type="button" 
                    onClick={cancelEdit}
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
          <div style={{padding:'1.5rem',borderBottom:'1px solid #374151'}}>
            <h2 style={{margin:0,color:'#fff'}}>All Teachers ({teachers.length})</h2>
          </div>
          
          {loading ? (
            <div style={{padding:'2rem',textAlign:'center',color:'#9ca3af'}}>Loading teachers...</div>
          ) : teachers.length === 0 ? (
            <div style={{padding:'2rem',textAlign:'center',color:'#9ca3af'}}>No teachers found</div>
          ) : (
            <div style={{overflowX:'auto'}}>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default TeachersManagement; 