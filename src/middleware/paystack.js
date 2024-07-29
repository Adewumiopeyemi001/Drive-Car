import paystack from 'paystack-api';
import dotenv from 'dotenv';

dotenv.config();

const paystackClient = paystack(process.env.PAYSTACK_SECRET_KEY);

// Function to initialize payment
const initializePayment = async (email, amount, reference) => {
  try {
    const response = await paystackClient.transaction.initialize({
      email,
      amount: amount * 100, // Paystack expects amount in kobo
      reference,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to verify payment
const verifyPayment = async (reference) => {
  console.log('Verifying payment with reference:', reference);

  if (!reference) {
    throw new Error('Payment reference is required');
  }

  try {
    const response = await paystackClient.transaction.verify({
      reference,
    });

    console.log('Paystack response:', response);

    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw new Error('Internal server error');
  }
};

export { initializePayment, verifyPayment };
