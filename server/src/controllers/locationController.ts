import axios from 'axios';
import { Request, Response } from 'express';

// @desc    Get nearby hospitals using Overpass API
// @route   GET /api/locations/hospitals
// @access  Public
export const getNearbyHospitals = async (req: Request, res: Response) => {
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

        const response = await axios.get(overpassUrl, {
            params: { data: query },
            timeout: 15000 // 15s timeout
        });

        if (!response.data || !response.data.elements) {
            return res.json([]);
        }

        const hospitals = response.data.elements.map((el: any) => ({
            id: el.id,
            name: el.tags.name || (el.tags.amenity === 'hospital' ? 'General Hospital' : 'Medical Clinic'),
            address: el.tags['addr:street']
                ? `${el.tags['addr:street']}, ${el.tags['addr:city'] || ''}`
                : (el.tags['addr:full'] || 'Local Medical District'),
            phone: el.tags.phone || el.tags['contact:phone'] || 'Contact via emergency line',
            location: {
                lat: el.lat || el.center?.lat,
                lng: el.lon || el.center?.lon,
            },
            type: el.tags.amenity,
            beds: Math.floor(Math.random() * 40) + 2, // Mocked live beds
            distance: calculateDistance(
                Number(lat),
                Number(lng),
                el.lat || el.center?.lat,
                el.lon || el.center?.lng
            )
        }))
            .filter((h: any) => h.location.lat && h.location.lng)
            .sort((a: any, b: any) => a.distance - b.distance);

        res.json(hospitals);
    } catch (error: any) {
        console.error('[LocationService] Error:', error.message);
        // Return empy list rather than 500 to keep UI smooth
        res.json([]);
    }
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}
