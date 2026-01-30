import mongoose, { Schema, Document } from 'mongoose';

export interface IEmergency extends Document {
    patientId: mongoose.Types.ObjectId;
    type: 'ambulance' | 'police' | 'fire' | 'general';
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'assigned' | 'resolved' | 'cancelled';
    location: {
        type: string;
        coordinates: number[];
        address?: string;
    };
    assignedAmbulanceId?: mongoose.Types.ObjectId;
    assignedHospitalId?: mongoose.Types.ObjectId;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const EmergencySchema: Schema = new Schema({
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['ambulance', 'police', 'fire', 'general'],
        default: 'ambulance'
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'resolved', 'cancelled'],
        default: 'pending'
    },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true },
        address: { type: String }
    },
    assignedAmbulanceId: { type: Schema.Types.ObjectId, ref: 'Unit' },
    assignedHospitalId: { type: Schema.Types.ObjectId, ref: 'User' },
    description: { type: String }
}, { timestamps: true });

EmergencySchema.index({ location: '2dsphere' });

export default mongoose.model<IEmergency>('Emergency', EmergencySchema);
