import mongoose, { Schema, Document } from 'mongoose';

export interface IBloodRequest extends Document {
    requesterId: mongoose.Types.ObjectId;
    patientName: string;
    bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    hospital: string;
    age: number;
    phone: string;
    location: {
        type: string;
        coordinates: number[];
        address?: string;
    };
    urgency: 'critical' | 'moderate' | 'low';
    status: 'active' | 'fulfilled' | 'cancelled';
    donors: mongoose.Types.ObjectId[]; // List of users who offered help
    createdAt: Date;
    updatedAt: Date;
}

const BloodRequestSchema: Schema = new Schema({
    requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    patientName: { type: String, required: true },
    bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required: true
    },
    hospital: { type: String, required: true },
    age: { type: Number, required: true },
    phone: { type: String, required: true },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
        address: { type: String }
    },
    urgency: {
        type: String,
        enum: ['critical', 'moderate', 'low'],
        default: 'critical'
    },
    status: {
        type: String,
        enum: ['active', 'fulfilled', 'cancelled'],
        default: 'active'
    },
    donors: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

BloodRequestSchema.index({ location: '2dsphere' });

export default mongoose.model<IBloodRequest>('BloodRequest', BloodRequestSchema);
