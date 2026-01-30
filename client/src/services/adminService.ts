import axios from 'axios';
import { getConfig } from './authService';

const API_URL = 'http://localhost:5000/api/admin';

// Equipment
export const createEquipmentRequest = async (data: any) => {
    const response = await axios.post(`${API_URL}/equipment`, data, getConfig());
    return response.data;
};

export const getEquipmentRequests = async () => {
    const response = await axios.get(`${API_URL}/equipment`, getConfig());
    return response.data;
};

export const updateEquipmentStatus = async (id: string, status: string) => {
    const response = await axios.patch(`${API_URL}/equipment/${id}`, { status }, getConfig());
    return response.data;
};

// Transfer
export const createTransferRequest = async (data: any) => {
    const response = await axios.post(`${API_URL}/transfer`, data, getConfig());
    return response.data;
};

export const getTransferRequests = async () => {
    const response = await axios.get(`${API_URL}/transfer`, getConfig());
    return response.data;
};

export const updateTransferStatus = async (id: string, status: string, toHospitalId?: string) => {
    const response = await axios.patch(`${API_URL}/transfer/${id}`, { status, toHospitalId }, getConfig());
    return response.data;
};
