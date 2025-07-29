import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

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
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filterRole, setFilterRole] = useState<'all' | 'student' | 'teacher'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkAction, setBulkAction] = useState<'activate' | 'deactivate' | 'delete'>('activate');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const [studentsResponse, teachersResponse] = await Promise.all([
        fetch('http://localhost:5000/api/auth/students', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/auth/teachers', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const students = await studentsResponse.json();
      const teachers = await teachersResponse.json();

      const allUsers = [
        ...(Array.isArray(students) ? students.map((s: any) => ({ ...s, role: 'student', isActive: true })) : []),
        ...(Array.isArray(teachers) ? teachers.map((t: any) => ({ ...t, role: 'teacher', isActive: true })) : [])
      ];

      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const executeBulkAction = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select users to perform bulk action');
      return;
    }

    if (bulkAction === 'delete' && !confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)?`)) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/bulk-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          action: bulkAction
        })
      });

      if (response.ok) {
        alert(`Bulk action '${bulkAction}' completed successfully`);
        setSelectedUsers([]);
        fetchUsers(); // Refresh the list
      } else {
        throw new Error('Bulk action failed');
      }
    } catch (error) {
      console.error('Error executing bulk action:', error);
      alert('Failed to execute bulk action');
    } finally {
      setProcessing(false);
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
            onClick={executeBulkAction}
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