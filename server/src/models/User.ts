import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    phone: string;
    role: 'patient' | 'doctor' | 'hospital_admin' | 'emergency_admin';
    avatar?: string;
    location?: {
        type: string;
        coordinates: number[];
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, required: true },
    role: {
        type: String,
        enum: ['patient', 'doctor', 'hospital_admin', 'emergency_admin'],
        default: 'patient'
    },
    avatar: { type: String },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    }
}, { timestamps: true });

UserSchema.index({ location: '2dsphere' });

export default mongoose.model<IUser>('User', UserSchema);
