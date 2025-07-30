import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';

interface StudentFee {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    course: string;
  };
  academicYear: number;
  semester: string;
  course: string;
  totalFee: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
  isPaid: boolean;
  dueDate: string;
  paymentHistory: Array<{
    amount: number;
    date: string;
    paidBy: string;
  }>;
}

const StudentFeeManagement: React.FC = () => {
  const { user } = useAuth();
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    feeId: '',
    paidAmount: 0,
    paidBy: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }
      const response = await fetch(API_ENDPOINTS.STUDENT_FEE, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFees(data);
      }
    } catch (error) {
      setError('Failed to fetch student fees');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }
      const response = await fetch(`${API_ENDPOINTS.STUDENT_FEE}/${paymentForm.feeId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentForm)
      });

      if (response.ok) {
        setSuccess('Payment recorded successfully');
        setPaymentForm({
          feeId: '',
          paidAmount: 0,
          paidBy: '',
        });
        fetchFees();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to record payment');
      }
    } catch (error) {
      setError('Failed to record payment');
    }
  };

  const handlePaymentClick = (fee: StudentFee) => {
    setPaymentForm({
      feeId: fee._id,
      paidAmount: 0,
      paidBy: user?.firstName + ' ' + user?.lastName || '',
    });
  };

  return (
    <div className="card">
      <h2>Student Fee Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Payment Form */}
      {paymentForm.feeId && (
        <div className="payment-form">
          <h3>Record Payment</h3>
          <form onSubmit={handlePaymentSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label>Amount Paid:</label>
                <input
                  type="number"
                  value={paymentForm.paidAmount}
                  onChange={(e) => setPaymentForm({...paymentForm, paidAmount: parseInt(e.target.value)})}
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Paid By:</label>
                <input
                  type="text"
                  value={paymentForm.paidBy}
                  onChange={(e) => setPaymentForm({...paymentForm, paidBy: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Record Payment</button>
              <button 
                type="button" 
                onClick={() => setPaymentForm({feeId: '', paidAmount: 0, paidBy: ''})} 
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <h3>Student Fees</h3>
        {loading ? (
          <div className="loading">Loading student fees...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Course</th>
                <th>Year</th>
                <th>Semester</th>
                <th>Total Fee</th>
                <th>Paid</th>
                <th>Remaining</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fees.map(fee => (
                <tr key={fee._id}>
                  <td>{fee.student.firstName} {fee.student.lastName}</td>
                  <td>{fee.course}</td>
                  <td>{fee.academicYear}</td>
                  <td>{fee.semester}</td>
                  <td>{fee.totalFee.toLocaleString()} {fee.currency}</td>
                  <td>{fee.paidAmount.toLocaleString()} {fee.currency}</td>
                  <td>{fee.remainingAmount.toLocaleString()} {fee.currency}</td>
                  <td>
                    <span className={`status ${fee.isPaid ? 'paid' : fee.remainingAmount > 0 ? 'partial' : 'unpaid'}`}>
                      {fee.isPaid ? 'Paid' : fee.remainingAmount > 0 ? 'Partial' : 'Unpaid'}
                    </span>
                  </td>
                  <td>{new Date(fee.dueDate).toLocaleDateString()}</td>
                  <td>
                    {!fee.isPaid && (
                      <button onClick={() => handlePaymentClick(fee)} className="btn-primary">
                        Record Payment
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        // Show payment history
                        alert(`Payment History:\n${fee.paymentHistory.map(p => 
                          `${p.amount} ${fee.currency} on ${new Date(p.date).toLocaleDateString()} by ${p.paidBy}`
                        ).join('\n')}`);
                      }} 
                      className="btn-secondary"
                    >
                      History
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

export default StudentFeeManagement; 