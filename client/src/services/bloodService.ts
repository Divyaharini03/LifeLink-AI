import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getConfig = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const createBloodRequest = async (requestData: any) => {
    const response = await axios.post(`${API_URL}/blood`, requestData, getConfig());
    return response.data;
};

export const getBloodRequests = async () => {
    const response = await axios.get(`${API_URL}/blood`, getConfig());
    return response.data;
};

export const respondToBloodRequest = async (requestId: string) => {
    const response = await axios.put(`${API_URL}/blood/${requestId}/respond`, {}, getConfig());
    return response.data;
};

export const updateBloodRequestStatus = async (id: string, status: string) => {
    const response = await axios.patch(`${API_URL}/blood/${id}/status`, { status }, getConfig());
    return response.data;
};
