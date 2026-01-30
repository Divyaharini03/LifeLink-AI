import { Request, Response } from 'express';
import Unit from '../models/Unit';

export const createUnit = async (req: Request, res: Response) => {
    try {
        const unit = new Unit(req.body);
        await unit.save();
        res.status(201).json(unit);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getUnits = async (req: Request, res: Response) => {
    try {
        const units = await Unit.find().sort({ createdAt: -1 });
        res.json(units);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateUnitStatus = async (req: Request, res: Response) => {
    try {
        const { status, currentTask, location } = req.body;
        const unit = await Unit.findByIdAndUpdate(
            req.params.id,
            { status, currentTask, location },
            { new: true }
        );
        res.json(unit);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
