import React, { useState, useEffect } from 'react';

interface Props {
  editingTeacher: boolean;
}

const TeacherForm: React.FC<Props> = ({ editingTeacher }) => {
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Replace this with your actual logic
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSuccess(editingTeacher ? 'Teacher updated successfully!' : 'Teacher enrolled successfully!');
    } catch (err) {
      setError('Failed to submit the form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: 'auto' }}>
      <h2>{editingTeacher ? 'Edit Teacher' : 'Enroll Teacher'}</h2>

      {success && (
        <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px', borderRadius: '6px', marginBottom: '1rem' }}>
          ✅ {success}
        </div>
      )}
      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '6px', marginBottom: '1rem' }}>
          ❌ {error}
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <label>Full Name</label>
        <input 
          type="text" 
          required 
          placeholder="Enter teacher's name" 
          style={{ 
            width: '100%', 
            padding: '10px', 
            border: '1px solid #ccc', 
            borderRadius: '6px', 
            marginTop: '4px' 
          }} 
        />
      </div>

      <button 
        type="submit"
        style={{
          padding: '0.75rem 1.5rem',
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        {submitting && (
          <span 
            style={{
              width: '18px',
              height: '18px',
              border: '2px solid #fff',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
        )}
        {submitting
          ? (editingTeacher ? 'Updating...' : 'Submitting...')
          : (editingTeacher ? 'Update Teacher' : 'Enroll Teacher')
        }
      </button>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
};

export default TeacherForm;
