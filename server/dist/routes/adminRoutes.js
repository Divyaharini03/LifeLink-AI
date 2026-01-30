"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminController_1 = require("../controllers/adminController");
const router = express_1.default.Router();
// Equipment routes
router.post('/equipment', authMiddleware_1.protect, adminController_1.createEquipmentRequest);
router.get('/equipment', authMiddleware_1.protect, adminController_1.getEquipmentRequests);
// Transfer routes
router.post('/transfer', authMiddleware_1.protect, adminController_1.createTransferRequest);
router.get('/transfer', authMiddleware_1.protect, adminController_1.getTransferRequests);
router.patch('/transfer/:id', authMiddleware_1.protect, adminController_1.updateTransferStatus);
exports.default = router;
