import mongoose, { Schema, Document } from 'mongoose';

export interface IUnit extends Document {
    name: string;
    type: 'ambulance' | 'mobile_clinic' | 'rescue_vehicle';
    status: 'available' | 'on_call' | 'busy' | 'maintenance';
    location: {
        type: string;
        coordinates: number[];
        address?: string;
    };
    currentTask?: string;
    personnel: string[];
    phone: string;
    createdAt: Date;
    updatedAt: Date;
}

const UnitSchema: Schema = new Schema({
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ['ambulance', 'mobile_clinic', 'rescue_vehicle'],
        default: 'ambulance'
    },
    status: {
        type: String,
        enum: ['available', 'on_call', 'busy', 'maintenance'],
        default: 'available'
    },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true },
        address: { type: String }
    },
    currentTask: { type: String },
    personnel: [{ type: String }],
    phone: { type: String, required: true }
}, { timestamps: true });

UnitSchema.index({ location: '2dsphere' });

export default mongoose.model<IUnit>('Unit', UnitSchema);
