import mongoose from 'mongoose';

const penaltiesSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        penaltyType: {
            type: String,
            required: true,
        },
        penaltyDescription: {
            type: String,
            required: true,
        },
        penaltyDate: {
            type: Date,
            required: true,
        },
        penaltyAmount: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false, // Ensure versionKey is set to false
    }
);
const Penalty = mongoose.model('Penalty', penaltiesSchema);
export default Penalty;