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
exports.updateTransferStatus = exports.getTransferRequests = exports.createTransferRequest = exports.getEquipmentRequests = exports.createEquipmentRequest = void 0;
const EquipmentRequest_1 = __importDefault(require("../models/EquipmentRequest"));
const TransferRequest_1 = __importDefault(require("../models/TransferRequest"));
// Equipment Controllers
const createEquipmentRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { equipmentName, quantity, type, urgency, description } = req.body;
        const hospitalId = req.user.id;
        const request = new EquipmentRequest_1.default({
            hospitalId,
            equipmentName,
            quantity,
            type,
            urgency,
            description
        });
        yield request.save();
        res.status(201).json(request);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createEquipmentRequest = createEquipmentRequest;
const getEquipmentRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requests = yield EquipmentRequest_1.default.find()
            .populate('hospitalId', 'name phone location')
            .sort({ createdAt: -1 });
        res.json(requests);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getEquipmentRequests = getEquipmentRequests;
// Transfer Controllers
const createTransferRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { patientName, toHospitalId, reason, urgency, notes } = req.body;
        const fromHospitalId = req.user.id;
        const request = new TransferRequest_1.default({
            fromHospitalId,
            patientName,
            toHospitalId,
            reason,
            urgency,
            notes
        });
        yield request.save();
        res.status(201).json(request);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createTransferRequest = createTransferRequest;
const getTransferRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requests = yield TransferRequest_1.default.find()
            .populate('fromHospitalId', 'name phone')
            .populate('toHospitalId', 'name phone')
            .sort({ createdAt: -1 });
        res.json(requests);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getTransferRequests = getTransferRequests;
const updateTransferStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const request = yield TransferRequest_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(request);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateTransferStatus = updateTransferStatus;
