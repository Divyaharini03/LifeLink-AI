"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lifelink';
mongoose_1.default.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));
// Routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const emergencyRoutes_1 = __importDefault(require("./routes/emergencyRoutes"));
const bloodRoutes_1 = __importDefault(require("./routes/bloodRoutes"));
const locationRoutes_1 = __importDefault(require("./routes/locationRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
app.use('/api/auth', authRoutes_1.default);
app.use('/api/emergencies', emergencyRoutes_1.default);
app.use('/api/blood', bloodRoutes_1.default);
app.use('/api/locations', locationRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.get('/', (req, res) => {
    res.send('LifeLink AI API is Running');
});
// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
