import React, { useState, useEffect } from 'react';

interface Upskill {
  _id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const UpskillManagement: React.FC = () => {
  const [upskills, setUpskills] = useState<Upskill[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    currency: 'KSH',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUpskills();
  }, []);

  const fetchUpskills = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/upskill', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUpskills(data);
      }
    } catch (error) {
      setError('Failed to fetch upskills');
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
        ? `http://localhost:5000/api/upskill/${editingId}`
        : 'http://localhost:5000/api/upskill';
      
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
        setSuccess(editingId ? 'Upskill updated successfully' : 'Upskill created successfully');
        setFormData({
          title: '',
          description: '',
          price: 0,
          currency: 'KSH',
        });
        setEditingId(null);
        fetchUpskills();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save upskill');
      }
    } catch (error) {
      setError('Failed to save upskill');
    }
  };

  const handleEdit = (upskill: Upskill) => {
    setFormData({
      title: upskill.title,
      description: upskill.description,
      price: upskill.price,
      currency: upskill.currency,
    });
    setEditingId(upskill._id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this upskill?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/upskill/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setSuccess('Upskill deleted successfully');
        fetchUpskills();
      } else {
        setError('Failed to delete upskill');
      }
    } catch (error) {
      setError('Failed to delete upskill');
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      price: 0,
      currency: 'KSH',
    });
    setEditingId(null);
    setError(null);
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`http://localhost:5000/api/upskill/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        setSuccess(`Upskill ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchUpskills();
      } else {
        setError('Failed to update upskill status');
      }
    } catch (error) {
      setError('Failed to update upskill status');
    }
  };

  return (
    <div className="card">
      <h2>Upskill Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <div className="form-group">
            <label>Upskill Title:</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Advanced Web Development"
              required
            />
          </div>
          <div className="form-group">
            <label>Price:</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
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

        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Describe the upskill course, its benefits, and what students will learn..."
            rows={4}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {editingId ? 'Update Upskill' : 'Create Upskill'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancel} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="table-container">
        <h3>Upskill Courses</h3>
        {loading ? (
          <div className="loading">Loading upskills...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Price</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {upskills.map(upskill => (
                <tr key={upskill._id}>
                  <td>{upskill.title}</td>
                  <td>
                    <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {upskill.description}
                    </div>
                  </td>
                  <td>{upskill.price.toLocaleString()} {upskill.currency}</td>
                  <td>
                    <span className={`status ${upskill.isActive ? 'active' : 'inactive'}`}>
                      {upskill.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(upskill.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleEdit(upskill)} className="btn-edit">
                      Edit
                    </button>
                    <button 
                      onClick={() => toggleActive(upskill._id, upskill.isActive)} 
                      className={`btn-${upskill.isActive ? 'deactivate' : 'activate'}`}
                    >
                      {upskill.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleDelete(upskill._id)} className="btn-delete">
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

export default UpskillManagement; 