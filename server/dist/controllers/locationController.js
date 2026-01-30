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
exports.getNearbyHospitals = void 0;
const axios_1 = __importDefault(require("axios"));
// @desc    Get nearby hospitals using Overpass API
// @route   GET /api/locations/hospitals
// @access  Public
const getNearbyHospitals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lat, lng, radius = 5000 } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ message: 'Latitude and Longitude are required' });
        }
        // Overpass QL - Optimized for speed
        const overpassUrl = 'https://overpass-api.de/api/interpreter';
        const query = `
            [out:json][timeout:25];
            (
                node["amenity"="hospital"](around:${radius},${lat},${lng});
                node["amenity"="doctors"](around:${radius},${lat},${lng});
                way["amenity"="hospital"](around:${radius},${lat},${lng});
            );
            out center;
        `;
        console.log(`[LocationService] Fetching facilities for ${lat}, ${lng}`);
        const response = yield axios_1.default.get(overpassUrl, {
            params: { data: query },
            timeout: 15000 // 15s timeout
        });
        if (!response.data || !response.data.elements) {
            return res.json([]);
        }
        const hospitals = response.data.elements.map((el) => {
            var _a, _b, _c, _d;
            return ({
                id: el.id,
                name: el.tags.name || (el.tags.amenity === 'hospital' ? 'General Hospital' : 'Medical Clinic'),
                address: el.tags['addr:street']
                    ? `${el.tags['addr:street']}, ${el.tags['addr:city'] || ''}`
                    : (el.tags['addr:full'] || 'Local Medical District'),
                phone: el.tags.phone || el.tags['contact:phone'] || 'Contact via emergency line',
                location: {
                    lat: el.lat || ((_a = el.center) === null || _a === void 0 ? void 0 : _a.lat),
                    lng: el.lon || ((_b = el.center) === null || _b === void 0 ? void 0 : _b.lon),
                },
                type: el.tags.amenity,
                beds: Math.floor(Math.random() * 40) + 2, // Mocked live beds
                distance: calculateDistance(Number(lat), Number(lng), el.lat || ((_c = el.center) === null || _c === void 0 ? void 0 : _c.lat), el.lon || ((_d = el.center) === null || _d === void 0 ? void 0 : _d.lng))
            });
        })
            .filter((h) => h.location.lat && h.location.lng)
            .sort((a, b) => a.distance - b.distance);
        res.json(hospitals);
    }
    catch (error) {
        console.error('[LocationService] Error:', error.message);
        // Return empy list rather than 500 to keep UI smooth
        res.json([]);
    }
});
exports.getNearbyHospitals = getNearbyHospitals;
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
