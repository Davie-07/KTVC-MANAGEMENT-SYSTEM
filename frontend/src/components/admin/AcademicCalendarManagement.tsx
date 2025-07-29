import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

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
  const { user } = useAuth();
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

  useEffect(() => {
    fetchCalendars();
  }, []);

  const fetchCalendars = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/academic-calendar', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCalendars(data);
      }
    } catch (error) {
      setError('Failed to fetch academic calendars');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const url = editingId 
        ? `http://localhost:5000/api/academic-calendar/${editingId}`
        : 'http://localhost:5000/api/academic-calendar';
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(editingId ? 'Academic calendar updated successfully' : 'Academic calendar created successfully');
        setFormData({
          year: new Date().getFullYear(),
          semester: 'Term 1',
          startDate: '',
          endDate: '',
          feeAmount: 0,
          currency: 'KSH',
        });
        setEditingId(null);
        fetchCalendars();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save academic calendar');
      }
    } catch (error) {
      setError('Failed to save academic calendar');
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
    if (!window.confirm('Are you sure you want to delete this academic calendar?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/academic-calendar/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setSuccess('Academic calendar deleted successfully');
        fetchCalendars();
      } else {
        setError('Failed to delete academic calendar');
      }
    } catch (error) {
      setError('Failed to delete academic calendar');
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
  };

  return (
    <div className="card">
      <h2>Academic Calendar Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <div className="form-group">
            <label>Year:</label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
              min={new Date().getFullYear()}
              required
            />
          </div>
          <div className="form-group">
            <label>Semester:</label>
            <select
              value={formData.semester}
              onChange={(e) => setFormData({...formData, semester: e.target.value})}
              required
            >
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date:</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>End Date:</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Fee Amount:</label>
            <input
              type="number"
              value={formData.feeAmount}
              onChange={(e) => setFormData({...formData, feeAmount: parseInt(e.target.value)})}
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label>Currency:</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({...formData, currency: e.target.value})}
            >
              <option value="KSH">KSH</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {editingId ? 'Update Calendar' : 'Create Calendar'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancel} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="table-container">
        <h3>Academic Calendars</h3>
        {loading ? (
          <div className="loading">Loading calendars...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Semester</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Fee Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {calendars.map(calendar => (
                <tr key={calendar._id}>
                  <td>{calendar.year}</td>
                  <td>{calendar.semester}</td>
                  <td>{new Date(calendar.startDate).toLocaleDateString()}</td>
                  <td>{new Date(calendar.endDate).toLocaleDateString()}</td>
                  <td>{calendar.feeAmount} {calendar.currency}</td>
                  <td>
                    <span className={`status ${calendar.isActive ? 'active' : 'inactive'}`}>
                      {calendar.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleEdit(calendar)} className="btn-edit">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(calendar._id)} className="btn-delete">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AcademicCalendarManagement; 