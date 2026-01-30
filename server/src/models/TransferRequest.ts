import mongoose, { Schema, Document } from 'mongoose';

export interface ITransferRequest extends Document {
    patientId?: mongoose.Types.ObjectId;
    patientName: string;
    fromHospitalId: mongoose.Types.ObjectId;
    toHospitalId?: mongoose.Types.ObjectId; // Optional if broadcasting
    reason: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'accepted' | 'completed' | 'cancelled';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const TransferRequestSchema: Schema = new Schema({
    patientId: { type: Schema.Types.ObjectId, ref: 'User' },
    patientName: { type: String, required: true },
    fromHospitalId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    toHospitalId: { type: Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String, required: true },
    urgency: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'completed', 'cancelled'],
        default: 'pending'
    },
    notes: { type: String }
}, { timestamps: true });

export default mongoose.model<ITransferRequest>('TransferRequest', TransferRequestSchema);
