"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bloodController_1 = require("../controllers/bloodController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.protect, bloodController_1.createBloodRequest);
router.get('/', authMiddleware_1.protect, bloodController_1.getBloodRequests);
router.put('/:id/respond', authMiddleware_1.protect, bloodController_1.respondToRequest);
exports.default = router;
