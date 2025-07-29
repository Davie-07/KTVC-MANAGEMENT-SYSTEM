import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const CreateAnnouncementForm: React.FC = () => {
  const { user, token } = useAuth();
  const [form, setForm] = useState({ title: '', message: '', target: 'student' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/announcement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...form, createdBy: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Announcement created!');
        setForm({ title: '', message: '', target: 'student' });
      } else {
        setError(data.message || 'Failed to create announcement.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{background:'#23232b',color:'#fff',borderRadius:12,padding:'1.5rem',marginBottom:'1.5rem',boxShadow:'0 2px 12px #0002',maxWidth:500}}>
      <h3>Create Announcement</h3>
      {success && <div style={{color:'#22c55e',marginBottom:'0.7rem'}}>{success}</div>}
      {error && <div style={{color:'#ef4444',marginBottom:'0.7rem'}}>{error}</div>}
      <div style={{marginBottom:'1rem'}}>
        <label>Title<br/>
          <input name="title" value={form.title} onChange={handleChange} required style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}} />
        </label>
      </div>
      <div style={{marginBottom:'1rem'}}>
        <label>Message<br/>
          <textarea name="message" value={form.message} onChange={handleChange} required rows={3} style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}} />
        </label>
      </div>
      <div style={{marginBottom:'1rem'}}>
        <label>Target<br/>
          <select name="target" value={form.target} onChange={handleChange} style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}}>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="all">All</option>
          </select>
        </label>
      </div>
      <button type="submit" disabled={loading} style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:6,padding:'0.7rem 1.5rem',fontWeight:600,cursor:'pointer'}}>
        {loading ? 'Creating...' : 'Create Announcement'}
      </button>
    </form>
  );
};

export default CreateAnnouncementForm; 