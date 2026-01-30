import { Request, Response } from 'express';
import BloodRequest from '../models/BloodRequest';

// @desc    Create a blood request
// @route   POST /api/blood
// @access  Private
export const createBloodRequest = async (req: Request, res: Response) => {
    try {
        const { patientName, bloodType, hospital, age, phone, location, urgency } = req.body;
        const userId = (req as any).user.id;

        const newRequest = new BloodRequest({
            requesterId: userId,
            patientName,
            bloodType,
            hospital,
            age,
            phone,
            location: {
                type: 'Point',
                coordinates: location?.coordinates || [0, 0],
                address: location?.address || ''
            },
            urgency: urgency || 'critical'
        });

        const savedRequest = await newRequest.save();
        res.status(201).json(savedRequest);
    } catch (error) {
        console.error('Create Blood Request Error:', error);
        res.status(500).json({ message: 'Server error creating blood request' });
    }
};

// @desc    Get all active blood requests
// @route   GET /api/blood
// @access  Private
export const getBloodRequests = async (req: Request, res: Response) => {
    try {
        const requests = await BloodRequest.find({ status: 'active' })
            .populate('requesterId', 'name')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error('Fetch Blood Requests Error:', error);
        res.status(500).json({ message: 'Server error fetching blood requests' });
    }
};

// @desc    Respond to a request (Donor)
// @route   PUT /api/blood/:id/respond
// @access  Private
export const respondToRequest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        const request = await BloodRequest.findById(id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.donors.includes(userId)) {
            return res.status(400).json({ message: 'You have already responded to this request' });
        }

        request.donors.push(userId);
        await request.save();

        res.json({ message: 'Response recorded', request });
    } catch (error) {
        console.error('Respond Blood Request Error:', error);
        res.status(500).json({ message: 'Server error responding to request' });
    }
};

export const updateBloodRequestStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const request = await BloodRequest.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('requesterId', 'name phone');
        res.json(request);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
