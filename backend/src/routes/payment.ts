import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// M-Pesa payment initiation
router.post('/mpesa/initiate', authenticate, async (req: AuthRequest, res) => {
  try {
    const { amount, phone, reference, description } = req.body;
    
    if (!amount || !phone || !reference) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount, phone number, and reference are required' 
      });
    }

    // Mock M-Pesa API call (replace with actual M-Pesa API integration)
    const mpesaResponse = {
      success: true,
      checkoutRequestID: `ws_CO_${Date.now()}`,
      merchantRequestID: `29115-34620561-${Date.now()}`,
      responseCode: '0',
      responseDescription: 'Success. Request accepted for processing',
      customerMessage: 'Success. Request accepted for processing'
    };

    // In a real implementation, you would:
    // 1. Call M-Pesa STK Push API
    // 2. Store the request in database
    // 3. Handle the callback when payment is completed

    res.json({
      success: true,
      message: 'Payment initiated successfully',
      checkoutRequestID: mpesaResponse.checkoutRequestID,
      customerMessage: mpesaResponse.customerMessage
    });

  } catch (error) {
    console.error('M-Pesa payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Payment initiation failed' 
    });
  }
});

// M-Pesa payment callback (webhook)
router.post('/mpesa/callback', async (req, res) => {
  try {
    const { 
      ResultCode, 
      ResultDesc, 
      CheckoutRequestID, 
      Amount, 
      MpesaReceiptNumber,
      TransactionDate 
    } = req.body;

    // Process the payment result
    if (ResultCode === '0') {
      // Payment successful
      
      // Update database with payment confirmation
      // Update upskill enrollment status
      // Send confirmation email

      res.json({ success: true, message: 'Payment processed successfully' });
    } else {
      // Payment failed
      res.json({ success: false, message: 'Payment failed' });
    }

  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(500).json({ success: false, message: 'Callback processing failed' });
  }
});

// Get payment status
router.get('/status/:checkoutRequestID', authenticate, async (req: AuthRequest, res) => {
  try {
    const { checkoutRequestID } = req.params;

    // In a real implementation, check payment status from database or M-Pesa API
    const paymentStatus = {
      status: 'pending', // pending, completed, failed
      amount: 0,
      receiptNumber: null,
      transactionDate: null
    };

    res.json(paymentStatus);

  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ message: 'Failed to get payment status' });
  }
});

export default router; 