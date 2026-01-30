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
exports.respondToRequest = exports.getBloodRequests = exports.createBloodRequest = void 0;
const BloodRequest_1 = __importDefault(require("../models/BloodRequest"));
// @desc    Create a blood request
// @route   POST /api/blood
// @access  Private
const createBloodRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { patientName, bloodType, hospital, age, phone, location, urgency } = req.body;
        const userId = req.user.id;
        const newRequest = new BloodRequest_1.default({
            requesterId: userId,
            patientName,
            bloodType,
            hospital,
            age,
            phone,
            location: {
                type: 'Point',
                coordinates: (location === null || location === void 0 ? void 0 : location.coordinates) || [0, 0],
                address: (location === null || location === void 0 ? void 0 : location.address) || ''
            },
            urgency: urgency || 'critical'
        });
        const savedRequest = yield newRequest.save();
        res.status(201).json(savedRequest);
    }
    catch (error) {
        console.error('Create Blood Request Error:', error);
        res.status(500).json({ message: 'Server error creating blood request' });
    }
});
exports.createBloodRequest = createBloodRequest;
// @desc    Get all active blood requests
// @route   GET /api/blood
// @access  Private
const getBloodRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requests = yield BloodRequest_1.default.find({ status: 'active' })
            .populate('requesterId', 'name')
            .sort({ createdAt: -1 });
        res.json(requests);
    }
    catch (error) {
        console.error('Fetch Blood Requests Error:', error);
        res.status(500).json({ message: 'Server error fetching blood requests' });
    }
});
exports.getBloodRequests = getBloodRequests;
// @desc    Respond to a request (Donor)
// @route   PUT /api/blood/:id/respond
// @access  Private
const respondToRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const request = yield BloodRequest_1.default.findById(id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        if (request.donors.includes(userId)) {
            return res.status(400).json({ message: 'You have already responded to this request' });
        }
        request.donors.push(userId);
        yield request.save();
        res.json({ message: 'Response recorded', request });
    }
    catch (error) {
        console.error('Respond Blood Request Error:', error);
        res.status(500).json({ message: 'Server error responding to request' });
    }
});
exports.respondToRequest = respondToRequest;
