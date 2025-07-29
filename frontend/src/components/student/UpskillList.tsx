import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface Upskill {
  _id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  isActive: boolean;
}

const UpskillList: React.FC = () => {
  const { user } = useAuth();
  const [upskills, setUpskills] = useState<Upskill[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUpskills();
  }, []);

  const fetchUpskills = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/upskill/user/${user?.id}`, {
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

  const handleEnroll = async (upskill: Upskill) => {
    if (!window.confirm(`Are you sure you want to enroll in "${upskill.title}" for ${upskill.price} ${upskill.currency}?`)) {
      return;
    }

    setEnrollingId(upskill._id);
    setError(null);
    setSuccess(null);

    try {
      // Initialize payment
      const response = await fetch('http://localhost:5000/api/upskill/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          upskillId: upskill._id,
          userId: user?.id,
          amount: upskill.price,
          currency: upskill.currency
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Initialize M-Pesa payment
        if (data.paymentUrl) {
          // Redirect to M-Pesa payment
          window.open(data.paymentUrl, '_blank');
          setSuccess('Payment initiated. Please complete the payment in the new window.');
        } else {
          setSuccess('Enrollment successful!');
        }
        
        // Mark as seen
        await fetch(`http://localhost:5000/api/upskill/${upskill._id}/seen`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        fetchUpskills();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to enroll');
      }
    } catch (error) {
      setError('Failed to enroll in upskill');
    } finally {
      setEnrollingId(null);
    }
  };

  const initiateMpesaPayment = async (upskill: Upskill) => {
    try {
      const response = await fetch('http://localhost:5000/api/payment/mpesa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: upskill.price,
          phone: (user as any)?.phone || '',
          reference: `UPSKILL_${upskill._id}_${user?.id}`,
          description: `Enrollment in ${upskill.title}`
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuccess('M-Pesa payment initiated. Please check your phone for the payment prompt.');
        } else {
          setError(data.message || 'Payment initiation failed');
        }
      } else {
        setError('Payment initiation failed');
      }
    } catch (error) {
      setError('Payment initiation failed');
    }
  };

  return (
    <div className="card">
      <h2>Upskill Opportunities</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {loading ? (
        <div className="loading">Loading upskill opportunities...</div>
      ) : upskills.length === 0 ? (
        <div className="no-data">No upskill opportunities available at the moment.</div>
      ) : (
        <div className="upskill-grid">
          {upskills.map(upskill => (
            <div key={upskill._id} className="upskill-card">
              <div className="upskill-header">
                <h3>{upskill.title}</h3>
                <div className="upskill-price">
                  {upskill.price.toLocaleString()} {upskill.currency}
                </div>
              </div>
              
              <div className="upskill-description">
                {upskill.description}
              </div>
              
              <div className="upskill-actions">
                {upskill.price > 0 ? (
                  <button 
                    onClick={() => initiateMpesaPayment(upskill)}
                    className="btn-primary"
                    disabled={enrollingId === upskill._id}
                  >
                    {enrollingId === upskill._id ? 'Processing...' : 'Pay & Enroll'}
                  </button>
                ) : (
                  <button 
                    onClick={() => handleEnroll(upskill)}
                    className="btn-secondary"
                    disabled={enrollingId === upskill._id}
                  >
                    {enrollingId === upskill._id ? 'Enrolling...' : 'Enroll Free'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpskillList; 