import api from './axios';

export const getAllEquipment = async () => {
  const res = await api.get('/api/equipment');
  return res.data;
};

export const createEquipment = async (equipment) => {
  const res = await api.post('/api/equipment', equipment);
  return res.data;
};

export const updateEquipment = async (id, equipment) => {
  const res = await api.put(`/api/equipment/${id}`, equipment);
  return res.data;
};

export const deleteEquipment = async (id) => {
  const res = await api.delete(`/api/equipment/${id}`);
  return res.data;
};

export const getAvailableEquipment = async () => {
  const res = await api.get('/api/equipment');
  return res.data.filter(eq => eq.status === 'available');
};

export const requestBorrow = async ({ equipment_id, notes, due_date }) => {
  const res = await api.post('/api/borrowed/request', { equipment_id, notes, due_date });
  return res.data;
};

export const cancelBorrowRequest = async (id) => {
  const res = await api.delete(`/api/borrowed/${id}`);
  return res.data;
};

export const getEquipmentMap = async () => {
  const res = await api.get('/api/equipment');
  const map = {};
  res.data.forEach(eq => { map[eq.id] = eq; });
  return map;
};

export const getEquipmentById = async (id) => {
  const res = await api.get(`/api/equipment/${id}`);
  return res.data;
};

export const getPendingBorrowRequests = async () => {
  const res = await api.get('/api/borrowed/pending');
  return res.data;
};

export const approveBorrowRequest = async (id) => {
  const res = await api.put(`/api/borrowed/approve/${id}`);
  return res.data;
};

export const rejectBorrowRequest = async (id) => {
  const res = await api.put(`/api/borrowed/reject/${id}`);
  return res.data;
};

export const fetchPendingBorrowRequests = async () => {
  const res = await api.get('/api/borrowed/pending');
  return res.data;
}; 