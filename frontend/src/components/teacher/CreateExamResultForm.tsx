import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  course: string;
}

interface ExamResult {
  _id: string;
  studentId: string;
  unit: string;
  cam1: { score: number; outOf: number };
  cam2: { score: number; outOf: number };
  cam3: { score: number; outOf: number };
  average: number;
  createdAt: string;
}

const CreateExamResultForm: React.FC = () => {
  const { token } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [studentHistory, setStudentHistory] = useState<ExamResult[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    unit: '',
    cam1: { score: 0, outOf: 100 },
    cam2: { score: 0, outOf: 100 },
    cam3: { score: 0, outOf: 100 }
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.EXAM_RESULTS_STUDENTS}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setStudents(data);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    if (token) {
      fetchStudents();
    }
  }, [token]);

  useEffect(() => {
    if (selectedStudent) {
      const fetchStudentHistory = async () => {
        try {
          const response = await fetch(`${API_ENDPOINTS.EXAM_RESULTS_HISTORY}/${selectedStudent}`);
          if (response.ok) {
            const data = await response.json();
            setStudentHistory(data);
          }
        } catch (error) {
          console.error('Error fetching student history:', error);
        }
      };
      fetchStudentHistory();
    }
  }, [selectedStudent]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCamChange = (camNumber: number, field: 'score' | 'outOf', value: string) => {
    const numValue = parseFloat(value) || 0;
    setForm(prev => ({
      ...prev,
      [`cam${camNumber}`]: {
        ...prev[`cam${camNumber}` as keyof typeof prev] as { score: number; outOf: number },
        [field]: numValue
      }
    }));
  };

  const calculateAverage = () => {
    const cam1Percentage = form.cam1.outOf > 0 ? (form.cam1.score / form.cam1.outOf) * 100 : 0;
    const cam2Percentage = form.cam2.outOf > 0 ? (form.cam2.score / form.cam2.outOf) * 100 : 0;
    const cam3Percentage = form.cam3.outOf > 0 ? (form.cam3.score / form.cam3.outOf) * 100 : 0;
    
    const totalPercentage = cam1Percentage + cam2Percentage + cam3Percentage;
    const average = totalPercentage / 3;
    
    return Math.round(average * 100) / 100; // Round to 2 decimal places
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !form.unit) {
      setError('Please select a student and enter a unit/subject');
      return;
    }

    if (form.cam1.score > form.cam1.outOf || form.cam2.score > form.cam2.outOf || form.cam3.score > form.cam3.outOf) {
      setError('Score cannot be greater than the maximum score');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const average = calculateAverage();
      const examData = {
        student: selectedStudent,
        unit: form.unit,
        cam1: form.cam1,
        cam2: form.cam2,
        cam3: form.cam3,
        average: average
      };

      const response = await fetch(API_ENDPOINTS.EXAM_RESULTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(examData)
      });

      if (response.ok) {
        setSuccess('Exam result created successfully!');
        setForm({
          unit: '',
          cam1: { score: 0, outOf: 100 },
          cam2: { score: 0, outOf: 100 },
          cam3: { score: 0, outOf: 100 }
        });
        setSelectedStudent('');
        // Refresh student history
        if (selectedStudent) {
          const historyResponse = await fetch(`${API_ENDPOINTS.EXAM_RESULTS_HISTORY}/${selectedStudent}`);
          if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            setStudentHistory(historyData);
          }
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create exam result');
      }
    } catch (error) {
      setError('Error creating exam result');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedStudentData = students.find(s => s._id === selectedStudent);
  const average = calculateAverage();

  return (
    <div style={{ color: '#fff', padding: '1rem' }}>
      <h2>Create Exam Result</h2>
      
      {error && (
        <div style={{ background: '#dc2626', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ background: '#059669', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
          {success}
        </div>
      )}

      <div style={{ background: '#374151', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3>Exam Details</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Select Student:</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #4b5563', background: '#1f2937', color: '#fff' }}
              required
            >
              <option value="">Choose a student...</option>
              {students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.firstName} {student.lastName} - {student.course}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Unit/Subject:</label>
            <input
              type="text"
              name="unit"
              value={form.unit}
              onChange={handleInputChange}
              placeholder="e.g., Mathematics, Physics, etc."
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #4b5563', background: '#1f2937', color: '#fff' }}
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <h4>CAM 1</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Score:</label>
                <input
                  type="number"
                  value={form.cam1.score}
                  onChange={(e) => handleCamChange(1, 'score', e.target.value)}
                  min="0"
                  max={form.cam1.outOf}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #4b5563', background: '#1f2937', color: '#fff' }}
                  required
                />
              </div>
              <div>
                <label>Out of:</label>
                <input
                  type="number"
                  value={form.cam1.outOf}
                  onChange={(e) => handleCamChange(1, 'outOf', e.target.value)}
                  min="1"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #4b5563', background: '#1f2937', color: '#fff' }}
                  required
                />
              </div>
            </div>
            <small style={{ color: '#9ca3af' }}>
              Percentage: {form.cam1.outOf > 0 ? ((form.cam1.score / form.cam1.outOf) * 100).toFixed(1) : 0}%
            </small>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <h4>CAM 2</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Score:</label>
                <input
                  type="number"
                  value={form.cam2.score}
                  onChange={(e) => handleCamChange(2, 'score', e.target.value)}
                  min="0"
                  max={form.cam2.outOf}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #4b5563', background: '#1f2937', color: '#fff' }}
                  required
                />
              </div>
              <div>
                <label>Out of:</label>
                <input
                  type="number"
                  value={form.cam2.outOf}
                  onChange={(e) => handleCamChange(2, 'outOf', e.target.value)}
                  min="1"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #4b5563', background: '#1f2937', color: '#fff' }}
                  required
                />
              </div>
            </div>
            <small style={{ color: '#9ca3af' }}>
              Percentage: {form.cam2.outOf > 0 ? ((form.cam2.score / form.cam2.outOf) * 100).toFixed(1) : 0}%
            </small>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <h4>CAM 3</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Score:</label>
                <input
                  type="number"
                  value={form.cam3.score}
                  onChange={(e) => handleCamChange(3, 'score', e.target.value)}
                  min="0"
                  max={form.cam3.outOf}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #4b5563', background: '#1f2937', color: '#fff' }}
                  required
                />
              </div>
              <div>
                <label>Out of:</label>
                <input
                  type="number"
                  value={form.cam3.outOf}
                  onChange={(e) => handleCamChange(3, 'outOf', e.target.value)}
                  min="1"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #4b5563', background: '#1f2937', color: '#fff' }}
                  required
                />
              </div>
            </div>
            <small style={{ color: '#9ca3af' }}>
              Percentage: {form.cam3.outOf > 0 ? ((form.cam3.score / form.cam3.outOf) * 100).toFixed(1) : 0}%
            </small>
          </div>

          <div style={{ 
            background: '#1e3a8a', 
            padding: '1rem', 
            borderRadius: '6px', 
            marginBottom: '1rem',
            border: '1px solid #3b82f6'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#93c5fd' }}>Calculated Average</h4>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#fbbf24' }}>
              {average.toFixed(1)}%
            </p>
            <small style={{ color: '#93c5fd' }}>
              Based on average of all three CAM percentages
            </small>
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedStudent || !form.unit}
            style={{
              background: submitting || !selectedStudent || !form.unit ? '#6b7280' : '#3b82f6',
              color: '#fff',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              cursor: submitting || !selectedStudent || !form.unit ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              width: '100%'
            }}
          >
            {submitting ? 'Creating Exam Result...' : 'Create Exam Result'}
          </button>
        </form>
      </div>

      {selectedStudentData && (
        <div style={{ background: '#374151', padding: '1.5rem', borderRadius: '8px' }}>
          <h3>Exam History for {selectedStudentData.firstName} {selectedStudentData.lastName}</h3>
          {studentHistory.length === 0 ? (
            <p>No exam results found for this student.</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {studentHistory.map((result) => (
                <div key={result._id} style={{ background: '#4b5563', padding: '1rem', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0 }}>{result.unit}</h4>
                    <span style={{ 
                      background: result.average >= 70 ? '#059669' : result.average >= 50 ? '#d97706' : '#dc2626',
                      color: '#fff',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.875rem'
                    }}>
                      {result.average.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <div>CAM 1: {result.cam1.score}/{result.cam1.outOf}</div>
                    <div>CAM 2: {result.cam2.score}/{result.cam2.outOf}</div>
                    <div>CAM 3: {result.cam3.score}/{result.cam3.outOf}</div>
                  </div>
                  <small style={{ color: '#9ca3af' }}>
                    {new Date(result.createdAt).toLocaleDateString()}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateExamResultForm; 