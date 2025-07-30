import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  course?: string;
  level?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filterRole, setFilterRole] = useState<'all' | 'student' | 'teacher'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkAction, setBulkAction] = useState<'activate' | 'deactivate' | 'delete'>('activate');
  const [processing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    Promise.all([
      fetch(API_ENDPOINTS.STUDENTS, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(API_ENDPOINTS.TEACHERS, { headers: { Authorization: `Bearer ${token}` } })
    ])
      .then(responses => Promise.all(responses.map(res => res.json())))
      .then(([studentsData, teachersData]) => {
        setUsers([
          ...(Array.isArray(studentsData) ? studentsData.map((s: any) => ({ ...s, role: 'student', isActive: true })) : []),
          ...(Array.isArray(teachersData) ? teachersData.map((t: any) => ({ ...t, role: 'teacher', isActive: true })) : [])
        ]);
      })
      .catch(err => console.error('Error fetching users:', err));
  }, [token]);

  // Auto-dismiss success/error after 4 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleBulkAction = async (action: string, userIds: string[]) => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH_BULK_ACTION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, userIds })
      });

      if (response.ok) {
        setSuccess(`Bulk action '${action}' completed successfully!`);
        Promise.all([
          fetch(API_ENDPOINTS.STUDENTS, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(API_ENDPOINTS.TEACHERS, { headers: { Authorization: `Bearer ${token}` } })
        ])
          .then(responses => Promise.all(responses.map(res => res.json())))
          .then(([studentsData, teachersData]) => {
            setUsers([
              ...(Array.isArray(studentsData) ? studentsData.map((s: any) => ({ ...s, role: 'student', isActive: true })) : []),
              ...(Array.isArray(teachersData) ? teachersData.map((t: any) => ({ ...t, role: 'teacher', isActive: true })) : [])
            ]);
          });
      } else {
        setError('Failed to perform bulk action');
      }
    } catch (error) {
      setError('Error performing bulk action');
      console.error('Error:', error);
    }
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? '#ef4444' : role === 'teacher' ? '#3b82f6' : '#10b981';
  };

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', padding: '2rem' }}>Loading users...</div>;
  }

  return (
    <div style={{ color: '#fff' }}>
      <h2 style={{ marginBottom: '2rem', fontSize: '1.8rem' }}>👥 User Management</h2>

      {/* Success/Error Messages */}
      {success && (
        <div style={{ background: '#064e3b', color: '#10b981', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
          ✅ {success}
        </div>
      )}
      {error && (
        <div style={{ background: '#7f1d1d', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
          ❌ {error}
        </div>
      )}

      {/* Filters and Search */}
      <div style={{
        background: '#23232b',
        borderRadius: 12,
        padding: '1.5rem',
        marginBottom: '2rem',
        border: '1px solid #374151'
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            style={{
              background: '#374151',
              color: '#fff',
              border: '1px solid #4b5563',
              borderRadius: '8px',
              padding: '0.5rem',
              fontSize: '0.875rem'
            }}
          >
            <option value="all">All Users</option>
            <option value="student">Students Only</option>
            <option value="teacher">Teachers Only</option>
          </select>

          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: '#374151',
              color: '#fff',
              border: '1px solid #4b5563',
              borderRadius: '8px',
              padding: '0.5rem',
              fontSize: '0.875rem',
              minWidth: '200px'
            }}
          />
        </div>

        {/* Bulk Actions */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
            {selectedUsers.length} user(s) selected
          </span>

          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value as any)}
            style={{
              background: '#374151',
              color: '#fff',
              border: '1px solid #4b5563',
              borderRadius: '8px',
              padding: '0.5rem',
              fontSize: '0.875rem'
            }}
          >
            <option value="activate">Activate</option>
            <option value="deactivate">Deactivate</option>
            <option value="delete">Delete</option>
          </select>

          <button
            onClick={() => handleBulkAction(bulkAction, selectedUsers)}
            disabled={selectedUsers.length === 0 || processing}
            style={{
              background: selectedUsers.length === 0 || processing ? '#6b7280' : '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              cursor: selectedUsers.length === 0 || processing ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem'
            }}
          >
            {processing ? '⏳ Processing...' : `Execute ${bulkAction}`}
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        background: '#23232b',
        borderRadius: 12,
        padding: '1.5rem',
        border: '1px solid #374151',
        overflowX: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #374151' }}>
              <th style={{ padding: '1rem', textAlign: 'left' }}>
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Course</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id} style={{ borderBottom: '1px solid #374151' }}>
                <td style={{ padding: '1rem' }}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={(e) => handleSelectUser(user._id, e.target.checked)}
                  />
                </td>
                <td style={{ padding: '1rem' }}>
                  {user.firstName} {user.lastName}
                </td>
                <td style={{ padding: '1rem' }}>{user.email}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    background: getRoleColor(user.role),
                    color: '#fff',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  {user.course || '-'}
                  {user.level && ` (Level ${user.level})`}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    background: user.isActive ? '#10b981' : '#ef4444',
                    color: '#fff',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                  }}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#9ca3af' }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
            No users found matching your criteria
          </div>
        )}
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#9ca3af' }}>
        Total users: {filteredUsers.length} | Selected: {selectedUsers.length}
      </div>
    </div>
  );
};

export default UserManagement;
