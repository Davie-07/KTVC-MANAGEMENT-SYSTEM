import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';

interface ClassItem {
  _id: string;
  title: string;
  course: string;
  teacher: { _id: string; firstName: string; lastName: string; email: string } | string;
  students: ({ _id: string; firstName: string; lastName: string; email: string } | string)[];
  date: string;
  startTime: string;
  endTime: string;
  published: boolean;
}

const ClassManagementList: React.FC = () => {
  const { token } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.CLASSES, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line
  }, [token]);

  const startEdit = (c: ClassItem) => {
    setEditId(c._id);
    setEditForm({
      title: c.title,
      course: c.course,
      date: c.date.slice(0, 10),
      startTime: c.startTime,
      endTime: c.endTime,
      students: c.students.map(s => typeof s === 'string' ? s : s._id).join(',')
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    if (!editId) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.CLASSES}/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...editForm,
          students: editForm.students.split(',').map((s: string) => s.trim())
        })
      });
      if (response.ok) {
        setEditId(null);
        fetchClasses();
      }
    } catch (error) {
      console.error('Error saving class:', error);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => setEditId(null);

  const deleteClass = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    setDeleting(id);
    try {
      const response = await fetch(`${API_ENDPOINTS.CLASSES}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setDeleting(null);
        fetchClasses();
      }
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  const togglePublish = async (id: string, published: boolean) => {
    setPublishing(id);
    try {
      const response = await fetch(`${API_ENDPOINTS.CLASSES}/${id}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ published: !published })
      });
      if (response.ok) {
        setPublishing(null);
        fetchClasses();
      }
    } catch (error) {
      console.error('Error publishing class:', error);
    }
  };

  return (
    <div style={{background:'#23232b',color:'#fff',borderRadius:12,padding:'1.5rem',marginBottom:'1.5rem',boxShadow:'0 2px 12px #0002',maxWidth:1100}}>
      <h3>All Classes</h3>
      {loading ? (
        <p>Loading classes...</p>
      ) : classes.length === 0 ? (
        <p>No classes found.</p>
      ) : (
        <table style={{width:'100%',color:'#fff',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'#18181b'}}>
              <th style={{padding:'0.5rem'}}>Title</th>
              <th style={{padding:'0.5rem'}}>Course</th>
              <th style={{padding:'0.5rem'}}>Date</th>
              <th style={{padding:'0.5rem'}}>Time</th>
              <th style={{padding:'0.5rem'}}>Students</th>
              <th style={{padding:'0.5rem'}}>Published</th>
              <th style={{padding:'0.5rem'}}>Edit</th>
              <th style={{padding:'0.5rem'}}>Delete</th>
            </tr>
          </thead>
          <tbody>
            {classes.map(c => (
              <tr key={c._id} style={{background:'#23232b',borderBottom:'1px solid #444'}}>
                {editId === c._id ? (
                  <>
                    <td style={{padding:'0.5rem'}}><input name="title" value={editForm.title} onChange={handleEditChange} style={{width:'100%',padding:'0.3rem',borderRadius:4,border:'1px solid #444',background:'#18181b',color:'#fff'}} /></td>
                    <td style={{padding:'0.5rem'}}><input name="course" value={editForm.course} onChange={handleEditChange} style={{width:'100%',padding:'0.3rem',borderRadius:4,border:'1px solid #444',background:'#18181b',color:'#fff'}} /></td>
                    <td style={{padding:'0.5rem'}}><input name="date" type="date" value={editForm.date} onChange={handleEditChange} style={{width:'100%',padding:'0.3rem',borderRadius:4,border:'1px solid #444',background:'#18181b',color:'#fff'}} /></td>
                    <td style={{padding:'0.5rem'}}>
                      <input name="startTime" value={editForm.startTime} onChange={handleEditChange} style={{width:'45%',padding:'0.3rem',borderRadius:4,border:'1px solid #444',background:'#18181b',color:'#fff',marginRight:'5%'}} />
                      <input name="endTime" value={editForm.endTime} onChange={handleEditChange} style={{width:'45%',padding:'0.3rem',borderRadius:4,border:'1px solid #444',background:'#18181b',color:'#fff'}} />
                    </td>
                    <td style={{padding:'0.5rem'}}><input name="students" value={editForm.students} onChange={handleEditChange} style={{width:'100%',padding:'0.3rem',borderRadius:4,border:'1px solid #444',background:'#18181b',color:'#fff'}} placeholder="Comma-separated IDs" /></td>
                    <td style={{padding:'0.5rem'}}>{c.published ? 'Yes' : 'No'}</td>
                    <td style={{padding:'0.5rem'}} colSpan={2}>
                      <button onClick={saveEdit} disabled={saving} style={{background:'#22c55e',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 1rem',fontWeight:600,cursor:'pointer',marginRight:8}}>{saving ? 'Saving...' : 'Save'}</button>
                      <button onClick={cancelEdit} style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 1rem',fontWeight:600,cursor:'pointer'}}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{padding:'0.5rem'}}>{c.title}</td>
                    <td style={{padding:'0.5rem'}}>{c.course}</td>
                    <td style={{padding:'0.5rem'}}>{new Date(c.date).toLocaleDateString()}</td>
                    <td style={{padding:'0.5rem'}}>{c.startTime} - {c.endTime}</td>
                    <td style={{padding:'0.5rem'}}>{c.students?.filter(s => s && (typeof s === 'string' || (s.firstName || s.lastName)))?.map(s => typeof s === 'string' ? s : `${s?.firstName || 'Unknown'} ${s?.lastName || 'Student'}`).join(', ') || 'No students'}</td>
                    <td style={{padding:'0.5rem'}}>
                      <button onClick={() => togglePublish(c._id, c.published)} disabled={publishing === c._id} style={{background:c.published ? '#22c55e' : '#ef4444',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 1rem',fontWeight:600,cursor:'pointer'}}>{publishing === c._id ? '...' : c.published ? 'Unpublish' : 'Publish'}</button>
                    </td>
                    <td style={{padding:'0.5rem'}}><button onClick={() => startEdit(c)} style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 1rem',fontWeight:600,cursor:'pointer'}}>Edit</button></td>
                    <td style={{padding:'0.5rem'}}><button onClick={() => deleteClass(c._id)} disabled={deleting === c._id} style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 1rem',fontWeight:600,cursor:'pointer'}}>{deleting === c._id ? 'Deleting...' : 'Delete'}</button></td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ClassManagementList; 