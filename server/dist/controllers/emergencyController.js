"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmergencies = exports.createEmergency = void 0;
const Emergency_1 = __importDefault(require("../models/Emergency"));
// @desc    Create a new emergency alert
// @route   POST /api/emergencies
// @access  Private (Patient only)
const createEmergency = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, location, description } = req.body;
        const userId = req.user.id; // User ID from middleware
        // Validate location
        if (!location || !location.coordinates || location.coordinates.length !== 2) {
            return res.status(400).json({ message: 'Valid location coordinates are required' });
        }
        // Create Emergency Record
        const emergency = new Emergency_1.default({
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
        const savedEmergency = yield emergency.save();
        // TODO: AI Logic to find nearest ambulance/hospital would trigger here
        // For now, we just return success
        res.status(201).json({
            message: 'Emergency alert sent successfully',
            emergency: savedEmergency
        });
    }
    catch (error) {
        console.error('Emergency Creation Error:', error);
        res.status(500).json({ message: 'Server error processing emergency' });
    }
});
exports.createEmergency = createEmergency;
// @desc    Get all emergencies (Admin/Doctor view)
// @route   GET /api/emergencies
// @access  Private (Admin/Doctor)
const getEmergencies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const emergencies = yield Emergency_1.default.find()
            .populate('patientId', 'name phone')
            .sort({ createdAt: -1 });
        res.json(emergencies);
    }
    catch (error) {
        console.error('Fetch Emergencies Error:', error);
        res.status(500).json({ message: 'Server error fetching emergencies' });
    }
});
exports.getEmergencies = getEmergencies;
