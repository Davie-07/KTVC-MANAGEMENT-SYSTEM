import React, { useState, useEffect } from 'react';

interface AcademicFee {
  _id: string;
  course: string;
  feeAmount: number;
  currency: string;
  isActive: boolean;
}

const AcademicFeeManagement: React.FC = () => {
  const [fees, setFees] = useState<AcademicFee[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    course: '',
    feeAmount: 0,
    currency: 'KSH',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/academic-fee', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFees(data);
      }
    } catch (error) {
      setError('Failed to fetch academic fees');
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
        ? `http://localhost:5000/api/academic-fee/${editingId}`
        : 'http://localhost:5000/api/academic-fee';
      
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
        setSuccess(editingId ? 'Academic fee updated successfully' : 'Academic fee created successfully');
        setFormData({
          course: '',
          feeAmount: 0,
          currency: 'KSH',
        });
        setEditingId(null);
        fetchFees();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save academic fee');
      }
    } catch (error) {
      setError('Failed to save academic fee');
    }
  };

  const handleEdit = (fee: AcademicFee) => {
    setFormData({
      course: fee.course,
      feeAmount: fee.feeAmount,
      currency: fee.currency,
    });
    setEditingId(fee._id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this academic fee?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/academic-fee/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setSuccess('Academic fee deleted successfully');
        fetchFees();
      } else {
        setError('Failed to delete academic fee');
      }
    } catch (error) {
      setError('Failed to delete academic fee');
    }
  };

  const handleCancel = () => {
    setFormData({
      course: '',
      feeAmount: 0,
      currency: 'KSH',
    });
    setEditingId(null);
    setError(null);
  };

  return (
    <div className="card">
      <h2>Academic Fee Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <div className="form-group">
            <label>Course:</label>
            <input
              type="text"
              value={formData.course}
              onChange={(e) => setFormData({...formData, course: e.target.value})}
              placeholder="e.g., ICT, Business, Engineering"
              required
            />
          </div>
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
            {editingId ? 'Update Fee' : 'Create Fee'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancel} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="table-container">
        <h3>Academic Fees</h3>
        {loading ? (
          <div className="loading">Loading fees...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Fee Amount</th>
                <th>Currency</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fees.map(fee => (
                <tr key={fee._id}>
                  <td>{fee.course}</td>
                  <td>{fee.feeAmount.toLocaleString()}</td>
                  <td>{fee.currency}</td>
                  <td>
                    <span className={`status ${fee.isActive ? 'active' : 'inactive'}`}>
                      {fee.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleEdit(fee)} className="btn-edit">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(fee._id)} className="btn-delete">
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

export default AcademicFeeManagement; 