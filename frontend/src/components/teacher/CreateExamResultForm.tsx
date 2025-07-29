import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const CreateExamResultForm: React.FC = () => {
  const { user, token } = useAuth();
  const [form, setForm] = useState({ 
    student: '', 
    unit: '', 
    cam1: { score: '', outOf: '100' }, 
    cam2: { score: '', outOf: '100' }, 
    cam3: { score: '', outOf: '100' }, 
    average: '' 
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) return null;

  useEffect(() => {
    setStudentsLoading(true);
    fetch('http://localhost:5000/api/exam-result/students', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStudents(Array.isArray(data) ? data : []))
      .catch(() => setStudents([]))
      .finally(() => setStudentsLoading(false));
  }, [token]);

  useEffect(() => {
    if (!selectedStudent) {
      setHistory([]);
      return;
    }
    setLoadingHistory(true);
    fetch(`http://localhost:5000/api/exam-result/history/${selectedStudent}`)
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

  const calculateAverage = () => {
    const cam1Score = parseFloat(form.cam1.score);
    const cam1OutOf = parseFloat(form.cam1.outOf);
    const cam2Score = parseFloat(form.cam2.score);
    const cam2OutOf = parseFloat(form.cam2.outOf);
    const cam3Score = parseFloat(form.cam3.score);
    const cam3OutOf = parseFloat(form.cam3.outOf);

    const validCams = [];
    if (!isNaN(cam1Score) && !isNaN(cam1OutOf) && cam1OutOf > 0) {
      validCams.push((cam1Score / cam1OutOf) * 100);
    }
    if (!isNaN(cam2Score) && !isNaN(cam2OutOf) && cam2OutOf > 0) {
      validCams.push((cam2Score / cam2OutOf) * 100);
    }
    if (!isNaN(cam3Score) && !isNaN(cam3OutOf) && cam3OutOf > 0) {
      validCams.push((cam3Score / cam3OutOf) * 100);
    }

    if (validCams.length > 0) {
      const average = validCams.reduce((sum, score) => sum + score, 0) / validCams.length;
      setForm(prev => ({ ...prev, average: average.toFixed(2) }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('cam')) {
      const [cam, field] = name.split('.');
      setForm(prev => ({
        ...prev,
        [cam]: { ...prev[cam as keyof typeof prev], [field]: value }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    calculateAverage();
  }, [form.cam1.score, form.cam1.outOf, form.cam2.score, form.cam2.outOf, form.cam3.score, form.cam3.outOf]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/exam-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          student: form.student,
          unit: form.unit,
          cam1: {
            score: parseFloat(form.cam1.score) || 0,
            outOf: parseFloat(form.cam1.outOf) || 100
          },
          cam2: {
            score: parseFloat(form.cam2.score) || 0,
            outOf: parseFloat(form.cam2.outOf) || 100
          },
          cam3: {
            score: parseFloat(form.cam3.score) || 0,
            outOf: parseFloat(form.cam3.outOf) || 100
          },
          average: parseFloat(form.average),
          changedBy: user.id
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Exam result created successfully!');
        setForm({ 
          student: '', 
          unit: '', 
          cam1: { score: '', outOf: '100' }, 
          cam2: { score: '', outOf: '100' }, 
          cam3: { score: '', outOf: '100' }, 
          average: '' 
        });
      } else {
        setError(data.message || 'Failed to create exam result.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="exam-result-form">
      <h3>📊 Enter Exam Result</h3>
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label>Student</label>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={studentSearch}
          onChange={e => setStudentSearch(e.target.value)}
          className="form-input"
        />
        <select
          name="student"
          value={form.student}
          onChange={handleChange}
          required
          className="form-select"
          disabled={studentsLoading}
        >
          <option value="">Select student...</option>
          {filteredStudents.map(s => (
            <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.email})</option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label>Unit/Subject</label>
        <input 
          name="unit" 
          value={form.unit} 
          onChange={handleChange} 
          required 
          className="form-input"
          placeholder="e.g., Mathematics, Physics, etc."
        />
      </div>
      
      <div className="cam-scores">
        <div className="cam-group">
          <label>CAM 1</label>
          <div className="score-inputs">
            <input 
              name="cam1.score" 
              type="number" 
              value={form.cam1.score} 
              onChange={handleChange} 
              min={0} 
              className="form-input score-input"
              placeholder="Score"
            />
            <span className="score-separator">/</span>
            <input 
              name="cam1.outOf" 
              type="number" 
              value={form.cam1.outOf} 
              onChange={handleChange} 
              min={1} 
              className="form-input out-of-input"
              placeholder="Out of"
            />
          </div>
        </div>
        
        <div className="cam-group">
          <label>CAM 2</label>
          <div className="score-inputs">
            <input 
              name="cam2.score" 
              type="number" 
              value={form.cam2.score} 
              onChange={handleChange} 
              min={0} 
              className="form-input score-input"
              placeholder="Score"
            />
            <span className="score-separator">/</span>
            <input 
              name="cam2.outOf" 
              type="number" 
              value={form.cam2.outOf} 
              onChange={handleChange} 
              min={1} 
              className="form-input out-of-input"
              placeholder="Out of"
            />
          </div>
        </div>
        
        <div className="cam-group">
          <label>CAM 3</label>
          <div className="score-inputs">
            <input 
              name="cam3.score" 
              type="number" 
              value={form.cam3.score} 
              onChange={handleChange} 
              min={0} 
              className="form-input score-input"
              placeholder="Score"
            />
            <span className="score-separator">/</span>
            <input 
              name="cam3.outOf" 
              type="number" 
              value={form.cam3.outOf} 
              onChange={handleChange} 
              min={1} 
              className="form-input out-of-input"
              placeholder="Out of"
            />
          </div>
        </div>
      </div>
      
      <div className="form-group">
        <label>Average (%)</label>
        <input 
          name="average" 
          value={form.average} 
          readOnly 
          className="form-input average-input"
        />
      </div>
      
      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? 'Saving...' : 'Save Result'}
      </button>
      
      {selectedStudent && history.length > 0 && (
        <div className="history-section">
          <h4>📋 Exam Result History</h4>
          {loadingHistory ? <p>Loading history...</p> : (
            <div className="history-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Unit</th>
                    <th>CAM 1</th>
                    <th>CAM 2</th>
                    <th>CAM 3</th>
                    <th>Average</th>
                    <th>Changed By</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h._id}>
                      <td>{new Date(h.changedAt).toLocaleString()}</td>
                      <td>{h.unit}</td>
                      <td>{h.cam1?.score || 0}/{h.cam1?.outOf || 100}</td>
                      <td>{h.cam2?.score || 0}/{h.cam2?.outOf || 100}</td>
                      <td>{h.cam3?.score || 0}/{h.cam3?.outOf || 100}</td>
                      <td>{h.average}%</td>
                      <td>{h.changedBy ? `${h.changedBy.firstName} ${h.changedBy.lastName}` : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </form>
  );
};

export default CreateExamResultForm; 