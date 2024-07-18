export const paymentSchema = {
  id: String,
  userId: String,
  carId: Number,
  bookingId: Number,
  amount: Number,
  bookingReference: String,
  paymentReference: String,
  status: String,
  createdAt: Date,
  updatedAt: Date,
};
