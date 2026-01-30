import { Request, Response } from 'express';
import EquipmentRequest from '../models/EquipmentRequest';
import TransferRequest from '../models/TransferRequest';

// Equipment Controllers
export const createEquipmentRequest = async (req: Request, res: Response) => {
    try {
        const { equipmentName, quantity, type, urgency, description } = req.body;
        const hospitalId = (req as any).user.id;

        const request = new EquipmentRequest({
            hospitalId,
            equipmentName,
            quantity,
            type,
            urgency,
            description
        });

        await request.save();
        res.status(201).json(request);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getEquipmentRequests = async (req: Request, res: Response) => {
    try {
        const requests = await EquipmentRequest.find()
            .populate('hospitalId', 'name phone location')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateEquipmentStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const request = await EquipmentRequest.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json(request);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Transfer Controllers
export const createTransferRequest = async (req: Request, res: Response) => {
    try {
        const { patientName, toHospitalId, reason, urgency, notes } = req.body;
        const fromHospitalId = (req as any).user.id;

        const request = new TransferRequest({
            fromHospitalId,
            patientName,
            toHospitalId,
            reason,
            urgency,
            notes
        });

        await request.save();
        res.status(201).json(request);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getTransferRequests = async (req: Request, res: Response) => {
    try {
        const requests = await TransferRequest.find()
            .populate('fromHospitalId', 'name phone')
            .populate('toHospitalId', 'name phone')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTransferStatus = async (req: Request, res: Response) => {
    try {
        const { status, toHospitalId } = req.body;
        const updateData: any = { status };
        if (toHospitalId) updateData.toHospitalId = toHospitalId;

        const request = await TransferRequest.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        res.json(request);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
