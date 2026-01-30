import axios from 'axios';

const API_URL = 'http://localhost:5000/api/locations';

export const getRealTimeHospitals = async (lat: number, lng: number, radius = 5000) => {
    try {
        const response = await axios.get(`${API_URL}/hospitals`, {
            params: { lat, lng, radius }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch real-time hospitals:', error);
        throw error;
    }
};
