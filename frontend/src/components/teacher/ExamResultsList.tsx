import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ExamResult {
  _id: string;
  student: Student | string;
  unit: string;
  cam1: { score: number; outOf: number };
  cam2: { score: number; outOf: number };
  cam3: { score: number; outOf: number };
  average: number;
}

const ExamResultsList: React.FC = () => {
  const { token } = useAuth();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    unit: '',
    cam1: '',
    cam2: '',
    cam3: '',
    average: ''
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchResults = () => {
    setLoading(true);
    fetch(API_ENDPOINTS.EXAM_RESULTS, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setResults(Array.isArray(data) ? data : []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (token) fetchResults();
  }, [token]);

  const startEdit = (r: ExamResult) => {
    setEditId(r._id);
    setEditForm({
      unit: r.unit,
      cam1: r.cam1?.score.toString() || '0',
      cam2: r.cam2?.score.toString() || '0',
      cam3: r.cam3?.score.toString() || '0',
      average: r.average?.toString() || '0'
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => {
      const updated = { ...prev, [name]: value };
      const camScores = ['cam1', 'cam2', 'cam3'].map(k => parseFloat(updated[k as keyof typeof updated]));
      if (camScores.every(score => !isNaN(score))) {
        updated.average = (camScores.reduce((a, b) => a + b, 0) / 3).toFixed(2);
      }
      return updated;
    });
  };

  const saveEdit = async () => {
    if (!editId) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.EXAM_RESULTS}/${editId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      if (response.ok) {
        const updated = await response.json();
        setResults(prev => prev.map(r => r._id === editId ? updated : r));
        setEditId(null);
        setEditForm({ unit: '', cam1: '', cam2: '', cam3: '', average: '' });
      }
    } catch (error) {
      console.error('Error saving edit:', error);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
  };

  const deleteResult = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this exam result?')) return;
    setDeleting(id);
    try {
      const response = await fetch(`${API_ENDPOINTS.EXAM_RESULTS}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setResults(prev => prev.filter(r => r._id !== id));
      }
    } catch (error) {
      console.error('Error deleting result:', error);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div style={{ background: '#23232b', color: '#fff', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 12px #0002', maxWidth: 800 }}>
      <h3>All Exam Results</h3>
      {loading ? (
        <p>Loading results...</p>
      ) : results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <table style={{ width: '100%', color: '#fff', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#18181b' }}>
              <th>Student</th><th>Unit</th><th>Cam 1</th><th>Cam 2</th><th>Cam 3</th><th>Average</th><th>Edit</th><th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => {
              const isEditing = editId === r._id;
              const studentLabel = typeof r.student === 'string' ? r.student : `${r.student.firstName} ${r.student.lastName} (${r.student.email})`;
              return (
                <tr key={r._id} style={{ background: '#23232b', borderBottom: '1px solid #444' }}>
                  <td>{studentLabel}</td>
                  {isEditing ? (
                    <>
                      {['unit', 'cam1', 'cam2', 'cam3'].map(field => (
                        <td key={field}>
                          <input name={field} type={field.startsWith('cam') ? 'number' : 'text'} value={editForm[field as keyof typeof editForm]} onChange={handleEditChange} style={{ width: '100%', padding: '0.3rem', borderRadius: 4, border: '1px solid #444', background: '#18181b', color: '#fff' }} />
                        </td>
                      ))}
                      <td>
                        <input name="average" value={editForm.average} readOnly style={{ width: '100%', padding: '0.3rem', borderRadius: 4, border: '1px solid #444', background: '#18181b', color: '#fff' }} />
                      </td>
                      <td colSpan={2}>
                        <button onClick={saveEdit} disabled={saving} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '0.3rem 1rem', fontWeight: 600, marginRight: 8 }}>{saving ? 'Saving...' : 'Save'}</button>
                        <button onClick={cancelEdit} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '0.3rem 1rem', fontWeight: 600 }}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{r.unit}</td>
                      <td>{r.cam1.score}/{r.cam1.outOf}</td>
                      <td>{r.cam2.score}/{r.cam2.outOf}</td>
                      <td>{r.cam3.score}/{r.cam3.outOf}</td>
                      <td>{r.average}%</td>
                      <td><button onClick={() => startEdit(r)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '0.3rem 1rem', fontWeight: 600 }}>Edit</button></td>
                      <td><button onClick={() => deleteResult(r._id)} disabled={deleting === r._id} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '0.3rem 1rem', fontWeight: 600 }}>{deleting === r._id ? 'Deleting...' : 'Delete'}</button></td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ExamResultsList;
