import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface ExamResult {
  _id: string;
  student: { _id: string; firstName: string; lastName: string; email: string } | string;
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
  const [editForm, setEditForm] = useState<{ unit: string; cam1: string; cam2: string; cam3: string; average: string }>({ unit: '', cam1: '', cam2: '', cam3: '', average: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchResults = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/exam-result', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setResults(Array.isArray(data) ? data : []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line
  }, [token]);

  const startEdit = (r: ExamResult) => {
    setEditId(r._id);
    setEditForm({ 
      unit: r.unit, 
      cam1: r.cam1?.score?.toString() || '0', 
      cam2: r.cam2?.score?.toString() || '0', 
      cam3: r.cam3?.score?.toString() || '0', 
      average: r.average?.toString() || '0' 
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'cam1' || name === 'cam2' || name === 'cam3') {
        const cam1 = parseFloat(name === 'cam1' ? value : prev.cam1);
        const cam2 = parseFloat(name === 'cam2' ? value : prev.cam2);
        const cam3 = parseFloat(name === 'cam3' ? value : prev.cam3);
        if (!isNaN(cam1) && !isNaN(cam2) && !isNaN(cam3)) {
          updated.average = ((cam1 + cam2 + cam3) / 3).toFixed(2);
        }
      }
      return updated;
    });
  };

  const saveEdit = async () => {
    if (!editId) return;
    setSaving(true);
    await fetch(`http://localhost:5000/api/exam-result/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        unit: editForm.unit,
        cam1: { score: parseFloat(editForm.cam1), outOf: 100 },
        cam2: { score: parseFloat(editForm.cam2), outOf: 100 },
        cam3: { score: parseFloat(editForm.cam3), outOf: 100 },
        average: parseFloat(editForm.average)
      })
    });
    setEditId(null);
    setSaving(false);
    fetchResults();
  };

  const cancelEdit = () => {
    setEditId(null);
  };

  const deleteResult = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this result?')) return;
    setDeleting(id);
    await fetch(`http://localhost:5000/api/exam-result/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setDeleting(null);
    fetchResults();
  };

  return (
    <div style={{background:'#23232b',color:'#fff',borderRadius:12,padding:'1.5rem',marginBottom:'1.5rem',boxShadow:'0 2px 12px #0002',maxWidth:800}}>
      <h3>All Exam Results</h3>
      {loading ? (
        <p>Loading results...</p>
      ) : results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <table style={{width:'100%',color:'#fff',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'#18181b'}}>
              <th style={{padding:'0.5rem'}}>Student</th>
              <th style={{padding:'0.5rem'}}>Unit</th>
              <th style={{padding:'0.5rem'}}>Cam 1</th>
              <th style={{padding:'0.5rem'}}>Cam 2</th>
              <th style={{padding:'0.5rem'}}>Cam 3</th>
              <th style={{padding:'0.5rem'}}>Average</th>
              <th style={{padding:'0.5rem'}}>Edit</th>
              <th style={{padding:'0.5rem'}}>Delete</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => (
              <tr key={r._id} style={{background:'#23232b',borderBottom:'1px solid #444'}}>
                <td style={{padding:'0.5rem'}}>{typeof r.student === 'string' ? r.student : (r.student && typeof r.student === 'object' ? `${r.student.firstName || ''} ${r.student.lastName || ''} (${r.student.email || ''})` : 'Unknown Student')}</td>
                {editId === r._id ? (
                  <>
                    <td style={{padding:'0.5rem'}}><input name="unit" value={editForm.unit} onChange={handleEditChange} style={{width:'100%',padding:'0.3rem',borderRadius:4,border:'1px solid #444',background:'#18181b',color:'#fff'}} /></td>
                    <td style={{padding:'0.5rem'}}><input name="cam1" type="number" value={editForm.cam1} onChange={handleEditChange} style={{width:'100%',padding:'0.3rem',borderRadius:4,border:'1px solid #444',background:'#18181b',color:'#fff'}} /></td>
                    <td style={{padding:'0.5rem'}}><input name="cam2" type="number" value={editForm.cam2} onChange={handleEditChange} style={{width:'100%',padding:'0.3rem',borderRadius:4,border:'1px solid #444',background:'#18181b',color:'#fff'}} /></td>
                    <td style={{padding:'0.5rem'}}><input name="cam3" type="number" value={editForm.cam3} onChange={handleEditChange} style={{width:'100%',padding:'0.3rem',borderRadius:4,border:'1px solid #444',background:'#18181b',color:'#fff'}} /></td>
                    <td style={{padding:'0.5rem'}}><input name="average" value={editForm.average} readOnly style={{width:'100%',padding:'0.3rem',borderRadius:4,border:'1px solid #444',background:'#18181b',color:'#fff'}} /></td>
                    <td style={{padding:'0.5rem'}} colSpan={2}>
                      <button onClick={saveEdit} disabled={saving} style={{background:'#22c55e',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 1rem',fontWeight:600,cursor:'pointer',marginRight:8}}>{saving ? 'Saving...' : 'Save'}</button>
                      <button onClick={cancelEdit} style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 1rem',fontWeight:600,cursor:'pointer'}}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{padding:'0.5rem'}}>{r.unit}</td>
                    <td style={{padding:'0.5rem'}}>{r.cam1?.score || 0}/{r.cam1?.outOf || 100}</td>
                    <td style={{padding:'0.5rem'}}>{r.cam2?.score || 0}/{r.cam2?.outOf || 100}</td>
                    <td style={{padding:'0.5rem'}}>{r.cam3?.score || 0}/{r.cam3?.outOf || 100}</td>
                    <td style={{padding:'0.5rem'}}>{r.average}%</td>
                    <td style={{padding:'0.5rem'}}><button onClick={() => startEdit(r)} style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 1rem',fontWeight:600,cursor:'pointer'}}>Edit</button></td>
                    <td style={{padding:'0.5rem'}}><button onClick={() => deleteResult(r._id)} disabled={deleting === r._id} style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 1rem',fontWeight:600,cursor:'pointer'}}>{deleting === r._id ? 'Deleting...' : 'Delete'}</button></td>
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

export default ExamResultsList; 