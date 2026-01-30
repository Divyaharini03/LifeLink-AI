import mongoose, { Schema, Document } from 'mongoose';

export interface IEquipmentRequest extends Document {
    hospitalId: mongoose.Types.ObjectId;
    equipmentName: string;
    quantity: number;
    type: 'need' | 'offer';
    urgency: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'fullfilled' | 'cancelled';
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const EquipmentRequestSchema: Schema = new Schema({
    hospitalId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    equipmentName: { type: String, required: true },
    quantity: { type: Number, required: true },
    type: { type: String, enum: ['need', 'offer'], required: true },
    urgency: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'fullfilled', 'cancelled'],
        default: 'pending'
    },
    description: { type: String }
}, { timestamps: true });

export default mongoose.model<IEquipmentRequest>('EquipmentRequest', EquipmentRequestSchema);
