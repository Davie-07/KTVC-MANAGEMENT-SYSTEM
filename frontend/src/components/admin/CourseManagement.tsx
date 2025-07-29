import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';

interface Course {
  _id?: string;
  name: string;
  description: string;
  levels: { name: string; duration: string }[];
  duration: string;
  published: boolean;
}

const initialCourse = {
  name: '',
  description: '',
  levels: [{ name: '', duration: '' }],
  duration: '',
  published: false,
};

const CourseManagement: React.FC = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState<any>(initialCourse);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all courses
  useEffect(() => {
    if (!token) {
      setError('Not authorized. Please log in as admin.');
      return;
    }
    setLoading(true);
    fetch(API_ENDPOINTS.COURSES, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => { setCourses(data); setLoading(false); })
      .catch(() => { setError('Failed to fetch courses.'); setLoading(false); });
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, idx?: number) => {
    const { name, value } = e.target;
    if (name.startsWith('level-') && typeof idx === 'number') {
      const key = name.split('-')[1];
      setForm((prev: any) => {
        const levels = [...prev.levels];
        levels[idx][key] = value;
        return { ...prev, levels };
      });
    } else {
      setForm((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const addLevel = () => setForm((prev: any) => ({ ...prev, levels: [...prev.levels, { name: '', duration: '' }] }));
  const removeLevel = (idx: number) => setForm((prev: any) => ({ ...prev, levels: prev.levels.filter((_: any, i: number) => i !== idx) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Not authorized. Please log in as admin.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (editingId) {
        // Update
        const res = await fetch(`${API_ENDPOINTS.COURSES}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Failed to update course');
        const updated = await res.json();
        setCourses(cs => cs.map(c => c._id === editingId ? updated : c));
        setEditingId(null);
      } else {
        // Create
        const res = await fetch(API_ENDPOINTS.COURSES, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Failed to create course');
        const created = await res.json();
        setCourses(cs => [...cs, created]);
      }
      setForm(initialCourse);
    } catch (err: any) {
      setError(err.message || 'Error saving course.');
    } finally {
      setLoading(false);
    }
  };

  const editCourse = (id: string) => {
    const course = courses.find(c => c._id === id);
    if (course) {
      setForm({ ...course });
      setEditingId(id);
    }
  };

  const deleteCourse = async (id: string) => {
    if (!token) {
      setError('Not authorized. Please log in as admin.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_ENDPOINTS.COURSES}/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to delete course');
      setCourses(cs => cs.filter(c => c._id !== id));
    } catch (err: any) {
      setError(err.message || 'Error deleting course.');
    } finally {
      setLoading(false);
    }
  };

  const publishCourse = async (id: string) => {
    if (!token) {
      setError('Not authorized. Please log in as admin.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_ENDPOINTS.COURSES}/${id}/publish`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to publish course');
      const updated = await res.json();
      setCourses(cs => cs.map(c => c._id === id ? updated : c));
    } catch (err: any) {
      setError(err.message || 'Error publishing course.');
    } finally {
      setLoading(false);
    }
  };

  const unpublishCourse = async (id: string) => {
    if (!token) {
      setError('Not authorized. Please log in as admin.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_ENDPOINTS.COURSES}/${id}/publish`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to unpublish course');
      const updated = await res.json();
      setCourses(cs => cs.map(c => c._id === id ? updated : c));
    } catch (err: any) {
      setError(err.message || 'Error unpublishing course.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{background:'#23232b',color:'#fff',borderRadius:12,padding:'1.5rem',marginBottom:'1.5rem',boxShadow:'0 2px 12px #0002',maxWidth:700}}>
      <h3>Course Management</h3>
      {error && <div style={{color:'#ef4444',marginBottom:'1rem'}}>{error}</div>}
      <form onSubmit={handleSubmit} style={{marginBottom:'2rem'}}>
        <div style={{marginBottom:'1rem'}}>
          <label>Course Name<br/>
            <input name="name" value={form.name} onChange={handleChange} required style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}} />
          </label>
        </div>
        <div style={{marginBottom:'1rem'}}>
          <label>Description<br/>
            <textarea name="description" value={form.description} onChange={handleChange} required style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}} />
          </label>
        </div>
        <div style={{marginBottom:'1rem'}}>
          <label>Course Duration (total)<br/>
            <input name="duration" value={form.duration} onChange={handleChange} required placeholder="e.g. 3 years" style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}} />
          </label>
        </div>
        <div style={{marginBottom:'1rem'}}>
          <label>Levels</label>
          {form.levels.map((level: any, idx: number) => (
            <div key={idx} style={{display:'flex',gap:'1rem',marginBottom:'0.5rem'}}>
              <input name="level-name" value={level.name} onChange={e => handleChange({ ...e, target: { ...e.target, name: 'level-name' } }, idx)} required placeholder={`Level ${idx+1} Name`} style={{flex:2,padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}} />
              <input name="level-duration" value={level.duration} onChange={e => handleChange({ ...e, target: { ...e.target, name: 'level-duration' } }, idx)} required placeholder="Duration" style={{flex:1,padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}} />
              {form.levels.length > 1 && <button type="button" onClick={() => removeLevel(idx)} style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 1rem',fontWeight:600,cursor:'pointer'}}>Remove</button>}
            </div>
          ))}
          <button type="button" onClick={addLevel} style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 1rem',fontWeight:600,cursor:'pointer',marginTop:'0.5rem'}}>Add Level</button>
        </div>
        <button type="submit" style={{background:'#22c55e',color:'#fff',border:'none',borderRadius:6,padding:'0.7rem 1.5rem',fontWeight:600,cursor:'pointer'}} disabled={loading}>{editingId ? 'Update Course' : 'Create Course'}</button>
      </form>
      <h4>All Courses</h4>
      {loading ? <p>Loading...</p> : courses.length === 0 ? <p>No courses yet.</p> : (
        <table style={{width:'100%',color:'#fff',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'#18181b'}}>
              <th style={{padding:'0.5rem'}}>Name</th>
              <th style={{padding:'0.5rem'}}>Levels</th>
              <th style={{padding:'0.5rem'}}>Duration</th>
              <th style={{padding:'0.5rem'}}>Status</th>
              <th style={{padding:'0.5rem'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(c => (
              <tr key={c._id} style={{background:'#23232b',borderBottom:'1px solid #444'}}>
                <td style={{padding:'0.5rem'}}>{c.name}</td>
                <td style={{padding:'0.5rem'}}>{c.levels.map((l, i) => <span key={i}>{l.name} ({l.duration})<br/></span>)}</td>
                <td style={{padding:'0.5rem'}}>{c.duration}</td>
                <td style={{padding:'0.5rem'}}>{c.published ? 'Published' : 'Draft'}</td>
                <td style={{padding:'0.5rem'}}>
                  <button onClick={() => editCourse(c._id!)} style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 1rem',fontWeight:600,cursor:'pointer',marginRight:8}}>Edit</button>
                  <button onClick={() => deleteCourse(c._id!)} style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 1rem',fontWeight:600,cursor:'pointer',marginRight:8}}>Delete</button>
                  {c.published ? (
                    <button onClick={() => unpublishCourse(c._id!)} style={{background:'#f59e42',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 1rem',fontWeight:600,cursor:'pointer'}}>Unpublish</button>
                  ) : (
                    <button onClick={() => publishCourse(c._id!)} style={{background:'#22c55e',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 1rem',fontWeight:600,cursor:'pointer'}}>Publish</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CourseManagement; 