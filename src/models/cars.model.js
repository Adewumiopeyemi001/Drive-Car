
export const carSchema = {
  name: String,
  year: Number,
  manufacturer: String,
  images: [String],
  number_of_days: Number,
  amount_per_day: Number,
  userId: String, // Add userId field
  isBooked: Boolean,
};
