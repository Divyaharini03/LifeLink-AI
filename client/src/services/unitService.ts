import axios from 'axios';
import { getConfig } from './authService';

const API_URL = 'http://localhost:5000/api/units';

export const getUnits = async () => {
    const response = await axios.get(API_URL, getConfig());
    return response.data;
};

export const createUnit = async (data: any) => {
    const response = await axios.post(API_URL, data, getConfig());
    return response.data;
};

export const updateUnitStatus = async (id: string, data: any) => {
    const response = await axios.patch(`${API_URL}/${id}/status`, data, getConfig());
    return response.data;
};
