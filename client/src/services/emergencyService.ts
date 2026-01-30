import axios from 'axios';
import { getConfig } from './authService';

const API_URL = 'http://localhost:5000/api/emergencies';

export const getEmergencies = async () => {
    const response = await axios.get(API_URL, getConfig());
    return response.data;
};

export const createEmergency = async (data: any) => {
    const response = await axios.post(API_URL, data, getConfig());
    return response.data;
};

export const updateEmergencyStatus = async (id: string, status: string, unitId?: string) => {
    const response = await axios.patch(`${API_URL}/${id}`, { status, unitId }, getConfig());
    return response.data;
};
