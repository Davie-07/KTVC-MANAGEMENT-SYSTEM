import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';

interface UserOption {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const CreateClassForm: React.FC<{ onCreated?: () => void }> = ({ onCreated }) => {
  const { user, token } = useAuth();
  const [form, setForm] = useState({ title: '', course: '', date: '', startTime: '', endTime: '', teacher: '', students: [] as string[] });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<UserOption[]>([]);
  const [students, setStudents] = useState<UserOption[]>([]);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [loadingOptions, setLoadingOptions] = useState(false);

  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) return null;

  useEffect(() => {
    setLoadingOptions(true);
    // Use the correct endpoint for teachers
    Promise.all([
      fetch(API_ENDPOINTS.TEACHERS, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
      fetch(`${API_ENDPOINTS.EXAM_RESULTS}/students`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json())
    ])
      .then(([teachersData, studentsData]) => {
        // Debug: log the raw teacher data
        console.log('Fetched teachersData:', teachersData);
        // Filter out null/invalid teachers and log any issues
        const validTeachers = Array.isArray(teachersData)
          ? teachersData.filter((t, i) => {
              const valid = t && typeof t.firstName === 'string' && typeof t.lastName === 'string' && typeof t.email === 'string';
              if (!valid) console.warn('Invalid teacher entry at index', i, t);
              return valid;
            })
          : [];
        setTeachers(validTeachers);
        setStudents(Array.isArray(studentsData) ? studentsData : []);
      })
      .catch((err) => {
        console.error('Error fetching teachers/students:', err);
        setTeachers([]);
        setStudents([]);
      })
      .finally(() => setLoadingOptions(false));
  }, [token]);

  const filteredTeachers = teachers.filter(t =>
    t.firstName.toLowerCase().includes(teacherSearch.toLowerCase()) ||
    t.lastName.toLowerCase().includes(teacherSearch.toLowerCase()) ||
    t.email.toLowerCase().includes(teacherSearch.toLowerCase())
  );
  const filteredStudents = students.filter(s =>
    s.firstName.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.lastName.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, selectedOptions } = e.target as HTMLInputElement & HTMLSelectElement;
    if (name === 'students') {
      const values = Array.from(selectedOptions).map(opt => opt.value);
      setForm(prev => ({ ...prev, students: values }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const res = await fetch(API_ENDPOINTS.PUBLISH_CLASS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: form.title,
          course: form.course,
          teacherId: form.teacher,
          students: form.students,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Class created successfully! Students will be notified.');
        setForm({ title: '', course: '', date: '', startTime: '', endTime: '', teacher: '', students: [] });
        
        // Create notifications for assigned students
        if (form.students.length > 0) {
          try {
            await fetch(API_ENDPOINTS.NOTIFICATIONS, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                recipients: form.students,
                type: 'class_assigned',
                message: `You have been assigned to class: ${form.title} on ${form.date} at ${form.startTime}`
              }),
            });
          } catch (notifError) {
            console.error('Failed to send notifications:', notifError);
          }
        }
        
        if (onCreated) onCreated();
      } else {
        setError(data.message || 'Failed to create class.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{background:'#23232b',color:'#fff',borderRadius:12,padding:'1.5rem',marginBottom:'1.5rem',boxShadow:'0 2px 12px #0002',maxWidth:500}}>
      <h3>Add New Class</h3>
      {success && <div style={{color:'#22c55e',marginBottom:'0.7rem'}}>{success}</div>}
      {error && <div style={{color:'#ef4444',marginBottom:'0.7rem'}}>{error}</div>}
      <div style={{marginBottom:'1rem'}}>
        <label>Title<br/>
          <input name="title" value={form.title} onChange={handleFormChange} required style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}} />
        </label>
      </div>
      <div style={{marginBottom:'1rem'}}>
        <label>Course<br/>
          <input name="course" value={form.course} onChange={handleFormChange} required style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}} />
        </label>
      </div>
      <div style={{marginBottom:'1rem'}}>
        <label>Teacher<br/>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={teacherSearch}
            onChange={e => setTeacherSearch(e.target.value)}
            style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff',marginBottom:'0.5rem'}}
          />
          <select
            name="teacher"
            value={form.teacher}
            onChange={handleFormChange}
            required
            style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}}
            disabled={loadingOptions}
          >
            <option value="">Select teacher...</option>
            {filteredTeachers.map((t, idx) =>
              t
                ? <option key={t._id} value={t._id}>{t.firstName} {t.lastName} ({t.email})</option>
                : <option key={idx} value="">Unknown Teacher</option>
            )}
          </select>
        </label>
      </div>
      <div style={{marginBottom:'1rem'}}>
        <label>Students<br/>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={studentSearch}
            onChange={e => setStudentSearch(e.target.value)}
            style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff',marginBottom:'0.5rem'}}
          />
          <select
            name="students"
            multiple
            value={form.students}
            onChange={handleFormChange}
            required
            style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff',minHeight:80}}
            disabled={loadingOptions}
          >
            {filteredStudents.map(s => (
              <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.email})</option>
            ))}
          </select>
        </label>
      </div>
      <div style={{marginBottom:'1rem'}}>
        <label>Date<br/>
          <input name="date" type="date" value={form.date} onChange={handleFormChange} required style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}} />
        </label>
      </div>
      <div style={{marginBottom:'1rem',display:'flex',gap:'1rem'}}>
        <label style={{flex:1}}>Start Time<br/>
          <input name="startTime" value={form.startTime} onChange={handleFormChange} required style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}} />
        </label>
        <label style={{flex:1}}>End Time<br/>
          <input name="endTime" value={form.endTime} onChange={handleFormChange} required style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}} />
        </label>
      </div>
      <button type="submit" disabled={loading} style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:6,padding:'0.7rem 1.5rem',fontWeight:600,cursor:'pointer'}}>
        {loading ? 'Saving...' : 'Save Class'}
      </button>
    </form>
  );
};

export default CreateClassForm; 