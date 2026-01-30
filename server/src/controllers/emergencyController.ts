import { Request, Response } from 'express';
import Emergency from '../models/Emergency';
import User from '../models/User';

// @desc    Create a new emergency alert
// @route   POST /api/emergencies
// @access  Private (Patient only)
export const createEmergency = async (req: Request, res: Response) => {
    try {
        const { type, location, description } = req.body;
        const userId = (req as any).user.id; // User ID from middleware

        // Validate location
        if (!location || !location.coordinates || location.coordinates.length !== 2) {
            return res.status(400).json({ message: 'Valid location coordinates are required' });
        }

        // Create Emergency Record
        const emergency = new Emergency({
            patientId: userId,
            type: type || 'ambulance',
            severity: 'critical', // Default to critical for SOS
            status: 'pending',
            location: {
                type: 'Point',
                coordinates: location.coordinates, // [long, lat]
                address: location.address
            },
            description
        });

        const savedEmergency = await emergency.save();

        // TODO: AI Logic to find nearest ambulance/hospital would trigger here
        // For now, we just return success

        res.status(201).json({
            message: 'Emergency alert sent successfully',
            emergency: savedEmergency
        });
    } catch (error) {
        console.error('Emergency Creation Error:', error);
        res.status(500).json({ message: 'Server error processing emergency' });
    }
};

// @desc    Get all emergencies (Admin/Doctor view)
// @route   GET /api/emergencies
// @access  Private (Admin/Doctor)
export const getEmergencies = async (req: Request, res: Response) => {
    try {
        const emergencies = await Emergency.find()
            .populate('patientId', 'name phone')
            .sort({ createdAt: -1 });
        res.json(emergencies);
    } catch (error) {
        console.error('Fetch Emergencies Error:', error);
        res.status(500).json({ message: 'Server error fetching emergencies' });
    }
}

export const updateEmergencyStatus = async (req: Request, res: Response) => {
    try {
        const { status, remarks, unitId } = req.body;

        const updateData: any = { status };
        if (remarks) updateData.remarks = remarks;

        if (unitId && status === 'assigned') {
            updateData.assignedAmbulanceId = unitId;
        }

        // If emergency is cancelled or resolved, release the assigned unit
        const currentEmergency = await Emergency.findById(req.params.id);
        if (currentEmergency && (status === 'cancelled' || status === 'resolved')) {
            if (currentEmergency.assignedAmbulanceId) {
                // Using mongoose.model to avoid potential import issues during runtime
                const mongoose = require('mongoose');
                const Unit = mongoose.model('Unit');
                await Unit.findByIdAndUpdate(currentEmergency.assignedAmbulanceId, {
                    status: 'available',
                    currentTask: 'Awaiting Dispatch'
                });
            }
        }

        const emergency = await Emergency.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('patientId', 'name phone')
            .populate('assignedAmbulanceId', 'name type phone status');

        res.json(emergency);
    } catch (error) {
        console.error('Update Emergency Status Error:', error);
        res.status(500).json({ message: 'Server error updating emergency' });
    }
};
