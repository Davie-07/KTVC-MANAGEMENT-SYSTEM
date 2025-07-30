import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';

interface AcademicCalendar {
  _id: string;
  year: number;
  semester: string;
  startDate: string;
  endDate: string;
  feeAmount: number;
  currency: string;
  isActive: boolean;
}

const AcademicCalendarManagement: React.FC = () => {
  const { token } = useAuth();
  const [calendars, setCalendars] = useState<AcademicCalendar[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    semester: 'Term 1',
    startDate: '',
    endDate: '',
    feeAmount: 0,
    currency: 'KSH',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.ACADEMIC_CALENDAR, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setCalendars(data);
        }
      } catch (error) {
        console.error('Error fetching calendars:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchCalendars();
    }
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'feeAmount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      const url = editingId 
        ? `${API_ENDPOINTS.ACADEMIC_CALENDAR}/${editingId}`
        : API_ENDPOINTS.ACADEMIC_CALENDAR;
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const saved = await response.json();
        if (editingId) {
          setCalendars(prev => prev.map(c => c._id === editingId ? saved : c));
        } else {
          setCalendars(prev => [...prev, saved]);
        }
        setFormData({
          year: new Date().getFullYear(),
          semester: 'Term 1',
          startDate: '',
          endDate: '',
          feeAmount: 0,
          currency: 'KSH',
        });
        setEditingId(null);
        setSuccess(editingId ? 'Calendar updated successfully!' : 'Calendar created successfully!');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save calendar');
      }
    } catch (error) {
      setError('Error saving calendar');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (calendar: AcademicCalendar) => {
    setFormData({
      year: calendar.year,
      semester: calendar.semester,
      startDate: calendar.startDate.split('T')[0],
      endDate: calendar.endDate.split('T')[0],
      feeAmount: calendar.feeAmount,
      currency: calendar.currency,
    });
    setEditingId(calendar._id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this calendar?')) return;
    
    try {
      const response = await fetch(`${API_ENDPOINTS.ACADEMIC_CALENDAR}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setCalendars(prev => prev.filter(c => c._id !== id));
        setSuccess('Calendar deleted successfully!');
      } else {
        setError('Failed to delete calendar');
      }
    } catch (error) {
      setError('Error deleting calendar');
      console.error('Error:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      year: new Date().getFullYear(),
      semester: 'Term 1',
      startDate: '',
      endDate: '',
      feeAmount: 0,
      currency: 'KSH',
    });
    setEditingId(null);
    setError(null);
    setSuccess(null);
  };

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', padding: '2rem' }}>Loading calendars...</div>;
  }

  return (
    <div style={{ color: '#fff', padding: '1rem' }}>
      <h2>Academic Calendar Management</h2>
      
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
        <h3>{editingId ? 'Edit Calendar' : 'Create New Calendar'}</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label>Year:</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #4b5563', background: '#1f2937', color: '#fff' }}
                required
              />
            </div>
            <div>
              <label>Semester:</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #4b5563', background: '#1f2937', color: '#fff' }}
                required
              >
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
                <option value="Holiday">Holiday</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label>Start Date:</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #4b5563', background: '#1f2937', color: '#fff' }}
                required
              />
            </div>
            <div>
              <label>End Date:</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #4b5563', background: '#1f2937', color: '#fff' }}
                required
              />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label>Fee Amount:</label>
              <input
                type="number"
                name="feeAmount"
                value={formData.feeAmount}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #4b5563', background: '#1f2937', color: '#fff' }}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label>Currency:</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #4b5563', background: '#1f2937', color: '#fff' }}
                required
              >
                <option value="KSH">KSH</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: submitting ? '#6b7280' : '#3b82f6',
                color: '#fff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: 600
              }}
            >
              {submitting ? 'Saving...' : (editingId ? 'Update Calendar' : 'Create Calendar')}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  background: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div>
        <h3>Academic Calendars</h3>
        {calendars.length === 0 ? (
          <p>No calendars found. Create one above.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {calendars.map(calendar => (
              <div
                key={calendar._id}
                style={{
                  background: '#374151',
                  padding: '1rem',
                  borderRadius: '6px',
                  border: calendar.isActive ? '2px solid #059669' : '1px solid #4b5563'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0 }}>
                    {calendar.year} - {calendar.semester}
                    {calendar.isActive && (
                      <span style={{ background: '#059669', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                        Active
                      </span>
                    )}
                  </h4>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleEdit(calendar)}
                      style={{
                        background: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(calendar._id)}
                      style={{
                        background: '#dc2626',
                        color: '#fff',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p style={{ margin: '0.5rem 0', color: '#d1d5db' }}>
                  <strong>Period:</strong> {new Date(calendar.startDate).toLocaleDateString()} - {new Date(calendar.endDate).toLocaleDateString()}
                </p>
                <p style={{ margin: '0.5rem 0', color: '#d1d5db' }}>
                  <strong>Fee:</strong> {calendar.feeAmount} {calendar.currency}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicCalendarManagement;