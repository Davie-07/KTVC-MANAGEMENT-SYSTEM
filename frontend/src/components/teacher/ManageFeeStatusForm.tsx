import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const ManageFeeStatusForm: React.FC = () => {
  const { user, token } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [paid, setPaid] = useState('');
  const [due, setDue] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  if (!user || user.role !== 'teacher') return null;

  useEffect(() => {
    setLoadingStudents(true);
    fetch('http://localhost:5000/api/exam-result/students', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setStudents(Array.isArray(data) ? data : []))
      .catch(() => setStudents([]))
      .finally(() => setLoadingStudents(false));
  }, [token]);

  useEffect(() => {
    if (!selectedStudent) {
      setHistory([]);
      return;
    }
    setLoadingHistory(true);
    fetch(`http://localhost:5000/api/fee-status/history/${selectedStudent}`)
      .then(res => res.json())
      .then(data => setHistory(Array.isArray(data) ? data : []))
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
  }, [selectedStudent]);

  const filteredStudents = students.filter(s =>
    s.firstName.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.lastName.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/fee-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          student: selectedStudent,
          paid: parseFloat(paid),
          due: parseFloat(due),
          changedBy: user.id
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Fee status updated!');
        setPaid('');
        setDue('');
        setSelectedStudent('');
      } else {
        setError(data.message || 'Failed to update fee status.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{background:'#23232b',color:'#fff',borderRadius:12,padding:'1.5rem',marginBottom:'1.5rem',boxShadow:'0 2px 12px #0002',maxWidth:500}}>
      <h3>Manage Student Fee Status</h3>
      {success && <div style={{color:'#22c55e',marginBottom:'0.7rem'}}>{success}</div>}
      {error && <div style={{color:'#ef4444',marginBottom:'0.7rem'}}>{error}</div>}
      <div style={{marginBottom:'1rem'}}>
        <label>Student<br/>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={studentSearch}
            onChange={e => setStudentSearch(e.target.value)}
            style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff',marginBottom:'0.5rem'}}
          />
          <select
            name="student"
            value={selectedStudent}
            onChange={e => setSelectedStudent(e.target.value)}
            required
            style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}}
            disabled={loadingStudents}
          >
            <option value="">Select student...</option>
            {filteredStudents.map(s => (
              <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.email})</option>
            ))}
          </select>
        </label>
      </div>
      <div style={{marginBottom:'1rem'}}>
        <label>Amount Paid<br/>
          <input name="paid" type="number" value={paid} onChange={e => setPaid(e.target.value)} required min={0} style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}} />
        </label>
      </div>
      <div style={{marginBottom:'1rem'}}>
        <label>Total Remaining<br/>
          <input name="due" type="number" value={due} onChange={e => setDue(e.target.value)} required min={0} style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}} />
        </label>
      </div>
      <button type="submit" disabled={loading} style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:6,padding:'0.7rem 1.5rem',fontWeight:600,cursor:'pointer'}}>
        {loading ? 'Saving...' : 'Save Fee Status'}
      </button>
      {history.length > 0 && (
        <div style={{marginTop:'2rem'}}>
          <h4>Fee Status History</h4>
          {loadingHistory ? <p>Loading history...</p> : (
            <table style={{width:'100%',color:'#fff',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#18181b'}}>
                  <th style={{padding:'0.5rem'}}>Date</th>
                  <th style={{padding:'0.5rem'}}>Paid</th>
                  <th style={{padding:'0.5rem'}}>Due</th>
                  <th style={{padding:'0.5rem'}}>Changed By</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h._id} style={{background:'#23232b',borderBottom:'1px solid #444'}}>
                    <td style={{padding:'0.5rem'}}>{new Date(h.changedAt).toLocaleString()}</td>
                    <td style={{padding:'0.5rem'}}>{h.paid}</td>
                    <td style={{padding:'0.5rem'}}>{h.due}</td>
                    <td style={{padding:'0.5rem'}}>{h.changedBy ? `${h.changedBy.firstName} ${h.changedBy.lastName}` : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </form>
  );
};

export default ManageFeeStatusForm; 