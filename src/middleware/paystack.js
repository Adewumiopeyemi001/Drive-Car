import paystack from 'paystack-api';
import dotenv from 'dotenv';

dotenv.config();

const paystackClient = paystack(process.env.PAYSTACK_SECRET_KEY);

// Function to initialize payment
const initializePayment = async (email, amount, bookingReference) => {
  try {
    const response = await paystackClient.transaction.initialize({
      email,
      amount: amount * 100, // Paystack expects amount in kobo
      reference: bookingReference,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to verify payment
const verifyPayment = async (reference) => {
  try {
    const response = await paystackClient.transaction.verify({ reference });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { initializePayment, verifyPayment };
